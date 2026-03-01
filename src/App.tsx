import { useState, useEffect, useCallback } from 'react';
import { Layout, Plus, Download, Trash2, FileJson, FileText, Settings, LogOut, Search, Filter } from 'lucide-react';
import { Task, Status, Priority } from './types';
import { FileUploader } from './components/FileUploader';
import { Dashboard } from './components/Dashboard';
import { TaskModal } from './components/TaskModal';
import { Button } from './components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';

const STORAGE_KEY = 'pdf_task_dashboard_tasks';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<Status>('todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isInitialized]);

  const handleTasksExtracted = (extractedTasks: Partial<Task>[]) => {
    const newTasks: Task[] = extractedTasks.map(t => ({
      id: Math.random().toString(36).substr(2, 9),
      title: t.title || 'Untitled Task',
      description: t.description || '',
      dueDate: t.dueDate || '',
      assignee: t.assignee || '',
      priority: (t.priority as Priority) || 'medium',
      status: 'todo',
      createdAt: Date.now(),
    }));
    setTasks(prev => [...prev, ...newTasks]);
  };

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    } else {
      setTasks(prev => [...prev, task]);
    }
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleMoveTask = (taskId: string, newStatus: Status) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleAddTask = (status: Status = 'todo') => {
    setInitialStatus(status);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tasks_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportToPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Project Task Dashboard', 20, 20);
    
    doc.setFontSize(12);
    let y = 40;
    
    tasks.forEach((task, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${task.title} (${task.status.toUpperCase()})`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`Priority: ${task.priority} | Due: ${task.dueDate || 'N/A'} | Assignee: ${task.assignee || 'N/A'}`, 20, y + 7);
      doc.text(task.description, 20, y + 14, { maxWidth: 170 });
      y += 30;
    });
    
    doc.save('tasks_report.pdf');
  };

  const clearAllTasks = () => {
    if (confirm('Are you sure you want to clear all tasks? This cannot be undone.')) {
      setTasks([]);
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.assignee.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">TaskFlow AI</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">PDF to Dashboard</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-12 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search tasks, descriptions, or people..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 rounded-xl py-2 pl-10 pr-4 text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 mr-4 pr-4 border-r border-slate-200">
              <Button variant="ghost" size="sm" className="gap-2" onClick={exportToJson}>
                <FileJson className="w-4 h-4" />
                JSON
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" onClick={exportToPdf}>
                <FileText className="w-4 h-4" />
                PDF
              </Button>
            </div>
            <Button variant="primary" size="sm" className="gap-2" onClick={() => handleAddTask()}>
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-6 py-8 overflow-hidden">
        {tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <FileUploader onTasksExtracted={handleTasksExtracted} />
              <div className="mt-12 flex items-center justify-center gap-8 text-slate-400">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center">1</div>
                  <span className="text-xs font-semibold uppercase tracking-wider">Upload PDF</span>
                </div>
                <div className="w-12 h-px bg-slate-200"></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center">2</div>
                  <span className="text-xs font-semibold uppercase tracking-wider">AI Analysis</span>
                </div>
                <div className="w-12 h-px bg-slate-200"></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center">3</div>
                  <span className="text-xs font-semibold uppercase tracking-wider">Manage Tasks</span>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Project Dashboard</h2>
                <p className="text-slate-500 text-sm">Manage your extracted tasks and track progress.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Add Manual Task
                </Button>
                <Button variant="danger" size="sm" className="gap-2" onClick={clearAllTasks}>
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              </div>
            </div>

            <Dashboard 
              tasks={filteredTasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
              onMoveTask={handleMoveTask}
            />
          </div>
        )}
      </main>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        initialStatus={initialStatus}
      />

      <footer className="bg-white border-t border-slate-200 py-4 px-6">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <p>© 2026 TaskFlow AI • Powered by Gemini</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
