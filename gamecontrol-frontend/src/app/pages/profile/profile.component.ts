import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, forkJoin, of } from 'rxjs';
import { UsuarioService, Usuario } from '../../services/user.service';
import { Playlist, fetchPlaylistsByUserId } from '../../services/playlist.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  userData?: Usuario;
  playlists: Playlist[] = [];
  userId!: string;
  loggedUserId: string | null = null;
  isFollowing = false;
  followersCount = 0;
  followingCount = 0;
  loading = true;
  isOwnProfile = false;

  socialModalOpen = false;
  socialModalTab: 'followers' | 'following' = 'followers';
  socialModalLoading = false;
  usernameById: Record<string, string> = {};

  constructor(
    private route: ActivatedRoute,
    private userService: UsuarioService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('userId');
      this.loggedUserId = storedId;
    }

    this.route.params.subscribe((params) => {
      this.userId = params['id'];
      this.isOwnProfile = this.loggedUserId != null && this.loggedUserId === this.userId;
      this.loadProfile();
    });
  }

  loadProfile() {
    this.loading = true;

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
        const followers = user.followers ?? [];
        const following = user.following ?? [];
        this.followersCount = followers.length;
        this.followingCount = following.length;
        this.playlists = playlists;

        this.isFollowing =
          this.loggedUserId != null ? followers.includes(this.loggedUserId) : false;

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
        this.loading = false;
      }
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

  toggleFollow() {
    if (this.loggedUserId == null) {
      alert('Você precisa estar logado para seguir usuários!');
      return;
    }

    if (this.isFollowing) {
      this.userService.unfollowUser(this.loggedUserId, this.userId).subscribe({
        next: () => {
          this.isFollowing = false;
          this.followersCount = Math.max(0, this.followersCount - 1);
          if (this.userData?.followers && this.loggedUserId) {
            this.userData.followers = this.userData.followers.filter((x) => x !== this.loggedUserId);
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao unfollow:', err)
      });
    } else {
      this.userService.followUser(this.loggedUserId, this.userId).subscribe({
        next: () => {
          this.isFollowing = true;
          this.followersCount++;
          if (this.userData && this.loggedUserId) {
            const list = this.userData.followers ?? [];
            if (!list.includes(this.loggedUserId)) {
              this.userData.followers = [...list, this.loggedUserId];
            }
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao seguir usuário:', err)
      });
    }
  }
}
