import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatMessage } from '../../../core/models/chat.model';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';

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
  editingId: number | null = null;
  isAdmin = false;

  form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {
    this.form = this.fb.group({
      message: ['', Validators.required],
    });
    this.isAdmin = this.authService.hasRole('admin');
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

  edit(message: ChatMessage): void {
    this.editingId = message.id;
    this.form.setValue({ message: message.userinput });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form.reset();
  }

  saveEdit(message: ChatMessage): void {
    const text = this.form.get('message')?.value?.trim();
    if (!text || this.sending) return;
    this.sending = true;
    this.chatService.update(message.id, { message: text }).subscribe({
      next: (updated) => {
        this.messages = this.messages.map((item) => item.id === updated.id ? updated : item);
        this.cancelEdit();
      },
      error: () => (this.error = 'Unable to update the message.'),
      complete: () => (this.sending = false),
    });
  }

  regenerate(message: ChatMessage): void {
    if (this.sending) return;
    this.sending = true;
    this.error = '';
    this.chatService.update(message.id, { message: message.userinput }).subscribe({
      next: (updated) => (this.messages = this.messages.map((item) => item.id === updated.id ? updated : item)),
      error: () => (this.error = 'Unable to regenerate the response.'),
      complete: () => (this.sending = false),
    });
  }

  delete(message: ChatMessage): void {
    if (!this.isAdmin || this.sending || !confirm('Delete this chat message?')) return;
    this.chatService.delete(message.id).subscribe({
      next: () => (this.messages = this.messages.filter((item) => item.id !== message.id)),
      error: () => (this.error = 'Unable to delete the message.'),
    });
  }
}
