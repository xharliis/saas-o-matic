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
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
      color: #f1f5f9;
    }

    .app-header {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: #fff;
    }

    .logo-icon {
      font-size: 2rem;
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.3));
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      background: linear-gradient(to right, #ffffff, #cbd5e1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .header-badge {
      font-size: 0.85rem;
      font-weight: 500;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.2);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .app-main {
      flex: 1;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 2.5rem 2rem;
      box-sizing: border-box;
    }

    .app-footer {
      text-align: center;
      padding: 2rem;
      font-size: 0.85rem;
      color: #64748b;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      background: rgba(10, 15, 30, 0.5);
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 0.75rem;
      }
      .app-main {
        padding: 1.5rem 1rem;
      }
    }
  `]
})
export class AppComponent {}
