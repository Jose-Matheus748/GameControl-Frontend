import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/user.service';
import { Usuario, UpdateUsuarioDTO } from '../../models/usuario.model';
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
  userData: UpdateUsuarioDTO = {
    username: '',
    bio: '',
    country: '',
    profilePictureUrl: ''
  };

  selectedFile?: File;
  previewUrl: string | null = null;
  loading = true;

  private userService = inject(UsuarioService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  get currentUserId(): string | undefined {
    return this.authService.user()?.id;
  }

  ngOnInit(): void {
    this.initializeUser();
  }

  private initializeUser(): void {
    if (typeof window === 'undefined') {
      this.loading = false;
      return;
    }

    const currentUser = this.authService.user();

    if (currentUser && currentUser.id) {
      this.setUserData(currentUser);
      return;
    }

    const storedUserId = localStorage.getItem('userId');

    if (!storedUserId) {
      this.redirectToLogin();
      return;
    }

    this.fetchUser(storedUserId);
  }

  private fetchUser(userId: string): void {
    this.loading = true;

    this.userService.getById(userId).subscribe({
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
    if (!user.id) {
      console.error('Usuário sem ID!');
      this.redirectToLogin();
      return;
    }
  
    this.userData = {
      username: user.username,
      bio: user.bio,
      country: user.country,
      profilePictureUrl: user.profilePictureUrl
    };
  
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
    const userId = this.currentUserId;

    if (!userId) {
      console.error('ID do usuário não encontrado');
      this.redirectToLogin();
      return;
    }

    const payload = {
      username: this.userData.username,
      bio: this.userData.bio,
      country: this.userData.country
    };

    this.userService.update(userId, payload).subscribe({
      next: (updatedUser) => {
        this.setUserData(updatedUser);
        this.authService.user.set(updatedUser);
        alert('Perfil atualizado com sucesso!');
        this.router.navigate(['/user', userId]);
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
