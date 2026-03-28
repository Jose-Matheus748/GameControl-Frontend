import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-collab-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collab-form.component.html',
})
export class CollabFormComponent {
  email = '';
  message = '';
  loading = false;
  success = false;

  private webhookUrl =
    'https://discord.com/api/webhooks/1438616676387131463/W_URsc8c1T9oTPWfYDTUaBpWirvWhHG797N-TfVfVn6O-AnMuWyvD7bM0hPWf3NaC4up';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  onSubmit() {
    if (!this.email || !this.message) return;

    this.loading = true;
    this.cdr.detectChanges(); // garante que o estado atualize no template

    const payload = {
      username: 'Los Pitufs | Contato',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/906/906343.png',
      embeds: [
        {
          title: '📩 Nova mensagem de colaboração!',
          color: 0xff69b4,
          fields: [
            { name: 'Email', value: this.email, inline: false },
            { name: 'Mensagem', value: this.message, inline: false },
          ],
          footer: {
            text: 'Enviado via formulário do site 💻',
          },
        },
      ],
    };

    this.http.post(this.webhookUrl, payload, { responseType: 'text' }).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        this.email = '';
        this.message = '';
        this.cdr.detectChanges(); // 🔥 força re-render imediato

        setTimeout(() => {
          this.success = false;
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err) => {
        console.error('Erro ao enviar para o Discord:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
