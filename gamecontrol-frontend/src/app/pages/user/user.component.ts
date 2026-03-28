import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { UserService, User } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { PlaylistService, Playlist } from '../../services/playlist.service';
import { CollabFormComponent } from "../../components/collab-form/collab-form.component";
import { AddGameComponent } from "../../components/add-game/add-game.component";
import { AchievementsSectionComponent } from "../../components/achievements-section/achievements-section.component";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, CollabFormComponent, AddGameComponent, AchievementsSectionComponent],
  templateUrl: './user.component.html',
})
export class UserComponent implements OnInit {
  userData?: User;
  userId!: number;
  loggedUserId: number | null = null;
  followersCount = 0;
  followingCount = 0;
  loading = true;
  isAdmin = false;
  addJogoAberto = false;
  playlists: Playlist[] = [];

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private followService: FollowService,
    private playlistService: PlaylistService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('userId');
      this.loggedUserId = storedId ? Number(storedId) : null;
    }

    this.route.params.subscribe((params) => {
      this.userId = +params['id'];
      this.loadUser();
    });
  }

  loadUser() {
    this.loading = true;

    forkJoin({
      user: this.userService.getById(this.userId),
      followers: this.followService.getFollowers(this.userId),
      following: this.followService.getFollowing(this.userId),
      playlists: this.playlistService.getPlaylistsByUser(this.userId),
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

  criarPlaylist() {
    const nome = prompt('Digite o nome da playlist:');
    if (!nome || !this.loggedUserId) return;

    const novaPlaylist: Playlist = {
      name: nome,
      description: 'Minha nova playlist 🎵',
    };

    this.playlistService.createPlaylist(this.loggedUserId, novaPlaylist).subscribe({
      next: (playlist) => {
        this.playlists.push(playlist);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao criar playlist:', err),
    });
  }

  toggleAddGame() {
    this.addJogoAberto = !this.addJogoAberto;
  }
}
