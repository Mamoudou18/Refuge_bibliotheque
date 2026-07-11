import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-deconnexion',
  template: '<p>Déconnexion en cours...</p>',
})
export class Deconnexion implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.deconnexionUtilisateur().subscribe({
      next: () => {
        this.router.navigate(['/connexion']);
      },
      error: (err) => {
        console.error('Erreur déconnexion', err);
        this.router.navigate(['/connexion']);
      }
    });
  }
}