import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatMessage } from '../../../core/models/chat.model';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './chat-ai.css',
  templateUrl: './chat-ai.html',
})
export class ChatAi {
  messages: ChatMessage[] = [];
  loading = true;
  sending = false;
  error = '';

  form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly chatService: ChatService,
  ) {
    this.form = this.fb.group({
      message: ['', Validators.required],
    });
    this.loadHistory();
  }

  loadHistory(): void {
    this.chatService.list().subscribe({
      next: (messages) => (this.messages = messages),
      error: () => {
        this.error = 'Unable to load chat history.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  send(): void {
    if (this.form.invalid || this.sending) {
      this.form.markAllAsTouched();
      return;
    }

    const message = this.form.get('message')?.value ?? '';
    this.sending = true;
    this.error = '';
    this.chatService.send({ message }).subscribe({
      next: (response) => {
        this.messages = [...this.messages, response];
        this.form.reset();
      },
      error: () => (this.error = 'Unable to send your message.'),
      complete: () => (this.sending = false),
    });
  }
}
