import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html'
})

export class RegisterComponent {
  user: User = {
    email: '',
    password: '',
    username: '',
    bio: '',
    country: ''
  };

  router = inject(Router);

  isSubmitting = false;

  constructor(private userService: UserService) {}

  onSubmit() {
    if (!this.user.email || !this.user.password || !this.user.username) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    this.isSubmitting = true;

    this.userService.create(this.user).subscribe({
      next: (res) => {
        alert(`Usuário ${res.username} criado com sucesso! Faça login para continuar.`);
        this.isSubmitting = false;
        this.router.navigate(['/login']);
      },
      error: () => {
        alert('Erro ao registrar usuário.');
        this.isSubmitting = false;
      }
    });
  }

  onClose() {
    this.router.navigate(['/']);
  }

  openLogin() {
    this.router.navigate(['/login']);
  }
}
