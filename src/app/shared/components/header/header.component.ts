import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="container">
        <h1 class="logo">Angular App</h1>
        <nav class="nav">
          <a routerLink="/home" routerLinkActive="active" class="nav-link">Home</a>
          <a routerLink="/item-list" routerLinkActive="active" class="nav-link">Item List</a>
          <a routerLink="/about" routerLinkActive="active" class="nav-link">About</a>
        </nav>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {}