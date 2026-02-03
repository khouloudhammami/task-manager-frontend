import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  
  taskForm: FormGroup;
  isEditMode = false;
  taskId?: number;
  loading = false;
  
  priorities = [
    { value: 'LOW', label: 'Basse' },
    { value: 'MEDIUM', label: 'Moyenne' },
    { value: 'HIGH', label: 'Haute' },
    { value: 'URGENT', label: 'Urgente' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private toastr: ToastrService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(1000)]],
      priority: ['MEDIUM', Validators.required],
      category: [''],
      completed: [false]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.taskId = +params['id'];
        this.loadTask();
      }
    });
  }

  loadTask(): void {
    if (!this.taskId) return;
    
    this.loading = true;
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (task) => {
        this.taskForm.patchValue({
          title: task.title,
          description: task.description,
          priority: task.priority,
          category: task.category,
          completed: task.completed
        });
        this.loading = false;
      },
      error: () => {
        this.toastr.error('Impossible de charger la tâche');
        this.router.navigate(['/tasks']);
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.markFormGroupTouched(this.taskForm);
      return;
    }

    this.loading = true;
    const taskData = this.taskForm.value;

    if (this.isEditMode && this.taskId) {
      this.taskService.updateTask(this.taskId, taskData).subscribe({
        next: () => {
          this.toastr.success('Tâche mise à jour avec succès');
          this.router.navigate(['/tasks']);
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      this.taskService.createTask(taskData).subscribe({
        next: () => {
          this.toastr.success('Tâche créée avec succès');
          this.router.navigate(['/tasks']);
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get title() { return this.taskForm.get('title'); }
  get description() { return this.taskForm.get('description'); }
  get priority() { return this.taskForm.get('priority'); }
}