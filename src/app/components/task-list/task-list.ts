// src/app/components/task-list/task-list.component.ts
import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading = false;
  error = '';
  
  // Filtres
  filterStatus: string = 'all'; // 'all', 'completed', 'pending'
  filterPriority: string = 'all';
  searchKeyword: string = '';

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des tâches';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      // Filtre par statut
      if (this.filterStatus === 'completed' && !task.completed) return false;
      if (this.filterStatus === 'pending' && task.completed) return false;
      
      // Filtre par priorité
      if (this.filterPriority !== 'all' && task.priority !== this.filterPriority) return false;
      
      // Recherche par mot-clé
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        return task.title.toLowerCase().includes(keyword) || 
               task.description.toLowerCase().includes(keyword);
      }
      
      return true;
    });
  }

  deleteTask(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(task => task.id !== id);
          this.applyFilters();
        }
      });
    }
  }

  onStatusChange(task: Task): void {
    this.taskService.updateTask(task.id, {
      title: task.title,
      description: task.description,
      completed: !task.completed,
      priority: task.priority,
      category: task.category
    }).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
          this.applyFilters();
        }
      }
    });
  }
}