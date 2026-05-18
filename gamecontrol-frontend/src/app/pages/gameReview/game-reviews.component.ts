import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService, Game } from '../../services/games.service';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './game-reviews.component.html'
})
export class GameReviewsComponent implements OnInit {

  game?: Game;
  reviews: Review[] = [];
  userReview: Review | null = null;
  loading = true;
  editing = false;
  gameId!: string;
  averageRating = 0;
  averageRatingDisplay: string = '0';
  deleteModalOpen = false;
  reviewToDeleteId: string | null = null;

  newRating = 0;
  newComment = '';

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private reviewService: ReviewService,
    private authService: AuthService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading = false;
      return;
    }

    this.gameId = id;

    this.authService.waitForAuth().then(() => {
      this.loadPage(id);
    });
  }

  loadPage(gameId: string) {
    this.loading = true;

    this.reviewService.getReviewPage(gameId, this.currentUserId).subscribe({
      next: (data) => {
        this.game = data.game;
        this.reviews = data.reviews;
        this.userReview = data.userReview;
        this.averageRating = data.average;
        this.averageRatingDisplay = data.displayAverage;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar página de reviews:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitReview() {
    const userId = this.currentUserId;
    if (!userId || !this.gameId || this.newRating === 0) return;

    this.reviewService.create({
      userId,
      gameId: this.gameId,
      rating: this.newRating,
      description: this.newComment
    }).subscribe({
      next: () => {
        this.loadPage(this.gameId);
        this.editing = false;
        this.newComment = '';
        this.newRating = 0;
        this.toast.sucesso('Avaliação salva com sucesso!');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toast.erro('Erro ao enviar avaliação');
      }
    });
  }

  confirmDeleteReview(): void {
    if (!this.reviewToDeleteId) return;

    this.reviewService.delete(this.reviewToDeleteId, this.currentUserId!).subscribe({
      next: () => {
        this.loadPage(this.gameId);
        this.closeDeleteReviewModal();
        this.toast.sucesso('Avaliação excluída com sucesso!');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toast.erro('Erro ao deletar avaliação');
        this.closeDeleteReviewModal();
      }
    });
  }

  get currentUserId(): string | undefined {
    return this.authService.user()?.id?.toString();
  }

  openDeleteReviewModal(id: string): void {
    this.reviewToDeleteId = id;
    this.deleteModalOpen = true;
  }

  closeDeleteReviewModal(): void {
    this.deleteModalOpen = false;
    this.reviewToDeleteId = null;
  }

  startEdit() {
    if (!this.userReview) return;
    this.editing = true;
    this.newRating = this.userReview.rating;
    this.newComment = this.userReview.description;
  }

  goToGame() {
    if (!this.game?.id) return;
    this.router.navigate(['/game', this.game.id]);
  }

  // Retorna a rota correta: próprio perfil ou perfil de outro usuário
  profileRoute(userId: string): string[] {
    return userId === this.currentUserId ? ['/profile'] : ['/profile', userId];
  }
}
