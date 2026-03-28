import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { UserService, User } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { PlaylistService, Playlist } from '../../services/playlist.service';
import { AchievementsSectionComponent } from "../../components/achievements-section/achievements-section.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, AchievementsSectionComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  userData?: User;
  playlists: Playlist[] = [];
  userId!: number;
  loggedUserId: number | null = null;
  isFollowing = false;
  followersCount = 0;
  followingCount = 0;
  loading = true;
  isOwnProfile = false;

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
      this.isOwnProfile = this.loggedUserId === this.userId;
      this.loadProfile();
    });
  }

  loadProfile() {
    this.loading = true;

    forkJoin({
      user: this.userService.getById(this.userId),
      followers: this.followService.getFollowers(this.userId),
      following: this.followService.getFollowing(this.userId),
      playlists: this.playlistService.getPlaylistsByUser(this.userId)
    }).subscribe({
      next: ({ user, followers, following, playlists }) => {
        this.userData = user;
        this.followersCount = followers.length;
        this.followingCount = following.length;
        this.playlists = playlists;

        this.isFollowing =
          this.loggedUserId != null
            ? followers.some((f) => f.id === this.loggedUserId)
            : false;

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar perfil:', err);
        this.loading = false;
      }
    });
  }

  toggleFollow() {
    if (this.loggedUserId == null) {
      alert('Você precisa estar logado para seguir usuários!');
      return;
    }

    if (this.isFollowing) {
      this.followService.unfollowUser(this.loggedUserId, this.userId).subscribe({
        next: () => {
          this.isFollowing = false;
          this.followersCount = Math.max(0, this.followersCount - 1);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao deixar de seguir:', err)
      });
    } else {
      this.followService.followUser(this.loggedUserId, this.userId).subscribe({
        next: () => {
          this.isFollowing = true;
          this.followersCount++;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao seguir usuário:', err)
      });
    }
  }
}
