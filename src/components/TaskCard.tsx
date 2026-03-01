import React from 'react';
import { Calendar, User, Clock, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { Task, Priority } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface TaskCardProps {
  key?: string | number;
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  high: 'bg-rose-50 text-rose-700 border-rose-100',
};

export function TaskCard({ task, onEdit, onDelete, onDragStart }: TaskCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(e, task.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={handleDragStart}
      className="group cursor-grab active:cursor-grabbing"
    >
      <Card className="p-4 border-slate-200 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md">
        <div className="flex justify-between items-start mb-2">
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
            priorityColors[task.priority]
          )}>
            {task.priority}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(task)}>
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(task.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <h4 className="font-semibold text-slate-900 mb-1 line-clamp-2 leading-tight">
          {task.title}
        </h4>
        <p className="text-xs text-slate-500 mb-4 line-clamp-3 leading-relaxed">
          {task.description}
        </p>

        <div className="flex flex-wrap gap-3 mt-auto pt-3 border-t border-slate-50">
          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
          {task.assignee && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {task.assignee}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
