import React from 'react';
import { Task, Status, COLUMNS } from '../types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ColumnProps {
  key?: string | number;
  status: Status;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (status: Status) => void;
  onDrop: (e: React.DragEvent, status: Status) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

export function Column({ 
  status, 
  title, 
  tasks, 
  onEditTask, 
  onDeleteTask, 
  onAddTask,
  onDrop,
  onDragStart
}: ColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    onDrop(e, status);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex flex-col w-full min-w-[300px] h-full bg-slate-50/50 rounded-2xl border border-slate-200/50 p-4"
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{title}</h3>
          <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onAddTask(status)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
        <AnimatePresence mode="popLayout">
          {tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={onEditTask} 
              onDelete={onDeleteTask}
              onDragStart={onDragStart}
            />
          ))}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm italic">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  );
}
