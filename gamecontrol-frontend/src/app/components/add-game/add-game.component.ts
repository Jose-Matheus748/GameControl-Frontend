import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GameService } from '../../services/games.service';

@Component({
  selector: 'app-add-game-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-game.component.html',
})
export class AddGameComponent {
  @Output() close = new EventEmitter<void>();
  formAddGame: FormGroup;
  coverFile?: File;

  submitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private gameService: GameService) {
    this.formAddGame = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      developer: [''],
      publisher: [''],
      releaseDate: [''],
      coverImage: [null], 
      externalLink: [''],
      genres: ['']
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.coverFile = file;
    }
  }

  submit() {
    if (this.formAddGame.invalid) return;

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = new FormData();
    formData.append('title', this.formAddGame.get('title')?.value);
    formData.append('description', this.formAddGame.get('description')?.value);
    formData.append('developer', this.formAddGame.get('developer')?.value);
    formData.append('publisher', this.formAddGame.get('publisher')?.value);
    formData.append('releaseDate', this.formAddGame.get('releaseDate')?.value);
    formData.append('genres', this.formAddGame.get('genres')?.value);
    formData.append('externalLink', this.formAddGame.get('externalLink')?.value);

    if (this.coverFile) {
      formData.append('coverImage', this.coverFile); // envia o arquivo
    }

    this.gameService.uploadGame(formData).subscribe({
      next: (game) => {
        this.successMessage = `Jogo "${game.title}" adicionado com sucesso!`;
        this.submitting = false;
        this.formAddGame.reset();
        this.coverFile = undefined;
      },
      error: (err) => {
        this.errorMessage = 'Erro ao adicionar jogo. Tente novamente.';
        console.error(err);
        this.submitting = false;
      }
    });
  }

  fechar() {
    this.close.emit();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.coverFile = input.files[0];
    }
  }
}
