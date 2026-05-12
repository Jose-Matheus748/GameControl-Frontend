import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PostService, UserPostDTO } from '../../services/posts.service';
import { UsuarioService } from '../../services/user.service';
import { LucideMessageCircle, LucideHeart, LucideUserRound } from '@lucide/angular';

@Component({
  selector: 'app-post-feed-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideMessageCircle, LucideHeart, LucideUserRound],
  templateUrl: './post-feed-carousel.component.html',
})
export class PostFeedCarouselComponent implements OnInit {
  posts: UserPostDTO[] = [];
  index = 0;
  readonly visibleItems = 3;
  carregando = true;

  constructor(
    private postService: PostService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  get usuarioLogadoId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userId');
  }

  ngOnInit(): void {
    const userId = this.usuarioLogadoId;
    if (!userId) {
      this.carregando = false;
      return;
    }

    forkJoin({
      usuarioLogado: this.usuarioService.getById(userId),
      todosOsPosts: this.postService.listarTodos(),
    }).subscribe({
      next: ({ usuarioLogado, todosOsPosts }) => {
        const idsSeguidos = usuarioLogado.following ?? [];
        const idsPermitidos = new Set<string>(idsSeguidos.map(String));
        idsPermitidos.add(String(userId));

        this.posts = todosOsPosts
          .filter((post) => idsPermitidos.has(String(post.userId)))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10); // máximo 10 posts no carrossel

        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      },
    });
  }

  next(): void {
    if (this.index < this.posts.length - this.visibleItems) {
      this.index++;
    }
  }

  prev(): void {
    if (this.index > 0) {
      this.index--;
    }
  }

  timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  trackByPostId(index: number, post: UserPostDTO): string {
    return post.id;
  }
}
