import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameService, Game } from '../../services/games.service';
import { FormsModule } from '@angular/forms';
import { ReviewService, Review } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';
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
  loading = true;
  editing = false;
  gameId!: string;
  averageRating = 0;

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
    this.loadPage(id);
  }

  loadPage(gameId: string) {
    this.loading = true;

    forkJoin({
      game: this.gameService.getById(Number(gameId)),
      reviews: this.reviewService.getByGame(gameId),
      average: this.reviewService.getAverage(gameId)
    }).subscribe({
      next: ({ game, reviews, average }) => {
        this.game = game;
        this.reviews = reviews;
        this.averageRating = average;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro na página:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadReviews(gameId: string) {
    this.loading = true;

    this.reviewService.getByGame(gameId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar reviews', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAverage(gameId: string) {
    this.reviewService.getAverage(gameId).subscribe({
      next: (avg) => {
        this.averageRating = avg;
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
      next: (createdReview) => {
        if (this.userReview) {
          this.userReview.rating = this.newRating;
          this.userReview.description = this.newComment;
        } else {
          this.reviews = [createdReview, ...this.reviews];
        }

        this.editing = false;
        this.newComment = '';
        this.newRating = 0;

        this.calculateAverageLocal();
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  get currentUserId(): string | undefined {
    return this.authService.user()?.id?.toString();
  }

  get userReview(): Review | undefined {
    return this.reviews.find(r => r.userId === this.currentUserId);
  }

  openDeleteReviewModal(id: string): void {
    this.reviewToDeleteId = id;
    this.deleteModalOpen = true;
  }

  closeDeleteReviewModal(): void {
    this.deleteModalOpen = false;
    this.reviewToDeleteId = null;
  }

  confirmDeleteReview(): void {
    if (!this.reviewToDeleteId) return;

    this.reviewService.delete(this.reviewToDeleteId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(
          r => r.id !== this.reviewToDeleteId
        );

        this.calculateAverageLocal();

        this.closeDeleteReviewModal();

        this.toast.sucesso('Avaliação excluída com sucesso!');

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.toast.erro('Erro ao deletar avaliação')
        this.closeDeleteReviewModal();
      }
    });
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

  calculateAverageLocal() {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      return;
    }

    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
  }

  get displayRating(): string {
    const rounded = Math.round(this.averageRating * 10) / 10;
    return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
  }
}
