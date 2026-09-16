import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../app/shared/sidebar/sidebar';

@Component({
  imports: [RouterOutlet, Sidebar],
  selector: 'app-authenticated-layout',
  styleUrl: './authenticated-layout.css',
  templateUrl: './authenticated-layout.html',
})
export class AuthenticatedLayout {}
