import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PostService, UserPostDTO } from '../../services/posts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideHeart,
  LucideMessageCircle,
  LucideSend,
  LucideTrash2,
  LucideUserRound,
} from '@lucide/angular';

import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-post-home-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideHeart,
    LucideMessageCircle,
    LucideSend,
    LucideTrash2,
    LucideUserRound,
  ],
  templateUrl: './post-home-page.html',
})
export class PostHomePageComponent implements OnInit {
  posts: UserPostDTO[] = [];

  textoCriacaoDoPost = '';
  carregando = false;

  readonly limiteCaracteres = 280;

  constructor(
    private postService: PostService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarPosts();
  }

  get restantes(): number {
    return this.limiteCaracteres - this.textoCriacaoDoPost.length;
  }

  get usuarioLogadoId(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return localStorage.getItem('userId');
  }

  onDraftChange(valor: string): void {
    this.textoCriacaoDoPost = valor.slice(0, this.limiteCaracteres);
  }

  carregarPosts(): void {
    console.time('Carregamento /api/posts');

    this.carregando = true;

    this.postService.listarTodos(true).subscribe({
      next: (posts) => {
        console.timeEnd('Carregamento /api/posts');

        console.log('Resposta bruta da API:', posts);
        console.log('Quantidade de posts recebidos:', posts.length);

        this.posts = [...posts].sort((postA, postB) => {
          return new Date(postB.createdAt).getTime() - new Date(postA.createdAt).getTime();
        });

        this.carregando = false;

        console.log('Posts salvos no componente:', this.posts);
        console.log('Quantidade de posts no componente:', this.posts.length);
        console.log('Carregando depois de carregar:', this.carregando);
        
        this.cdr.detectChanges(); // Para forçar o angular a detectar mudanças e renderizar novamente;

      },

      error: (error) => {
        console.timeEnd('Carregamento /api/posts');

        console.error('Erro ao carregar posts:', error);
        this.toast.erro('Não foi possível carregar os posts.');

        this.carregando = false;

        console.log('Carregando depois do erro:', this.carregando);
      },
    });
  }

  publicar(): void {
    const texto = this.textoCriacaoDoPost.trim();

    if (!texto) {
      this.toast.alerta('Digite algo antes de postar.');
      return;
    }

    const userId = this.usuarioLogadoId;

    if (!userId) {
      this.toast.erro('Usuário não identificado. Faça login novamente');
      return;
    }

    this.postService
      .criarPost({
        userId,
        text: texto,
      })
      .subscribe({
        next: (postCriado) => {
          this.posts = [postCriado, ...this.posts];
          this.textoCriacaoDoPost = '';
          this.toast.sucesso('Post publicado com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao publicar post:', error);
          this.toast.erro('Não foi possível publicar o post.');
        },
      });
  }

  deletarPost(postId: string): void {
    this.postService.deletarPost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter((post) => post.id !== postId);
        this.toast.sucesso('Post excluído com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao excluir post:', error);
        this.toast.erro('Não foi possível excluir o post');
      },
    });
  }

  podeDeletar(post: UserPostDTO): boolean {
    return post.userId === this.usuarioLogadoId;
  }

  quantidadeComentarios(post: UserPostDTO): number {
    return post.commentIds?.length || 0;
  }

  comentariosEmBreve(): void {
    this.toast.info('Comentários em breve.');
  }

  toggleLikeLocal(post: UserPostDTO): void {
    post.likes = (post.likes || 0) + 1;
    this.toast.info('Curtida local. Ainda falta endpoint de like no backend');
  }

  timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
      return 'agora';
    }

    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days}d`;
    }

    return new Date(iso).toLocaleDateString('pt-BR');
  }

  trackByPostId(index: number, post: UserPostDTO): string {
    return post.id;
  }
}
