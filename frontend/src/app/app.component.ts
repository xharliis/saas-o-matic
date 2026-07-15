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
            <span class="material-icons-round logo-icon">auto_awesome</span>
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
