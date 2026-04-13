import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Usuario, UsuarioService } from '../../services/user.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LucideDoorOpen } from '@lucide/angular';
import { LucideUserRound } from '@lucide/angular';
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideDoorOpen, LucideUserRound],
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
  currentUserId: string = '';
  previewUrl: string | null = null;

  private userService = inject(UsuarioService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    const currentUser = this.authService.user();

    if (currentUser) {
      this.userData = { ...currentUser };
      this.currentUserId = currentUser.id!.toString();
    } else {
      this.router.navigate(['/login']);
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files?.length) {
      this.selectedFile = input.files[0];

      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
      }

      this.previewUrl = URL.createObjectURL(this.selectedFile);
    }
  }

  saveChanges() {
    const payload = {
      username: this.userData.username,
      bio: this.userData.bio,
      country: this.userData.country
    };

    this.userService.update(this.currentUserId, payload).subscribe({
      next: (updatedUser) => {
        this.userData = updatedUser;

        this.authService.user.set(updatedUser);

        alert('Perfil atualizado com sucesso!');
      },
      error: (err) => {
        console.error('Erro ao atualizar perfil:', err);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
