import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-categoty-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './categoty-form.css',
  templateUrl: './categoty-form.html',
})
export class CategotyForm {}
