import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

interface HeroSlide {
  image: string;
  badge?: string;
  titleWhite: string;
  titleColored: string;
  titleColoredClass: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  overlayClass: string;
}

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-banner.component.html'
})
export class HeroBannerComponent implements OnInit, OnDestroy {

  readonly TRANSITION_DURATION = 50;
  readonly SLIDE_INTERVAL = 7000;

  currentSlide = 0;
  isBlackout = false;
  parallaxOffset = 0;

  private intervalId?: number;
  private timeoutA?: number;
  private timeoutB?: number;

  slides: HeroSlide[] = [
    {
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
      titleWhite: 'DESCUBRA NOVOS',
      titleColored: 'MUNDOS GAMER',
      titleColoredClass: 'text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]',
      subtitle: 'Veja jogos, avaliações, playlists e perfis de outros jogadores.',
      ctaLabel: 'Ver Todos os Jogos',
      ctaLink: '/games',
      overlayClass: 'bg-gradient-to-r from-pink-900/70 via-black/70 to-cyan-900/70',
    },
    {
      image: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/739630/5da0fc03de9b5ed477f3eb1702d429783a9b4d80/page_bg_raw.jpg?t=1772546327',
      badge: '🔥 Em alta recentemente',
      titleWhite: '',
      titleColored: 'Phasmophobia',
      titleColoredClass: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]',
      subtitle: 'Investigue locais assombrados com seus amigos. Você tem coragem?',
      ctaLabel: 'Ver Página do Jogo',
      ctaLink: 'game/132516',
      overlayClass: '',
    },
    {
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_hero.jpg',
      badge: '⭐ Bem avaliado',
      titleWhite: '',
      titleColored: 'Elden Ring',
      titleColoredClass: 'text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]',
      subtitle: 'Um mundo aberto épico criado por Hidetaka Miyazaki e George R.R. Martin.',
      ctaLabel: 'Conheça o Jogo',
      ctaLink: 'game/119133',
      overlayClass: 'bg-gradient-to-r from-black/60 via-black/30 to-black/10',
    },
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.clearAll();
  }

  nextSlide(): void {
    this.showSlide((this.currentSlide + 1) % this.slides.length);
  }

  previousSlide(): void {
    this.showSlide(this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1);
  }

  goToSlide(index: number): void {
    if (index === this.currentSlide) return;
    this.showSlide(index);
  }

  private showSlide(index: number): void {
    this.clearTimeouts();
    this.startAutoSlide();

    this.isBlackout = true;
    this.cdr.detectChanges();

    this.timeoutA = window.setTimeout(() => {
      this.currentSlide = index;
      this.cdr.detectChanges();

      this.timeoutB = window.setTimeout(() => {
        this.isBlackout = false;
        this.cdr.detectChanges();
      }, 50);

    }, this.TRANSITION_DURATION);
  }

  private startAutoSlide(): void {
    if (typeof window === 'undefined') return;
    this.stopAutoSlide();
    this.intervalId = window.setInterval(() => {
      this.showSlide((this.currentSlide + 1) % this.slides.length);
    }, this.SLIDE_INTERVAL);
  }

  private stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  private clearTimeouts(): void {
    if (this.timeoutA) { clearTimeout(this.timeoutA); this.timeoutA = undefined; }
    if (this.timeoutB) { clearTimeout(this.timeoutB); this.timeoutB = undefined; }
  }

  private clearAll(): void {
    this.stopAutoSlide();
    this.clearTimeouts();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.parallaxOffset = (window.scrollY || document.documentElement.scrollTop) * 0.15;
  }
}
