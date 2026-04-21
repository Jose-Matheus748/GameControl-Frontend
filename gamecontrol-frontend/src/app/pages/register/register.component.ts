import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginDTO } from '../../models/login-dto.model';
import { CreateUsuarioDTO } from '../../models/usuario.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  user: CreateUsuarioDTO = {
    email: '',
    password: '',
    username: '',
  };

  router = inject(Router);
  private authService = inject(AuthService);

  isSubmitting = false;

  constructor(private userService: UsuarioService) {}

  onSubmit() {
    if (!this.user.email || !this.user.password || !this.user.username) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    this.isSubmitting = true;

    this.userService.create(this.user).subscribe({
      next: () => {
        const loginDTO: LoginDTO = {
          email: this.user.email,
          password: this.user.password
        };

        this.authService.login(loginDTO).subscribe({
          next: (res) => {
            alert(`Bem-vindo, ${res.user.username}!`);
            this.isSubmitting = false;
            this.router.navigate(['/']);
          },
          error: () => {
            alert('Conta criada, mas houve erro no login automático.');
            this.isSubmitting = false;
            this.router.navigate(['/login']);
          }
        });
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
