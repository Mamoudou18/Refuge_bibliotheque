import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MembreService } from '../../services/membre';
import { MembreAdmin, Membre, getMembre } from '../../utils/token.util';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mon-compte',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mon-compte.html',
  styleUrl: './mon-compte.scss',
})
export class MonCompte implements OnInit {
  activeSection: string = 'accueil';
  membres: MembreAdmin[] = [];
  membresFiltres: MembreAdmin[] = [];
  filtreActuel: string = 'tous';
  rechercheTerme: string = '';
  loading: boolean = false;
  errorMsg: string = '';

  // Nouvelles propriétés
  membre: Membre | null = null;
  isAdmin: boolean = false;

  constructor(
    private membreService: MembreService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.membre = getMembre();
    this.isAdmin = this.membre?.id_role === 1;

    // Lecture du query param "section" (ex: /mon-compte?section=membres)
    this.route.queryParams.subscribe(params => {
      const section = params['section'];
      if (section) {
        this.showSection(section);
      }
    });
  }

  showSection(section: string): void {
    const sectionsAdmin = ['livres', 'membres', 'emprunts', 'statistiques'];

    if (sectionsAdmin.includes(section) && !this.isAdmin) {
      // Accès refusé, on ne change pas de section
      alert('Accès non autorisé.');
      return;
    }

    this.activeSection = section;
    if (section === 'membres' && this.membres.length === 0) {
      this.chargerMembres();
    }
  }

  chargerMembres(): void {
    this.loading = true;
    this.errorMsg = '';
    this.membreService.getMembres().subscribe({
      next: (data) => {
        this.membres = data;
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Erreur lors du chargement des membres.';
        this.loading = false;
      }
    });
  }

  setFiltre(filtre: string): void {
    this.filtreActuel = filtre;
    this.appliquerFiltres();
  }

  onRecherche(): void {
    this.appliquerFiltres();
  }

  appliquerFiltres(): void {
    let resultat = [...this.membres];

    if (this.filtreActuel === 'actif') {
      resultat = resultat.filter(m => m.is_actif);
    } else if (this.filtreActuel === 'inactif') {
      resultat = resultat.filter(m => !m.is_actif);
    }

    if (this.rechercheTerme.trim()) {
      const terme = this.rechercheTerme.toLowerCase();
      resultat = resultat.filter(m =>
        m.nom.toLowerCase().includes(terme) ||
        m.prenom.toLowerCase().includes(terme) ||
        m.email.toLowerCase().includes(terme)
      );
    }

    this.membresFiltres = resultat;
  }

  toggleStatut(membre: MembreAdmin): void {
    const nouveauStatut = !membre.is_actif;
    this.membreService.toggleStatut(membre.id_membre, nouveauStatut).subscribe({
      next: () => {
        membre.is_actif = nouveauStatut;
        this.appliquerFiltres();
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la mise à jour du statut.');
      }
    });
  }
}