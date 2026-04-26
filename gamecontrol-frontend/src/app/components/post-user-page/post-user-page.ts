import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideHeart,
  LucideMessageCircle,
  LucideSparkles,
  LucideUserRound,
  LucideSquareArrowOutUpRight,
} from '@lucide/angular';

import { Usuario } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { PostService, UserPostDTO } from '../../services/posts.service';

@Component({
  selector: 'app-post-user-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,

    LucideHeart,
    LucideMessageCircle,
    LucideUserRound,
    LucideSparkles,
    LucideSquareArrowOutUpRight,
  ],
  templateUrl: './post-user-page.html',
})
export class PostUserPageComponent implements OnInit {
  @Input() user: Usuario | null = null;
  @Input() userId: string | null = null;

  posts: UserPostDTO[] = [];
  textoCriacaoDoPost = '';
  carregandoPosts = false;

  readonly maximoDeCaracteresNoPost = 280;
  likedPostIds = new Set<string>();

  constructor(
    private toast: ToastService,
    private postService: PostService,
  ) {}

  ngOnInit(): void {
    this.carregarTodosOsPosts();
  }

  get restantes(): number {
    return this.maximoDeCaracteresNoPost - this.textoCriacaoDoPost.length;
  }

  get username(): string {
    return this.user?.username || 'jogador';
  }

  get userHandle(): string {
    return this.username.toLowerCase().replace(/\s+/g, '');
  }

  onDraftChange(value: string): void {
    this.textoCriacaoDoPost = value.slice(0, this.maximoDeCaracteresNoPost);
  }

  carregarTodosOsPosts(): void {
    this.carregandoPosts = true;

    this.postService.listarTodos().subscribe({
      next: (posts) => {
        this.posts = posts.sort((postA, postB) => {
          return new Date(postB.createdAt).getTime() - new Date(postA.createdAt).getTime();
        });

        this.carregandoPosts = false;
      },
      error: (error) => {
        console.error('Erro ao carregar todos os posts:', error);
        this.toast.erro('Não foi possível carregar os posts.');
        this.carregandoPosts = false;
      },
    });
  }

  publicar(): void {
    const texto = this.textoCriacaoDoPost.trim();

    if (!texto) {
      this.toast.alerta('Escreva algo antes de postar.');
      return;
    }

    if (!this.userId) {
      this.toast.erro('Usuário não identificado. Faça login novamente.');
      return;
    }

    this.postService
      .criarPost({
        userId: this.userId,
        text: texto,
      })
      .subscribe({
        next: (postCriado) => {
          this.posts = [postCriado, ...this.posts];
          this.textoCriacaoDoPost = '';
          this.toast.sucesso('Sua galera já pode ver 🚀', 'Post publicado!');
        },
        error: (error) => {
          console.error('Erro ao publicar post:', error);
          this.toast.erro('Não foi possível publicar o post.');
        },
      });
  }

  toggleLikeLocal(post: UserPostDTO): void {
    if (this.likedPostIds.has(post.id)) {
      this.likedPostIds.delete(post.id);
      post.likes = Math.max(0, (post.likes || 0) - 1);
      return;
    }

    this.likedPostIds.add(post.id);
    post.likes = (post.likes || 0) + 1;
  }

  postEstaCurtido(postId: string): boolean {
    return this.likedPostIds.has(postId);
  }

  quantidadeComentarios(post: UserPostDTO): number {
    return post.commentIds?.length || 0;
  }

  comentariosEmBreve(): void {
    this.toast.info('Comentários em breve.');
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