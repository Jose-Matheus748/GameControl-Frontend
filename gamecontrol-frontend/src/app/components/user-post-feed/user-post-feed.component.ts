import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService, UserPostDTO } from '../../services/posts.service';
import { PostCommentService, PostCommentDTO } from '../../services/post-comment.service';
import { ToastService } from '../../services/toast.service';
import {
  LucideHeart, LucideMessageCircle, LucideUserRound, LucideSend
} from '@lucide/angular';

@Component({
  selector: 'app-user-post-feed',
  standalone: true,
  imports: [CommonModule, FormsModule,
    LucideHeart, LucideMessageCircle, LucideUserRound, LucideSend],
  templateUrl: './user-post-feed.component.html',
})
export class UserPostFeedComponent implements OnInit {
  @Input() userId!: string;

  posts: UserPostDTO[] = [];
  carregando = false;

  postSelecionadoId: string | null = null;
  comentariosPorPost: Record<string, PostCommentDTO[]> = {};
  carregandoComentarios = false;
  textoComentario = '';
  enviandoComentario = false;

  likedPostIds = new Set<string>();

  constructor(
    private postService: PostService,
    private postCommentService: PostCommentService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  get usuarioLogadoId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userId');
  }

  ngOnInit(): void {
    this.carregarPosts();
  }

  carregarPosts(): void {
    this.carregando = true;
    this.postService.listarPorUsuario(this.userId).subscribe({
      next: (posts) => {
        this.posts = posts.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Inicializa quais posts o usuário logado já curtiu
        const loggedUserId = this.usuarioLogadoId;
        if (loggedUserId) {
          this.posts.forEach(post => {
            if (post.likedUserIds?.includes(loggedUserId)) {
              this.likedPostIds.add(post.id);
            }
          });
        }

        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.cdr.detectChanges();
      },
    });
  }

  abrirComentarios(postId: string): void {
    if (this.postSelecionadoId === postId) {
      this.postSelecionadoId = null;
      return;
    }
    this.postSelecionadoId = postId;
    this.textoComentario = '';
    if (this.comentariosPorPost[postId]) return;

    this.carregandoComentarios = true;
    this.postCommentService.listarPorPost(postId).subscribe({
      next: (comentarios) => {
        this.comentariosPorPost[postId] = comentarios;
        this.carregandoComentarios = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregandoComentarios = false;
        this.cdr.detectChanges();
      },
    });
  }

  enviarComentario(postId: string): void {
    const texto = this.textoComentario.trim();
    const loggedUserId = this.usuarioLogadoId;
    if (!texto || !loggedUserId) return;

    this.enviandoComentario = true;
    this.postCommentService.criar({ userId: loggedUserId, postId, content: texto }).subscribe({
      next: (comentario) => {
        this.comentariosPorPost[postId] = [...(this.comentariosPorPost[postId] || []), comentario];
        const post = this.posts.find(p => p.id === postId);
        if (post) post.commentIds = [...(post.commentIds || []), comentario.id];
        this.textoComentario = '';
        this.enviandoComentario = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.erro('Não foi possível enviar o comentário.');
        this.enviandoComentario = false;
        this.cdr.detectChanges();
      },
    });
  }

  comentariosDoPost(postId: string): PostCommentDTO[] {
    return this.comentariosPorPost[postId] || [];
  }

  toggleLike(post: UserPostDTO): void {
    const userId = this.usuarioLogadoId;
    if (!userId) return;
    
    const jaGostei = post.likedUserIds?.includes(userId);
    
    // Atualização otimista
    if (jaGostei) {
      post.likedUserIds = post.likedUserIds.filter(id => id !== userId);
      this.likedPostIds.delete(post.id);
    } else {
      post.likedUserIds = [...(post.likedUserIds || []), userId];
      this.likedPostIds.add(post.id);
    }
    post.likesCount = post.likedUserIds.length;
    this.posts = [...this.posts];
    this.cdr.detectChanges();
  
    // Persiste no backend
    this.postService.toggleLike(post.id, userId).subscribe({
      error: () => {
        // Reverte se falhar
        if (jaGostei) {
          post.likedUserIds = [...(post.likedUserIds || []), userId];
          this.likedPostIds.add(post.id);
        } else {
          post.likedUserIds = post.likedUserIds.filter(id => id !== userId);
          this.likedPostIds.delete(post.id);
        }
        post.likesCount = post.likedUserIds.length;
        this.posts = [...this.posts];
        this.toast.erro('Não foi possível registrar a curtida.');
        this.cdr.detectChanges();
      }
    });
  }
  
  quantidadeComentarios(post: UserPostDTO): number {
    return post.commentIds?.length || 0;
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

  trackByPostId(_: number, post: UserPostDTO): string { return post.id; }
}
