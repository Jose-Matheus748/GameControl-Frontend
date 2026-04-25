import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideHeart, LucideImagePlus, LucideMessageCircle, LucideRepeat2, LucideShare2, LucideSparkles, LucideUserRound, LucideSquareArrowOutUpRight } from '@lucide/angular';

import { ToastService } from '../../services/toast.service';

interface Usuario {
  username: string;
  profilePictureUrl?: string | null;
}

interface PostType {
  id: number;
  content: string;
  imageUrl?: string;
  game?: string;
  createdAt: string;
  likes: number;
  comments: number;
  reposts: number;
  liked: boolean;
}

@Component({
  selector: 'app-post-user-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideHeart,
    LucideMessageCircle,
    LucideRepeat2,
    LucideShare2,
    LucideImagePlus,
    LucideUserRound,
    LucideSparkles,
    LucideSquareArrowOutUpRight
],
  templateUrl: './post-user-page.html',
})
export class PostUserPageComponent implements OnChanges {
  @Input() user: Usuario | null = null;

  posts: PostType[] = [];
  textoCriacaoDoPost = '';
  attachedImage: string | null = null;

  readonly maximoDeCaracteresNoPost = 280;

  private postsInicializados = false;

  constructor(private toast: ToastService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user && !this.postsInicializados) {
      // Cria posts iniciais mockados usando o nome do usuário
      this.posts = this.criarPosts(this.user.username);

      // Marca que os posts já foram inicializados
      this.postsInicializados = true;
    }
  }

  // Getter que calcula quantos caracteres ainda restam
  get restantes(): number {
    return this.maximoDeCaracteresNoPost - this.textoCriacaoDoPost.length;
  }

  // Getter que retorna o nome do usuário
  get username(): string {
    return this.user?.username || 'jogador';
  }

  // Getter que cria o identificador do usuário para exibição
  // Exemplo: Simon Oliveira -> simonoliveira
  get userHandle(): string {
    return this.username.toLowerCase().replace(/\s+/g, '');
  }

  // Método chamado sempre que o usuário digita no textarea
  // Ele garante que o texto não ultrapasse o limite de caracteres
  onDraftChange(value: string): void {
    this.textoCriacaoDoPost = value.slice(0, this.maximoDeCaracteresNoPost);
  }

  // Método responsável por publicar um novo post
  publicar(): void {
    try {
      const conteudo = this.textoCriacaoDoPost.trim();

      if (!conteudo) {
        this.toast.alerta('Escreva algo antes de postar.');
        return;
      }

      const novoPost: PostType = {
        id: Date.now(),
        content: this.textoCriacaoDoPost,
        imageUrl: this.attachedImage || undefined,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        reposts: 0,
        liked: false,
      };
      this.posts = [novoPost, ...this.posts];
      this.textoCriacaoDoPost = '';
      this.attachedImage = null;
      this.toast.sucesso('Sua galera ja pode ver 🚀', 'Post publicado!');
    } catch (error) {
      console.error('Erro ao publicar post:', error);
      this.toast.erro('Não foi possível localizar o post.');
    }
  }

  toggleLike(id: number): void {
    this.posts = this.posts.map((post) => {
      // Se não for o post clicado, retorna ele sem alteração
      if (post.id !== id) {
        return post;
      }

      // Se for o post clicado, inverte o liked
      // e ajusta a quantidade de curtidas
      return {
        ...post,

        // Se estava curtido, passa para não curtido
        // Se não estava curtido, passa para curtido
        liked: !post.liked,

        // Se já estava curtido, remove 1 like
        // Se não estava curtido, adiciona 1 like
        likes: post.likes + (post.liked ? -1 : 1),
      };
    });
  }

  // Método que simula anexar uma imagem ao post
  // Atualmente ele usa uma imagem aleatória do picsum.photos
  fakeAttach(): void {
    // Cria uma URL de imagem aleatória usando Date.now() como seed
    const url = `https://picsum.photos/seed/post${Date.now()}/800/500`;

    // Salva a imagem como anexo do post em criação
    this.attachedImage = url;

    // Mostra mensagem informando que a imagem foi anexada
    this.toast.info('Visualização adicionada ao post.', 'Imagem anexada');
  }

  // Remove a imagem anexada antes de publicar o post
  removeAttachedImage(): void {
    this.attachedImage = null;
  }

  comentariosEmBreve(): void {
    this.toast.info('Comentários em breve.');
  }

  repostar(): void {
    this.toast.sucesso('Repostado!');
  }

  compartilhar(): void {
    this.toast.info('Link copiado!');
  }

  // Método que converte a data do post em tempo relativo
  // Exemplo: "agora", "35m", "4h", "3d"
  timeAgo(iso: string): string {
    // Calcula a diferença entre agora e a data do post
    const diff = Date.now() - new Date(iso).getTime();

    // Converte a diferença de milissegundos para minutos
    const minutes = Math.floor(diff / 60000);

    // Se passou menos de 1 minuto, retorna "agora"
    if (minutes < 1) return 'agora';

    // Se passou menos de 1 hora, retorna em minutos
    if (minutes < 60) return `${minutes}m`;

    // Converte minutos em horas
    const hours = Math.floor(minutes / 60);

    // Se passou menos de 24 horas, retorna em horas
    if (hours < 24) return `${hours}h`;

    // Converte horas em dias
    const days = Math.floor(hours / 24);

    // Se passou menos de 7 dias, retorna em dias
    if (days < 7) return `${days}d`;

    // Se passou mais de 7 dias, retorna a data formatada em português do Brasil
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  // Função usada pelo *ngFor para melhorar performance
  // Ela ajuda o Angular a identificar cada post pelo ID
  trackByPostId(index: number, post: PostType): number {
    return post.id;
  }

  // Método criarPosts com dados mockados
  private criarPosts(username: string): PostType[] {
    return [
      {
        // ID fixo do post mockado
        id: 1,

        // Texto do post
        content:
          'Acabei de platinar Elden Ring 🗡️🔥 depois de 120h e umas 200 mortes pra Malenia. Agora é dormir uma semana inteira. Quem aí já encarou ela?',

        // Jogo relacionado ao post
        game: 'Elden Ring',

        // Data simulada: 35 minutos atrás
        createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),

        // Quantidade inicial de likes
        likes: 142,

        // Quantidade inicial de comentários
        comments: 23,

        // Quantidade inicial de reposts
        reposts: 8,

        // Indica que o usuário ainda não curtiu esse post
        liked: false,
      },
      {
        id: 2,

        content:
          'Opinião impopular: Hollow Knight: Silksong vai ser GOTY 🐝✨ podem printar esse post.',

        // Imagem mockada do post
        imageUrl: 'https://picsum.photos/seed/silksongpost/800/500',

        game: 'Hollow Knight: Silksong',

        // Data simulada: 4 horas atrás
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),

        likes: 318,
        comments: 47,
        reposts: 26,

        // Este post começa como já curtido
        liked: true,
      },
      {
        id: 3,

        content:
          'Montei minha playlist de soulslike pra encarar nesse inverno gamer ❄️🎮 dicas do que adicionar?',

        // Data simulada: 26 horas atrás
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),

        likes: 56,
        comments: 12,
        reposts: 2,
        liked: false,
      },
      {
        id: 4,

        // Usa template string para incluir o username dentro do texto
        content: `Bom dia! Hoje tem live de Clair Obscur: Expedition 33 lá no canal 🎥 @${username} esperando vocês 💖`,

        imageUrl: 'https://picsum.photos/seed/expedition33post/800/500',

        game: 'Clair Obscur: Expedition 33',

        // Data simulada: 3 dias atrás
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),

        likes: 89,
        comments: 9,
        reposts: 4,
        liked: false,
      },
    ];
  }
}
