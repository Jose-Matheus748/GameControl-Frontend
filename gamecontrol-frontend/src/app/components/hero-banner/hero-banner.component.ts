import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

interface HeroSlide {
  image: string;
}

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-banner.component.html'
})
export class HeroBannerComponent implements OnInit, OnDestroy {
  parallaxOffset = 0;

  titleWhite = 'DESCUBRA NOVOS';
  titlePink = 'MUNDOS';
  titleCyan = ' GAMER';
  subtitle = 'Veja jogos, avaliações, playlists e perfis de outros jogadores.';

  currentSlide = 0;
  readonly slideIntervalMs = 5000;
  private intervalId?: number;

  slides: HeroSlide[] = [
    {
      image:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
    },
    {
      image:
        'https://ultimaficha.com.br/wp-content/uploads/2026/05/1000235056-1280x720.webp',
    },
    {
      image: 'https://image.api.playstation.com/vulcan/ap/rnd/202603/1902/7cf1c3688e672b87452f660ed5fbbfa1b0458363dea5d0c6.png',
    },
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  private startAutoSlide(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.stopAutoSlide();

    this.intervalId = window.setInterval(() => {
      this.showSlide((this.currentSlide + 1) % this.slides.length);
    }, this.slideIntervalMs);
  }

  private stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  nextSlide(): void {
    this.showSlide((this.currentSlide + 1) % this.slides.length);
    this.startAutoSlide();
  }

  previousSlide(): void {
    const previousIndex = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    this.showSlide(previousIndex);
    this.startAutoSlide();
  }

  goToSlide(index: number): void {
    this.showSlide(index);
    this.startAutoSlide();
  }

  private showSlide(index: number): void {
    this.currentSlide = index;
    this.cdr.detectChanges();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    this.parallaxOffset = scrollY * 0.15;
  }
}
