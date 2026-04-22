import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario, UsuarioService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { LucideDoorOpen, LucideUserRound } from '@lucide/angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideDoorOpen,
    LucideUserRound,
  ],
  templateUrl: './user-settings.component.html'
})
export class SettingsComponent implements OnInit {
  userData: Usuario = {
    email: '',
    password: '',
    username: '',
    bio: '',
    country: '',
    profilePictureUrl: ''
  };

  selectedFile?: File;
  currentUserId = '';
  previewUrl: string | null = null;
  loading = true;

  private userService = inject(UsuarioService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.initializeUser();
  }

  private initializeUser(): void {
    if (typeof window === 'undefined') {
      this.loading = false;
      return;
    }

    const currentUser = this.authService.user();

    if (currentUser?.id) {
      this.setUserData(currentUser);
      return;
    }

    const storedUserId = localStorage.getItem('userId');

    if (!storedUserId) {
      this.redirectToLogin();
      return;
    }

    this.currentUserId = storedUserId;
    this.fetchUser();
  }

  private fetchUser(): void {
    this.loading = true;

    this.userService.getById(this.currentUserId).subscribe({
      next: (user) => {
        this.setUserData(user);
        this.authService.user.set(user);
      },
      error: (err) => {
        console.error('Erro ao carregar usuário:', err);
        this.redirectToLogin();
      }
    });
  }

  private setUserData(user: Usuario): void {
    this.currentUserId = user.id?.toString() ?? '';
    this.userData = { ...user };
    this.loading = false;

    this.cdr.detectChanges();
  }

  private redirectToLogin(): void {
    this.loading = false;
    this.cdr.detectChanges();
    this.router.navigate(['/login']);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    this.selectedFile = input.files[0];

    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.previewUrl = URL.createObjectURL(this.selectedFile);
  }

  saveChanges(): void {
    const payload = {
      username: this.userData.username,
      bio: this.userData.bio,
      country: this.userData.country
    };

    this.userService.update(this.currentUserId, payload).subscribe({
      next: (updatedUser) => {
        this.setUserData(updatedUser);
        this.authService.user.set(updatedUser);
        alert('Perfil atualizado com sucesso!');
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        console.error('Erro ao atualizar perfil:', err);
        alert('Não foi possível atualizar o perfil!');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
