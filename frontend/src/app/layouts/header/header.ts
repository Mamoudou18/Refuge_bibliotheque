import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  constructor(private authService: AuthService) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get initiales(): string {
    const membre = this.authService.getMembreConnecte();
    if (!membre) return '';
    const p = membre.prenom?.charAt(0)?.toUpperCase() ?? '';
    const n = membre.nom?.charAt(0)?.toUpperCase() ?? '';
    return `${p}${n}`;
  }
}