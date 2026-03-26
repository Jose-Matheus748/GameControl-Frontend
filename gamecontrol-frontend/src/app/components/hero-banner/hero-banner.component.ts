import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-banner.component.html'
})
export class HeroBannerComponent implements OnInit {

  title: string = 'Carregando...';
  subtitle: string = '';
  backgroundImage: string = 'caminho/para/imagem/padrao.jpg';

  constructor() { }

  ngOnInit(): void {
    this.title = 'Bem-vindo ao Nosso Universo de Jogos!';
    this.subtitle = 'Explore um catálogo incrível e encontre seus próximos jogos favoritos.';
    this.backgroundImage = 'https://images.unsplash.com/photo-1511512578047-dfb367046420';
  }
}
