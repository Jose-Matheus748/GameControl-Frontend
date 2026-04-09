import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, forkJoin, of } from 'rxjs';
import { UsuarioService, Usuario } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { PlaylistService, Playlist } from '../../services/playlist.service';
import { CollabFormComponent } from '../../components/collab-form/collab-form.component';
import { AddGameComponent } from '../../components/add-game/add-game.component';
import {
  LucideUserRound,
  LucideUsers,
  LucideMapPin,
  LucideCalendar,
  LucideSquarePen,
  LucideMusic,
  LucidePlus,
  LucideTrash2,
} from '@lucide/angular';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    CollabFormComponent,
    AddGameComponent,
    LucideUserRound,
    LucideUsers,
    LucideMapPin,
    LucideCalendar,
    LucideSquarePen,
    LucideMusic,
    LucidePlus,
    LucideTrash2
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

  constructor(
    private route: ActivatedRoute,
    private userService: UsuarioService,
    private followService: FollowService,
    private playlistService: PlaylistService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('userId');
      this.loggedUserId = storedId;
    }

    this.route.params.subscribe((params) => {
      this.userId = params['id'];
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
      followers: this.followService.getFollowers(this.userId).pipe(
        catchError((err) => {
          console.error('Erro ao carregar followers:', err);
          return of([]);
        }),
      ),
      following: this.followService.getFollowing(this.userId).pipe(
        catchError((err) => {
          console.error('Erro ao carregar following:', err);
          return of([]);
        }),
      ),
      playlists: this.playlistService.getPlaylistsByUser(this.userId).pipe(
        catchError((err) => {
          console.error('Erro ao carregar playlists:', err);
          return of([]);
        }),
      ),
    }).subscribe({
      next: ({ user, followers, following, playlists }) => {
        this.userData = user;
        this.isAdmin = user.role === 'ADMIN';
        this.followersCount = followers.length;
        this.followingCount = following.length;
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

    this.playlistService.createPlaylist(this.loggedUserId, novaPlaylist).subscribe({
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

    this.playlistService.deletePlaylist(playlistId).subscribe({
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
