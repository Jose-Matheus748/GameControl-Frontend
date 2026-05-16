import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PostCommentService, PostCommentDTO } from '../../services/post-comment.service';
import { LucideSend } from '@lucide/angular';

import {
  LucideHeart,
  LucideMessageCircle,
  LucideSparkles,
  LucideUserRound,
  LucideTrash2,
  LucideSquareArrowOutUpRight,
} from '@lucide/angular';

import { Usuario, UsuarioService } from '../../services/user.service';
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
    LucideTrash2,
    LucideSquareArrowOutUpRight,
    LucideSend
  ],
  templateUrl: './post-user-page.html',
})
export class PostUserPageComponent implements OnInit {
  @Input() user: Usuario | null = null;
  @Input() userId: string | null = null;

  posts: UserPostDTO[] = [];
  textoCriacaoDoPost = '';
  carregandoPosts = false;
  enviandoPost = false;

  postSelecionadoId: string | null = null;
  comentariosPorPost: Record<string, PostCommentDTO[]> = {};
  carregandoComentarios = false;
  textoComentario = '';
  enviandoComentario = false;

  readonly maximoDeCaracteresNoPost = 280;
  likedPostIds = new Set<string>();

  constructor(
    private toast: ToastService,
    private postService: PostService,
    private usuarioService: UsuarioService,
    private postCommentService: PostCommentService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarPostsDeQuemEuSigo();
  }

  get usuarioLogadoId(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('userId');
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
  
  carregarPostsDeQuemEuSigo(): void {
    const loggedUserId = this.usuarioLogadoId;

    if (!loggedUserId) {
      this.toast.erro('Usuário não identificado. Faça login novamente!');
      return;
    }

    this.carregandoPosts = true;

    forkJoin({
      usuarioLogado: this.usuarioService.getById(loggedUserId),
      todosOsPosts: this.postService.listarTodos(true)
    }).subscribe({
      next: ({ usuarioLogado, todosOsPosts }) => {
        const idsSeguidos = usuarioLogado.following ?? [];
        const idsPermitidos = new Set<string>(idsSeguidos.map(String));
        idsPermitidos.add(String(loggedUserId));

        const postsFiltrados = todosOsPosts.filter((post) => {
          return idsPermitidos.has(String(post.userId));
        });

        this.posts = [...postsFiltrados].sort((postA, postB) => {
          return new Date(postB.createdAt).getTime() - new Date(postA.createdAt).getTime();
        });

        // Inicializa quais posts o usuário logado já curtiu
        this.posts.forEach(post => {
          if (post.likedUserIds?.includes(loggedUserId)) {
            this.likedPostIds.add(post.id);
          }
        });

        this.carregandoPosts = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Erro ao carregar posts de quem sigo:', error);
        this.toast.erro('Não foi possível carregar os posts.');
        this.posts = [];
        this.carregandoPosts = false;
        this.cdr.detectChanges();
      },
    });
  }

  publicar(): void {
    const texto = this.textoCriacaoDoPost.trim();

    if (!texto) {
      this.toast.alerta('Escreva algo antes de postar.');
      return;
    }

    const loggedUserId = this.usuarioLogadoId;

    if (!loggedUserId) {
      this.toast.erro('Usuário não identificado. Faça login novamente.');
      return;
    }

    this.enviandoPost = true;

    this.postService
      .criarPost({
        userId: loggedUserId,
        text: texto,
      })
      .subscribe({
        next: (postCriado) => {
          this.posts = [postCriado, ...this.posts];
          this.textoCriacaoDoPost = '';
          this.enviandoPost = false;

          this.toast.sucesso('Sua galera já pode ver 🚀', 'Post publicado!');
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao publicar post:', error);

          this.enviandoPost = false;
          this.toast.erro('Não foi possível publicar o post.');
          this.cdr.detectChanges();
        },
      });
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

  postEstaCurtido(postId: string): boolean {
    return this.likedPostIds.has(postId);
  }

  quantidadeComentarios(post: UserPostDTO): number {
    return post.commentIds?.length || 0;
  }

  abrirComentarios(postId: string): void {
    if (this.postSelecionadoId === postId) {
      this.postSelecionadoId = null;
      return;
    }

    this.postSelecionadoId = postId;
    this.textoComentario = '';

    if (this.comentariosPorPost[postId]) {
      return; // já carregados
    }

    this.carregandoComentarios = true;

    this.postCommentService.listarPorPost(postId).subscribe({
      next: (comentarios) => {
        this.comentariosPorPost[postId] = comentarios;
        this.carregandoComentarios = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.erro('Não foi possível carregar os comentários.');
        this.carregandoComentarios = false;
        this.cdr.detectChanges();
      },
    });
  }

  enviarComentario(postId: string): void {
    const texto = this.textoComentario.trim();
    const loggedUserId = this.usuarioLogadoId;

    if (!texto) return;
    if (!loggedUserId) {
      this.toast.erro('Usuário não identificado. Faça login novamente.');
      return;
    }

    this.enviandoComentario = true;

    this.postCommentService.criar({
      userId: loggedUserId,
      postId,
      content: texto,
    }).subscribe({
      next: (comentario) => {
        if (!this.comentariosPorPost[postId]) {
          this.comentariosPorPost[postId] = [];
        }
        this.comentariosPorPost[postId] = [...this.comentariosPorPost[postId], comentario];

        // Atualiza o contador local no post
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.commentIds = [...(post.commentIds || []), comentario.id];
          this.posts = [...this.posts];
        }

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


  deletarPost(postId: string): void {
    this.postService.deletarPost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter((post) => post.id !== postId);
        this.toast.sucesso('Post excluído com sucesso!');

        // Atualiza a tela.
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Erro ao excluir post:', error);
        this.toast.erro('Não foi possível excluir o post');

        // Atualiza a tela.
        this.cdr.detectChanges();
      },
    });
  }

  podeDeletar(post: UserPostDTO): boolean {
    return String(post.userId) === String(this.usuarioLogadoId);
  }
}
