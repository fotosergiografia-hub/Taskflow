import React from 'react';
import { Task, Status, COLUMNS } from '../types';
import { Column } from './Column';
import { motion } from 'motion/react';

interface DashboardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (status: Status) => void;
  onMoveTask: (taskId: string, newStatus: Status) => void;
}

export function Dashboard({ 
  tasks, 
  onEditTask, 
  onDeleteTask, 
  onAddTask,
  onMoveTask 
}: DashboardProps) {
  
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (e: React.DragEvent, status: Status) => {
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onMoveTask(taskId, status);
    }
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 h-full min-h-[600px] custom-scrollbar">
      {COLUMNS.map(column => (
        <Column
          key={column.id}
          status={column.id}
          title={column.title}
          tasks={tasks.filter(t => t.status === column.id)}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onAddTask={onAddTask}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
        />
      ))}
    </div>
  );
}
