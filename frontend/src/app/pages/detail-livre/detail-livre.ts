import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LivreService } from '../../services/livre';
import { Livre } from '../../utils/token.util';

@Component({
  selector: 'app-detail-livre',
  imports: [CommonModule, RouterLink],
  templateUrl: './detail-livre.html',
  styleUrl: './detail-livre.scss',
})
export class DetailLivre implements OnInit {
  livre: Livre | null = null;
  chargement: boolean = true;
  erreur: string = '';

  constructor(
    private route: ActivatedRoute,
    private livreService: LivreService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.erreur = 'Identifiant du livre invalide.';
      this.chargement = false;
      return;
    }

    this.livreService.getLivre(id).subscribe({
      next: (livre) => {
        this.livre = livre;
        this.chargement = false;
      },
      error: (err) => {
        console.error(err);
        this.erreur = 'Impossible de charger les détails du livre.';
        this.chargement = false;
      }
    });
  }

  getBadgeClass(categorie: string | null): string {
    switch (categorie) {
      case 'Roman':
        return 'badge-roman';
      case 'Science-Fiction':
        return 'badge-scifi';
      case 'Jeunesse':
        return 'badge-jeunesse';
      case 'Policier':
        return 'badge-policier';
      case 'Histoire':
        return 'badge-histoire';
      default:
        return 'badge-secondary';
    }
  }
}