import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoginDTO } from '../../models/login-dto.model';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html'
})

export class LoginComponent {
  email = '';
  password = '';
  isSubmitting = false;

  router = inject(Router);
  private authService = inject(AuthService);

  onSubmit() {
    if (!this.email || !this.password) {
      alert('Preencha todos os campos!');
      return;
    }

    this.isSubmitting = true;

    const loginDTO: LoginDTO = { email: this.email, password: this.password };

    this.authService.login(loginDTO).subscribe({
      next: (res) => {
        alert(`Bem-vindo, ${res.user.username}!`);

        localStorage.setItem('token', res.token);
        if (res.user?.id != null) {
          localStorage.setItem('userId', res.user.id.toString());
        }

        this.isSubmitting = false;
        this.router.navigate(['/']);
      },
      error: () => {
        alert('Email ou senha incorretos.');
        this.isSubmitting = false;
      }
    });
  }

  openRegisterModal() {
    this.router.navigate(['/register']);
  }
}
