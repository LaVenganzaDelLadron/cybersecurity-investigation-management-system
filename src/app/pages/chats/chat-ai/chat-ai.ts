import { CommonModule } from '@angular/common';
import { Component, ElementRef, SecurityContext, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ChatMessage } from '../../../core/models/chat.model';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { marked } from 'marked';

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styleUrl: './chat-ai.css',
  templateUrl: './chat-ai.html',
})
export class ChatAi {
  messages: ChatMessage[] = [];
  loading = true;
  sending = false;
  error = '';
  editingId: number | null = null;
  regeneratingId: number | null = null;
  isAdmin = false;
  sidebarOpen = true;
  historySearch = '';
  conversationTitle = 'New cybersecurity conversation';
  copiedId: number | null = null;
  @ViewChild('composer') composer?: ElementRef<HTMLTextAreaElement>;

  form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly sanitizer: DomSanitizer,
  ) {
    this.form = this.fb.group({
      message: ['', Validators.required],
    });
    this.isAdmin = this.authService.hasRole('admin');
    this.loadHistory();
  }

  renderAssistantMessage(response: string | null | undefined): string {
    if (!response?.trim()) {
      return '<p class="empty-response">No response yet.</p>';
    }

    const html = marked.parse(response, {
      async: false,
      breaks: true,
      gfm: true,
    });

    return this.sanitizer.sanitize(SecurityContext.HTML, html) ?? '';
  }

  loadHistory(): void {
    this.chatService.list().subscribe({
      next: (messages) => {
        this.messages = messages;
        this.conversationTitle = messages[0]?.userinput?.slice(0, 52) || 'New cybersecurity conversation';
      },
      error: () => {
        this.error = 'Unable to load chat history.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  get filteredHistory(): ChatMessage[] {
    const query = this.historySearch.trim().toLowerCase();
    return query
      ? this.messages.filter((message) => message.userinput.toLowerCase().includes(query))
      : this.messages;
  }

  newChat(): void {
    this.editingId = null;
    this.form.reset();
    this.conversationTitle = 'New cybersecurity conversation';
    this.focusComposer();
  }

  clearChat(): void {
    this.messages = [];
    this.newChat();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  handleComposerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
      return;
    }
    setTimeout(() => this.resizeComposer());
  }

  resizeComposer(): void {
    const element = this.composer?.nativeElement;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 180)}px`;
  }

  focusComposer(): void {
    setTimeout(() => {
      this.composer?.nativeElement.focus();
      this.resizeComposer();
    });
  }

  async copyResponse(message: ChatMessage): Promise<void> {
    if (!message.response || !navigator.clipboard) return;
    await navigator.clipboard.writeText(message.response);
    this.copiedId = message.id;
    setTimeout(() => this.copiedId = null, 1600);
  }

  exportConversation(): void {
    const content = this.messages.map((message) =>
      `You (${this.formatDate(message.created_at)}):\n${message.userinput}\n\nAI assistant:\n${message.response || 'No response yet.'}`,
    ).join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cybersecurity-conversation.txt';
    link.click();
    URL.revokeObjectURL(url);
  }

  formatDate(value?: string): string {
    return value ? new Date(value).toLocaleString() : 'Just now';
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
        this.conversationTitle = message.slice(0, 52);
        this.form.reset();
        this.focusComposer();
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
    this.regeneratingId = message.id;
    this.error = '';
    this.chatService.update(message.id, { message: message.userinput }).subscribe({
      next: (updated) => (this.messages = this.messages.map((item) => item.id === updated.id ? updated : item)),
      error: () => {
        this.error = 'Unable to regenerate the response.';
        this.sending = false;
        this.regeneratingId = null;
      },
      complete: () => {
        this.sending = false;
        this.regeneratingId = null;
      },
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
