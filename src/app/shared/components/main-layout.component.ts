import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainHeaderComponent } from './main-header.component';
import { SidenavComponent } from './sidenav.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    MainHeaderComponent,
    SidenavComponent,
    RouterOutlet,
  ],
  host: {
    class: 'main-layout',
  },
  template: `
    <div class="layout-container">
      <!-- Главный заголовок на всю ширину -->
      <app-main-header></app-main-header>

      <!-- Основной контент с sidebar -->
      <div class="layout-content">
        <!-- Фиксированный sidebar слева -->
        <aside class="sidebar-fixed">
          <app-sidenav></app-sidenav>
        </aside>

        <!-- Контент страницы справа -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }

    .layout-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .layout-content {
      display: flex;
      flex: 1;
      overflow: hidden;
      background-color: #fafafa;
    }

    .sidebar-fixed {
      width: 180px;
      flex-shrink: 0;
      overflow-y: auto;
      background-color: #f5f5f5;
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      background-color: white;
    }

    @media (max-width: 1024px) {
      .sidebar-fixed {
        width: 200px;
      }

      .page-content {
        padding: 1.5rem;
      }
    }

    @media (max-width: 768px) {
      .layout-content {
        flex-direction: column;
        overflow-y: auto;
      }

      .sidebar-fixed {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid #e0e0e0;
        max-height: 200px;
      }

      .page-content {
        overflow: visible;
        padding: 1rem;
      }
    }
  `,
})
export class MainLayoutComponent {}