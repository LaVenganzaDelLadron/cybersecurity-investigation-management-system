import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface SummaryCard {
  icon: string;
  title: string;
  description: string;
  value: number | string;
  tone?: string;
  target?: string;
}

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './summary-cards.css',
  template: `
    <div class="summary-cards" aria-label="Page summary">
      <a class="summary-card" *ngFor="let card of cards" [ngClass]="card.tone" [attr.href]="card.target || '#page-content'">
        <span class="summary-icon" aria-hidden="true">{{ card.icon }}</span>
        <span class="summary-copy">
          <strong>{{ card.title }}</strong>
          <small>{{ card.description }}</small>
        </span>
        <strong class="summary-value">{{ card.value }}</strong>
        <span class="summary-link">View details <span aria-hidden="true">→</span></span>
      </a>
    </div>
  `,
})
export class SummaryCards {
  @Input({ required: true }) cards: SummaryCard[] = [];
}
