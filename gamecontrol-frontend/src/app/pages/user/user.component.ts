import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, forkJoin, of } from 'rxjs';
import { UsuarioService, Usuario } from '../../services/user.service';
import { Playlist, PLAYLISTS_API_BASE, fetchPlaylistsByUserId } from '../../services/playlist.service';
import { CollabFormComponent } from '../../components/collab-form/collab-form.component';
import { AddGameComponent } from '../../components/add-game/add-game.component';
import {
  LucideUserRound,
  LucideUsers,
  LucideMapPin,
  LucidePlus,
  LucideTrash2,
  LucideSettings,
  LucideGamepad2,
} from '@lucide/angular';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CollabFormComponent,
    AddGameComponent,
    LucideUserRound,
    LucideUsers,
    LucideMapPin,
    LucideSettings,
    LucideGamepad2,
    LucidePlus,
    LucideTrash2,
  ],
  templateUrl: './user.component.html',
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

  previewUrl: string | null = null;
  selectedProfileFile: File | null = null;

  playlists: Playlist[] = [];

  socialModalOpen = false;
  socialModalTab: 'followers' | 'following' = 'followers';
  socialModalLoading = false;
  usernameById: Record<string, string> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UsuarioService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      this.loggedUserId = globalThis.localStorage.getItem('userId');
    }

    this.route.paramMap.subscribe((pm) => {
      const fromRoute = pm.get('id')?.trim() ?? '';
      const fromStorage =
        typeof globalThis !== 'undefined' && globalThis.localStorage
          ? globalThis.localStorage.getItem('userId')?.trim() ?? ''
          : '';
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
      playlists: fetchPlaylistsByUserId(this.http, this.userId).pipe(
        catchError((err) => {
          console.error('Erro ao carregar playlists:', err);
          return of([]);
        }),
      ),
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
      console.error('Selecione um arquivo de imagem válido.');
      return;
    }

    this.selectedProfileFile = file;

    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.previewUrl = URL.createObjectURL(file);

    input.value = '';
    this.cdr.detectChanges();
  }

  criarPlaylist() {
    const nome = prompt('Digite o nome da playlist:');
    if (!nome || !this.loggedUserId) return;

    const novaPlaylist: Playlist = {
      nome: nome,
      descricao: 'Minha nova playlist 🎵',
    };

    const url = `${PLAYLISTS_API_BASE}?usuarioId=${encodeURIComponent(this.loggedUserId)}`;
    this.http.post<Playlist>(url, novaPlaylist).subscribe({
      next: (playlist) => {
        this.playlists.push(playlist);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao criar playlist:', err),
    });
  }

  deletarPlaylist(playlistId: number): void {
    const confirmar = confirm('Tem certeza de que deseja excluir esta playlist?');

    if (!confirmar) return;

    this.http.delete<void>(`${PLAYLISTS_API_BASE}/${playlistId}`).subscribe({
      next: () => {
        this.playlists = this.playlists.filter(
          (playlist) => playlist.id !== playlistId
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao excluir playlist:', err);
        alert('Não foi possivel excluir a playlist.');
      }
    })
  }

  toggleAddGame() {
    this.addJogoAberto = !this.addJogoAberto;
  }
}
