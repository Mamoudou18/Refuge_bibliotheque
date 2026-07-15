import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MembreService } from '../../services/membre';
import { LivreService } from '../../services/livre';
import { EmpruntService } from '../../services/emprunt.service';
import { MembreAdmin, Membre, Livre, getMembre, Emprunt } from '../../utils/token.util';
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

  // ===== MEMBRES =====
  membres: MembreAdmin[] = [];
  membresFiltres: MembreAdmin[] = [];
  filtreActuel: string = 'tous';
  rechercheTerme: string = '';
  loading: boolean = false;
  errorMsg: string = '';

  membre: Membre | null = null;
  isAdmin: boolean = false;

  // ===== LIVRES =====
  livres: Livre[] = [];
  livresFiltres: Livre[] = [];
  rechercheLivre: string = '';
  filtreActifLivre: 'tous' | 'disponible' | 'indisponible' = 'tous';

  showModalLivre: boolean = false;
  modeEditionLivre: boolean = false;
  livreSelectionne: Partial<Livre> = {};
  livreASupprimer: Livre | null = null;
  afficherConfirmationSuppressionLivre = false;
  showModalSuppressionLivre: boolean = false;

  messageErreurLivre: string = '';
  chargementLivre: boolean = false;

  fichierImageLivre: File | null = null;
  previewImageLivre: string | null = null;


  // ===== EMPRUNTS =====
  emprunts: Emprunt[] = [];
  empruntsFiltres: Emprunt[] = [];
  rechercheEmprunt: string = '';
  filtreActifEmprunt: 'tous' | 'en_cours' | 'retourne' | 'en_retard' = 'tous';
  chargementEmprunt: boolean = false;
  errorMsgEmprunt: string = '';

  showModalEmprunt: boolean = false;
  nouvelEmprunt: { id_membre: number | null; id_livre: number | null } = {
    id_membre: null,
    id_livre: null
  };
  messageErreurEmprunt: string = '';

  empruntASupprimer: Emprunt | null = null;

  constructor(
    private membreService: MembreService,
    private livreService: LivreService,
    private empruntService: EmpruntService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.membre = getMembre();
    this.isAdmin = this.membre?.id_role === 1;

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
      alert('Accès non autorisé.');
      return;
    }

    this.activeSection = section;

    if (section === 'membres' && this.membres.length === 0) {
      this.chargerMembres();
    }

    if (section === 'livres' && this.livres.length === 0) {
      this.chargerLivres();
    }

    if (section === 'emprunts' && this.emprunts.length === 0) {
      this.chargerEmprunts();
    }
  }

  // ==========================================
  // ===== GESTION DES MEMBRES =====
  // ==========================================

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

  // ==========================================
  // ===== GESTION DES LIVRES =====
  // ==========================================

  chargerLivres(): void {
    this.livreService.getLivresAdmin().subscribe({
      next: (livres) => {
        this.livres = livres;
        this.appliquerFiltresLivres();
      },
      error: (err) => {
        console.error('Erreur chargement livres', err);
      }
    });
  }

  appliquerFiltresLivres(): void {
    let resultat = [...this.livres];

    if (this.filtreActifLivre === 'disponible') {
      resultat = resultat.filter(l => l.nb_disponibles > 0);
    } else if (this.filtreActifLivre === 'indisponible') {
      resultat = resultat.filter(l => l.nb_disponibles === 0);
    }

    if (this.rechercheLivre.trim() !== '') {
      const terme = this.rechercheLivre.toLowerCase();
      resultat = resultat.filter(l =>
        l.titre.toLowerCase().includes(terme) ||
        l.auteur.toLowerCase().includes(terme) ||
        (l.categorie ?? '').toLowerCase().includes(terme)
      );
    }

    this.livresFiltres = resultat;
  }

  onRechercheLivreChange(): void {
    this.appliquerFiltresLivres();
  }

  filtrerLivres(filtre: 'tous' | 'disponible' | 'indisponible'): void {
    this.filtreActifLivre = filtre;
    this.appliquerFiltresLivres();
  }

  ouvrirModalAjout(): void {
    this.modeEditionLivre = false;
    this.livreSelectionne = {
      titre: '',
      auteur: '',
      annee_publication: null,
      categorie: '',
      description: '',
      nb_exemplaires: 1,
      nb_disponibles: 1,
      url_couverture: ''
    };
    this.fichierImageLivre = null;
    this.previewImageLivre = null;
    this.messageErreurLivre = '';
    this.showModalLivre = true;
  }

  ouvrirModalModification(livre: Livre): void {
    this.modeEditionLivre = true;
    this.livreSelectionne = { ...livre };
    this.fichierImageLivre = null;
    this.previewImageLivre = livre.url_couverture || null;
    this.messageErreurLivre = '';
    this.showModalLivre = true;
  }

  onFichierImageSelectionne(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const fichier = input.files[0];

    if (!fichier.type.startsWith('image/')) {
      this.messageErreurLivre = 'Le fichier doit être une image.';
      return;
    }

    if (fichier.size > 2 * 1024 * 1024) {
      this.messageErreurLivre = 'L\'image ne doit pas dépasser 2 Mo.';
      return;
    }

    this.messageErreurLivre = '';
    this.fichierImageLivre = fichier;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImageLivre = reader.result as string;
    };
    reader.readAsDataURL(fichier);
  }

  supprimerImageLivre(): void {
    this.fichierImageLivre = null;
    this.previewImageLivre = null;
    this.livreSelectionne.url_couverture = '';
  }

  fermerModalLivre(): void {
    this.showModalLivre = false;
    this.livreSelectionne = {};
    this.messageErreurLivre = '';
  }

  soumettreLivre(): void {
    if (!this.livreSelectionne.titre || !this.livreSelectionne.auteur) {
      this.messageErreurLivre = 'Le titre et l\'auteur sont obligatoires.';
      return;
    }

    if (
      this.livreSelectionne.nb_disponibles !== undefined &&
      this.livreSelectionne.nb_exemplaires !== undefined &&
      this.livreSelectionne.nb_disponibles > this.livreSelectionne.nb_exemplaires
    ) {
      this.messageErreurLivre = 'Le nombre de disponibles ne peut pas dépasser le nombre d\'exemplaires.';
      return;
    }

    this.chargementLivre = true;

    const formData = new FormData();
    formData.append('titre', this.livreSelectionne.titre ?? '');
    formData.append('auteur', this.livreSelectionne.auteur ?? '');
    formData.append('categorie', this.livreSelectionne.categorie ?? '');
    formData.append('description', this.livreSelectionne.description ?? '');
    formData.append('annee_publication', String(this.livreSelectionne.annee_publication ?? ''));
    formData.append('nb_exemplaires', String(this.livreSelectionne.nb_exemplaires ?? 1));
    formData.append('nb_disponibles', String(this.livreSelectionne.nb_disponibles ?? 1));

    if (this.fichierImageLivre) {
      formData.append('image', this.fichierImageLivre);
    }

    if (this.modeEditionLivre && this.livreSelectionne.id_livre) {
      this.livreService.modifierLivre(this.livreSelectionne.id_livre, formData).subscribe({
        next: () => {
          this.chargerLivres();
          this.fermerModalLivre();
          this.chargementLivre = false;
        },
        error: (err) => {
          this.messageErreurLivre = err.error?.message || 'Erreur lors de la modification.';
          this.chargementLivre = false;
        }
      });
    } else {
      this.livreService.creerLivre(formData).subscribe({
        next: () => {
          this.chargerLivres();
          this.fermerModalLivre();
          this.chargementLivre = false;
        },
        error: (err) => {
          this.messageErreurLivre = err.error?.message || 'Erreur lors de la création.';
          this.chargementLivre = false;
        }
      });
    }
  }

  demanderSuppressionLivre(livre: Livre): void {
    this.livreASupprimer = livre;
    this.showModalSuppressionLivre = true;
  }

  annulerSuppressionLivre(): void {
    this.livreASupprimer = null;
    this.showModalSuppressionLivre = false;
  }

  confirmerSuppressionLivre(): void {
    if (!this.livreASupprimer) return;

    this.livreService.supprimerLivre(this.livreASupprimer.id_livre).subscribe({
      next: () => {
        this.chargerLivres();
        this.annulerSuppressionLivre();
      },
      error: (err) => {
        console.error('Erreur suppression', err);
        alert(err.error?.message || 'Erreur lors de la suppression.');
        this.annulerSuppressionLivre();
      }
    });
  }

  // ==========================================
  // ===== GESTION DES EMPRUNTS =====
  // ==========================================

  chargerEmprunts(): void {
    this.chargementEmprunt = true;
    this.errorMsgEmprunt = '';
    this.empruntService.getEmpruntsAdmin().subscribe({
      next: (data) => {
        this.emprunts = data;
        this.appliquerFiltresEmprunts();
        this.chargementEmprunt = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsgEmprunt = 'Erreur lors du chargement des emprunts.';
        this.chargementEmprunt = false;
      }
    });
  }

  appliquerFiltresEmprunts(): void {
    let resultat = [...this.emprunts];

    if (this.filtreActifEmprunt === 'en_cours') {
      resultat = resultat.filter(e => e.date_retour_effective === null && !this.estEnRetard(e));
    } else if (this.filtreActifEmprunt === 'retourne') {
      resultat = resultat.filter(e => e.date_retour_effective !== null);
    } else if (this.filtreActifEmprunt === 'en_retard') {
      resultat = resultat.filter(e => this.estEnRetard(e));
    }

    if (this.rechercheEmprunt.trim() !== '') {
      const terme = this.rechercheEmprunt.toLowerCase();
      resultat = resultat.filter(e =>
        e.titre_livre.toLowerCase().includes(terme) ||
        e.nom.toLowerCase().includes(terme) ||
        e.prenom.toLowerCase().includes(terme) ||
        e.email.toLowerCase().includes(terme)
      );
    }

    this.empruntsFiltres = resultat;
  }

  onRechercheEmpruntChange(): void {
    this.appliquerFiltresEmprunts();
  }

  filtrerEmprunts(filtre: 'tous' | 'en_cours' | 'retourne' | 'en_retard'): void {
    this.filtreActifEmprunt = filtre;
    this.appliquerFiltresEmprunts();
  }

  estEnRetard(emprunt: Emprunt): boolean {
    if (emprunt.date_retour_effective !== null) return false;
    const aujourdHui = new Date();
    const dateRetourPrevue = new Date(emprunt.date_retour_prevue);
    return aujourdHui > dateRetourPrevue;
  }

  ouvrirModalEmprunt(): void {
    this.nouvelEmprunt = { id_membre: null, id_livre: null };
    this.messageErreurEmprunt = '';
    this.showModalEmprunt = true;

    if (this.membres.length === 0) {
      this.chargerMembres();
    }
    if (this.livres.length === 0) {
      this.chargerLivres();
    }
  }

  fermerModalEmprunt(): void {
    this.showModalEmprunt = false;
    this.nouvelEmprunt = { id_membre: null, id_livre: null };
    this.messageErreurEmprunt = '';
  }

  soumettreEmprunt(): void {
    if (!this.nouvelEmprunt.id_membre || !this.nouvelEmprunt.id_livre) {
      this.messageErreurEmprunt = 'Veuillez sélectionner un membre et un livre.';
      return;
    }

    this.chargementEmprunt = true;

    this.empruntService.creerEmprunt(this.nouvelEmprunt.id_membre, this.nouvelEmprunt.id_livre).subscribe({
      next: () => {
        this.chargerEmprunts();
        this.chargerLivres();
        this.fermerModalEmprunt();
        this.chargementEmprunt = false;
      },
      error: (err) => {
        this.messageErreurEmprunt = err.error?.message || 'Erreur lors de la création de l\'emprunt.';
        this.chargementEmprunt = false;
      }
    });
  }

  retournerLivre(emprunt: Emprunt): void {
    if (!confirm(`Confirmer le retour de "${emprunt.titre_livre}" ?`)) return;

    this.empruntService.retournerLivre(emprunt.id_emprunt).subscribe({
      next: (empruntMisAJour) => {
        const index = this.emprunts.findIndex(e => e.id_emprunt === emprunt.id_emprunt);
        if (index !== -1) {
          this.emprunts[index] = empruntMisAJour;
        }
        this.appliquerFiltresEmprunts();
        this.chargerLivres();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Erreur lors du retour du livre.');
      }
    });
  }
}