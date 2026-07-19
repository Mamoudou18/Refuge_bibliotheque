import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LivreService } from '../../services/livre';
import { Livre } from '../../utils/token.util';
import { getBadgeClass } from '../../utils/categories.util';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './catalogue.html',
  styleUrl: './catalogue.scss',
})
export class Catalogue implements OnInit {
  livres: Livre[] = [];
  livresFiltres: Livre[] = [];
  groupesLivres: Livre[][] = [];
  recherche: string = '';
  categorieActive: string = 'Tous';
  isLoading: boolean = true;
  erreur: string = '';

  categories: string[] = ['Tous', 'Roman', 'Conte', 'BD', 'Jeunesse', 'Doc'];

  // couleur des badges
  getBadgeClass = getBadgeClass;

  constructor(private livreService: LivreService) {}

  ngOnInit(): void {
    this.chargerLivres();
  }

  chargerLivres(): void {
    this.isLoading = true;
    this.livreService.getLivres().subscribe({
      next: (data) => {
        this.livres = data;
        this.livresFiltres = data;
        this.groupesLivres = this.chunkArray(data, 4);
        this.isLoading = false;
      },
      error: (err) => {
        this.erreur = 'Erreur lors du chargement des livres.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  filtrerParCategorie(categorie: string): void {
    this.categorieActive = categorie;
    this.appliquerFiltres();
  }

  onRechercheChange(): void {
    this.appliquerFiltres();
  }

  appliquerFiltres(): void {
    let resultat = this.livres;

    if (this.categorieActive !== 'Tous') {
      resultat = resultat.filter(
        (livre) => livre.categorie?.toLowerCase() === this.categorieActive.toLowerCase()
      );
    }

    if (this.recherche.trim() !== '') {
      const terme = this.recherche.toLowerCase();
      resultat = resultat.filter(
        (livre) =>
          livre.titre.toLowerCase().includes(terme) ||
          livre.auteur.toLowerCase().includes(terme)
      );
    }

    this.livresFiltres = resultat;
    this.groupesLivres = this.chunkArray(resultat, 4);
  }

  chunkArray(arr: Livre[], taille: number): Livre[][] {
    const resultat: Livre[][] = [];
    for (let i = 0; i < arr.length; i += taille) {
      resultat.push(arr.slice(i, i + taille));
    }
    return resultat;
  }
}