import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <a routerLink="/" class="logo-link">
            <img src="assets/images/servidor.png" class="logo-img" alt="SaaS-O-Matic Logo">
            <span class="logo-text">SaaS-O-Matic</span>
          </a>
          <div class="header-badge">Subscription & Billing Optimizer</div>
        </div>
      </header>
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
      <footer class="app-footer">
        <p>&copy; 2026 SaaS-O-Matic. Creado con criterio de ingeniería y precisión.</p>
      </footer>
    </div>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {}
