import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LivreService } from '../../services/livre';
import { EmpruntService } from '../../services/emprunt.service';
import { Livre, getMembre } from '../../utils/token.util';

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

  showModalEmprunt = false;
  chargementEmprunt = false;
  messageErreurEmprunt = '';
  empruntReussi = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private livreService: LivreService,
    private empruntService: EmpruntService
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

  // ==========================================
  // ===== GESTION DE L'EMPRUNT =====
  // ==========================================

  demanderEmprunt(): void {
    if (!this.livre || this.livre.nb_disponibles === 0) return;

    const membre = getMembre();
    if (!membre) {
      this.router.navigate(['/connexion']); // adaptez la route si besoin
      return;
    }

    this.messageErreurEmprunt = '';
    this.empruntReussi = false;
    this.showModalEmprunt = true;
  }

  annulerEmprunt(): void {
    this.showModalEmprunt = false;
    this.messageErreurEmprunt = '';
  }

  confirmerEmprunt(): void {
    if (!this.livre) return;

    const membre = getMembre();
    if (!membre) {
      this.messageErreurEmprunt = 'Vous devez être connecté pour emprunter un livre.';
      return;
    }

    this.chargementEmprunt = true;
    this.messageErreurEmprunt = '';

    this.empruntService.emprunterLivre(this.livre.id_livre).subscribe({
      next: () => {
        this.chargementEmprunt = false;
        this.empruntReussi = true;
        if (this.livre) {
          this.livre.nb_disponibles -= 1;
        }
        setTimeout(() => {
          this.showModalEmprunt = false;
          this.empruntReussi = false;
        }, 1500);
      },
      error: (err) => {
        this.chargementEmprunt = false;
        this.messageErreurEmprunt = err.error?.message || 'Erreur lors de l\'emprunt du livre.';
      }
    });
  }
}