import React, { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import { Button } from './ui/Button';
import { extractTextFromPdf } from '../services/pdfService';
import { extractTasksFromText } from '../services/geminiService';
import { Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface FileUploaderProps {
  onTasksExtracted: (tasks: Partial<Task>[]) => void;
}

export function FileUploader({ onTasksExtracted }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const text = await extractTextFromPdf(file);
      if (!text.trim()) {
        throw new Error('Could not extract text from this PDF. It might be an image-only PDF.');
      }
      const tasks = await extractTasksFromText(text);
      onTasksExtracted(tasks);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while processing the PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 transition-all flex flex-col items-center justify-center text-center",
          isDragging ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300",
          isLoading && "pointer-events-none opacity-80"
        )}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">Analyzing PDF...</h3>
              <p className="text-slate-500 mt-1">Extracting tasks with AI</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <Upload className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Upload your project PDF</h3>
              <p className="text-slate-500 mb-8 max-w-sm">
                Drag and drop your PDF here, or click to browse. We'll automatically extract tasks for you.
              </p>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="application/pdf"
                  onChange={onFileChange}
                />
                <Button variant="primary" size="lg" className="pointer-events-none">
                  Select PDF File
                </Button>
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-xl flex items-start gap-3 text-left border border-red-100">
            <X className="w-5 h-5 text-red-600 mt-0.5 shrink-0" onClick={() => setError(null)} />
            <div>
              <p className="text-sm font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
