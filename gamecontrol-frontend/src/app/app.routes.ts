import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component'
import { LoginComponent } from './pages/login/login.component'
import { RegisterComponent } from './pages/register/register.component';
import { GameComponent } from './pages/game/game.component';
import { GamesListComponent } from './pages/gamesList/games.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'games/:id', component: GameComponent },
  { path: 'games', component: GamesListComponent },
  { path: '**', redirectTo: '' }
];
