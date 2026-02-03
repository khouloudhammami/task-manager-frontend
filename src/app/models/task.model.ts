// src/app/models/task.model.ts
export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category?: string;
}

export interface TaskRequest {
  title: string;
  description: string;
  completed: boolean;
  priority: string;
  category?: string;
}