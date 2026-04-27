import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs'; // Importa forkJoin para executar duas requisições ao mesmo tempo.
import { PostService, UserPostDTO } from '../../services/posts.service';
import { UsuarioService } from '../../services/user.service';

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
    private usuarioService: UsuarioService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarPostsDeQuemEuSigo();
  }

  get restantes(): number {
    return this.limiteCaracteres - this.textoCriacaoDoPost.length;
  }

  // Busca o ID do usuário logado no localStorage.
  get usuarioLogadoId(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return localStorage.getItem('userId');
  }

  onDraftChange(valor: string): void {
    this.textoCriacaoDoPost = valor.slice(0, this.limiteCaracteres);
  }

  carregarPostsDeQuemEuSigo(): void {
    const userId = this.usuarioLogadoId;

    if (!userId) {
      this.toast.erro('Usuário não identificado. Faça login novamente.');
      return;
    }

    this.carregando = true;

    // Executa ao mesmo tempo a busca do usuário logado e dos posts.
    forkJoin({
      usuarioLogado: this.usuarioService.getById(userId),
      todosOsPosts: this.postService.listarTodos(true),
    }).subscribe({
      next: ({ usuarioLogado, todosOsPosts }) => {
        const idsSeguidos = usuarioLogado.following ?? [];
        const idsPermitidos = new Set<string>(idsSeguidos.map(String));
        idsPermitidos.add(String(userId));

        // Filtra somente posts de usuários seguidos ou do próprio usuário.
        const postsFiltrados = todosOsPosts.filter((post) => {
          return idsPermitidos.has(String(post.userId));
        });

        // Ordena os posts do mais recente para o mais antigo.
        this.posts = [...postsFiltrados].sort((postA, postB) => {
          return new Date(postB.createdAt).getTime() - new Date(postA.createdAt).getTime();
        });

        this.carregando = false;

        // Força o Angular a atualizar o HTML.
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Erro ao carregar posts de quem sigo:', error);
        this.toast.erro('Não foi possível carregar os posts.');
        this.posts = [];
        this.carregando = false;

        // Força atualização da tela.
        this.cdr.detectChanges();
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
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Erro ao publicar post:', error);
          this.toast.erro('Não foi possível publicar o post.');

          // Atualiza a tela.
          this.cdr.detectChanges();
        },
      });
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

  quantidadeComentarios(post: UserPostDTO): number {
    return post.commentIds?.length || 0;
  }

  comentariosEmBreve(): void {
    this.toast.info('Comentários em breve.');
  }

  // Curtida local, sem persistência no backend.
  toggleLikeLocal(post: UserPostDTO): void {
    post.likes = (post.likes || 0) + 1;
    this.posts = [...this.posts];
    this.toast.info('Curtida local. Ainda falta endpoint de like no backend');
    this.cdr.detectChanges();
  }

  // Calcula há quanto tempo o post foi criado.
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

  // Ajuda o Angular a identificar cada post no *ngFor.
  trackByPostId(index: number, post: UserPostDTO): string {
    return post.id;
  }
}