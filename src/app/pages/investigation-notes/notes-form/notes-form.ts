import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-notes-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './notes-form.css',
  templateUrl: './notes-form.html',
})
export class NotesForm {}
