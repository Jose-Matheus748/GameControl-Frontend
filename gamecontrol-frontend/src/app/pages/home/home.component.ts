import { Component } from '@angular/core';
import { HeroBannerComponent } from '../../components/hero-banner/hero-banner.component';
import { HrDividerComponent } from '../../components/hr-divider/hr-divider.component';
import { CarouselComponent } from '../../components/games-carousel/carousel.component';
import { GameOfWeekComponent } from '../../components/game-of-week/game-of-week.component';
import { UserCarouselComponent } from '../../components/user-carousel/user-carousel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroBannerComponent, HrDividerComponent, CarouselComponent, GameOfWeekComponent, UserCarouselComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {

}
