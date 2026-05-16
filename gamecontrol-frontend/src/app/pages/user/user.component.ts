import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { catchError, forkJoin, of } from 'rxjs';
import { UsuarioService, Usuario } from '../../services/user.service';
import { Playlist, PLAYLISTS_API_BASE, PlaylistService } from '../../services/playlist.service';
import { CollabFormComponent } from '../../components/collab-form/collab-form.component';
import { AddGameComponent } from '../../components/add-game/add-game.component';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';
import { PlaylistSectionComponent } from '../../components/playlist-section/playlist-section';
import { LucideUserRound, LucideUsers, LucideMapPin, LucideSettings } from '@lucide/angular';
import { PostUserPageComponent } from "../../components/post-user-page/post-user-page";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AddGameComponent,
    LucideUserRound,
    LucideMapPin,
    LucideSettings,
    PostUserPageComponent
],
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit {
  userData?: Usuario;
  userId!: string;
  loggedUserId: string | null = null;
  followersCount = 0;
  followingCount = 0;
  loading = true;
  isAdmin = false;
  addJogoAberto = false;

  creating = false;
  saving = false;

  editNome = '';

  previewUrl: string | null = null;
  selectedProfileFile: File | null = null;

  playlists: Playlist[] = [];

  deleteModalOpen = false;
  playlistToDelete: string | null = null;

  socialModalOpen = false;
  socialModalTab: 'followers' | 'following' = 'followers';
  socialModalLoading = false;
  usernameById: Record<string, string> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UsuarioService,
    private playlistService: PlaylistService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      this.loggedUserId = globalThis.localStorage.getItem('userId');
    }

    this.route.paramMap.subscribe((pm) => {
      const fromRoute = pm.get('id')?.trim() ?? '';
      const fromStorage = globalThis.localStorage?.getItem('userId')?.trim() ?? '';

      this.userId = fromRoute || fromStorage;
      if (!this.userId) {
        void this.router.navigate(['/login']);
        return;
      }
      this.loadUser();
    });
  }

  loadUser() {
    this.loading = true;

    if (!this.userId) {
      console.error('userId inválido:', this.userId);
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    forkJoin({
      user: this.userService.getById(this.userId),
      playlists: this.playlistService.getPlaylistsByUser(this.userId)
    }).subscribe({
      next: ({ user, playlists }) => {
        this.userData = user;
        this.isAdmin = user.role === 'ADMIN';
        this.followersCount = (user.followers ?? []).length;
        this.followingCount = (user.following ?? []).length;
        this.playlists = playlists;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar usuário:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openSocialModal(tab: 'followers' | 'following'): void {
    this.socialModalTab = tab;
    this.socialModalOpen = true;
    this.socialModalLoading = true;
    this.userService.getAll().subscribe({
      next: (users) => {
        const map: Record<string, string> = {};
        for (const u of users) {
          if (u.id != null) {
            map[String(u.id)] = u.username?.trim() || String(u.id);
          }
        }
        this.usernameById = map;
        this.socialModalLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.socialModalLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  closeSocialModal(): void {
    this.socialModalOpen = false;
  }

  displayUsernameForId(id: string): string {
    return this.usernameById[id] ?? id;
  }

  get socialListIds(): string[] {
    if (!this.userData) {
      return [];
    }
    const ids =
      this.socialModalTab === 'followers' ? this.userData.followers : this.userData.following;
    return [...(ids ?? [])];
  }

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.toast.erro('Selecione um arquivo de imagem válido.');
      return;
    }

    this.selectedProfileFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.previewUrl = base64;
      this.cdr.detectChanges();

      this.userService.uploadProfilePicture(this.userId, base64).subscribe({
        next: (updatedUser: Usuario) => {
          this.userData = updatedUser;
          this.selectedProfileFile = null;
          this.toast.sucesso('Foto de perfil atualizada!');
          this.cdr.detectChanges();
        },
        error: (err: unknown) => {
          console.error('Erro ao enviar foto de perfil:', err);
          this.toast.erro('Não foi possível salvar a foto de perfil.');
          this.previewUrl = null;
          this.selectedProfileFile = null;
          this.cdr.detectChanges();
        }
      });
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  criarPlaylist() {
    this.editNome = '';
    this.creating = true;
  }

  cancelCreate(): void {
    this.creating = false;
    this.editNome = '';
  }

  saveCreate(): void {
    if (!this.editNome.trim() || !this.loggedUserId) {
      return;
    }

    this.saving = true;

    const novaPlaylist: Playlist = {
      nome: this.editNome.trim(),
      descricao: 'Minha nova playlist 🎮',
    };

    const url = `${PLAYLISTS_API_BASE}?usuarioId=${encodeURIComponent(this.loggedUserId)}`;

    this.http.post<Playlist>(url, novaPlaylist).subscribe({
      next: (playlist) => {
        this.playlists.push(playlist);

        this.toast.sucesso('Playlist criada!');

        this.saving = false;
        this.creating = false;
        this.editNome = '';

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Erro ao criar playlist:', err);

        this.toast.erro('Erro ao criar playlist.');

        this.saving = false;

        this.cdr.detectChanges();
      },
    });
  }

  deletarPlaylist(playlistId: string): void {
    this.playlistToDelete = playlistId;
    this.deleteModalOpen = true;
  }

  confirmDeletePlaylist(): void {
    if (!this.playlistToDelete) return;

    this.http.delete<void>(`${PLAYLISTS_API_BASE}/${this.playlistToDelete}`).subscribe({
      next: () => {
        this.playlists = this.playlists.filter(
          (playlist) => playlist.id !== this.playlistToDelete
        );

        this.toast.sucesso('Playlist excluída com sucesso!');

        this.deleteModalOpen = false;
        this.playlistToDelete = null;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Erro ao excluir playlist:', err);

        this.toast.erro('Não foi possível excluir a playlist.');

        this.deleteModalOpen = false;
        this.playlistToDelete = null;
      },
    });
  }

  cancelDeletePlaylist(): void {
    this.deleteModalOpen = false;
    this.playlistToDelete = null;
  }

  toggleAddGame() {
    this.addJogoAberto = !this.addJogoAberto;
  }
}
