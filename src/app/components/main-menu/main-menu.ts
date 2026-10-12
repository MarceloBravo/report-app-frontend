import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-main-menu',
  imports: [],
  templateUrl: './main-menu.html',
  styleUrl: './main-menu.sass',
})
export class MainMenu {
  activePath = signal('');

  select(path: string): void {
    this.activePath.set(path);
  }

  ngOnInit(): void {
    this.activePath.set(window.location.pathname);
  }
  

  isActive(path: string): boolean {
    const current = this.activePath().replace(/^\/+/, '').trim();
    return current === path.trim();
  }

  linkClass(path: string): string {
    const base = 'flex items-center gap-3 px-3 py-2-5 rounded-lg text-xs transition-colors';
    return this.isActive(path)
      ? `${base} bg-surface-container-high text-primary font-medium`
      : `${base} text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface`;
  }
}
