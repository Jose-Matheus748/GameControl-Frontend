import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component'
import { LoginComponent } from './pages/login/login.component'
import { RegisterComponent } from './pages/register/register.component';
import { GameComponent } from './pages/game/game.component';
import { GamesListComponent } from './pages/gamesList/games.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { UserComponent } from './pages/user/user.component';
import { SettingsComponent } from './pages/user-settings/user-settings.component';
import { PlaylistDetailComponent } from './pages/playlist/playlist.component';
import { GameReviewsComponent } from './pages/gameReview/game-reviews.component';
import { PostHomePageComponent } from './pages/post-home-page/post-home-page';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile/:id', component: ProfileComponent },
  { path: 'profile', component: UserComponent },
  { path: 'user/:id', component: ProfileComponent },
  { path: 'posts', component: PostHomePageComponent },
  { path: 'user', component: UserComponent },
  { path: 'game/:id', component: GameComponent },
  { path: 'games', component: GamesListComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'playlists/:id', component: PlaylistDetailComponent },
  { path: 'games/:id/reviews', component: GameReviewsComponent},
  { path: '**', redirectTo: '' }
];
