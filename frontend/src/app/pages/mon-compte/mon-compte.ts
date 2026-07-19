import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MembreService } from '../../services/membre';
import { LivreService } from '../../services/livre';
import { EmpruntService } from '../../services/emprunt.service';
import { MembreAdmin, Membre, Livre, getMembre, Emprunt, STATUT_EN_RETARD, STATUT_RENDU, STATUT_BIENTOT, STATUT_PROLONGE, STATUT_EN_COURS } from '../../utils/token.util';
import { RouterLink } from '@angular/router';
import { StatistiqueService } from '../../services/statistique.service';
import { Statistiques } from '../../utils/stats.util';
import { getCouleurCategorie } from '../../utils/categories.util';


@Component({
  selector: 'app-mon-compte',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink,
    ChartjsComponent,
  ],
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

  // ===== EMPRUNTS (ADMIN) =====
  emprunts: Emprunt[] = [];
  empruntsFiltres: Emprunt[] = [];
  rechercheEmprunt: string = '';
  filtreActifEmprunt: string = 'tous';
  chargementEmprunt: boolean = false;
  errorMsgEmprunt: string = '';


  showModalEmprunt: boolean = false;
  nouvelEmprunt: { id_membre: number | null; id_livre: number | null } = {
    id_membre: null,
    id_livre: null
  };
  messageErreurEmprunt: string = '';

  empruntASupprimer: Emprunt | null = null;

  // ===== MES EMPRUNTS (MEMBRE) =====
  mesEmprunts: Emprunt[] = [];
  empruntsEnCours: Emprunt[] = [];
  empruntsBientotDus: Emprunt[] = [];
  historiqueEmprunts: Emprunt[] = [];
  loadingMesEmprunts: boolean = false;
  errorMsgMesEmprunts: string = '';
  prolongationEnCours: number | null = null;

  // ===== STATISTIQUES (ADMIN) =====
  statistiques: Statistiques | null = null;
  chargementStats: boolean = false;
  errorMsgStats: string = '';

  // Ajout pour le camembert
  pieChartData: any = null;
  pieChartOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} livre(s)`;
          }
        }
      }
    }
  };

  //logs connexion
  logsConnexion: any[] = [];
  membreSelectionneConnexion: number | 'tous' = 'tous';
  optionsMembresConnexion: { id_membre: number; email: string }[] = [];
  
  lineChartData: any = {
    labels: [],
    datasets: []
  };
  lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 40, right: 10, left: 10, bottom: 0 }
    },
    plugins: {
      legend: { display: true },
      tooltip: {
        mode: 'index',
        intersect: false,
        position: 'nearest',
        caretPadding: 10,
        yAlign: 'bottom' // force le tooltip à s'afficher SOUS le point, jamais au-dessus (évite qu'il sorte en haut de la carte)
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  filtresEmprunt: { valeur: string; libelle: string }[] = [
    { valeur: 'tous', libelle: 'Tous les emprunts' },
    { valeur: 'en_cours', libelle: 'En cours' },
    { valeur: 'bientot', libelle: 'Bientôt dû(s)' },
    { valeur: 'prolonge', libelle: 'Prolongé(s)' },
    { valeur: 'en_retard', libelle: 'En retard' },
    { valeur: 'rendu', libelle: 'Rendu(s)' },
  ];

  constructor(
    private membreService: MembreService,
    private livreService: LivreService,
    private empruntService: EmpruntService,
    private statistiqueService: StatistiqueService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.membre = getMembre();
    this.isAdmin = this.membre?.id_role === 1;

    this.route.queryParams.subscribe(params => {
      const section = params['section'];
      this.showSection(section || 'accueil');
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

    if (section === 'mes_emprunts' && this.mesEmprunts.length === 0) {
      this.chargerMesEmprunts();
    }

    if (section === 'statistiques' && !this.statistiques) {
      this.chargerStatistiques();
    }

    if (section === 'accueil') {
      if (!this.statistiques) {
        this.chargerStatistiques();
      }
      if (this.empruntsRecents.length === 0) {
        this.chargerEmpruntsRecents();
      }
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
  // ===== GESTION DES EMPRUNTS (ADMIN) =====
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

      switch (this.filtreActifEmprunt) {
        case 'en_cours':
          resultat = resultat.filter(e => e.id_statut === STATUT_EN_COURS);
          break;
        case 'bientot':
          resultat = resultat.filter(e => e.id_statut === STATUT_BIENTOT);
          break;
        case 'prolonge':
          resultat = resultat.filter(e => e.id_statut === STATUT_PROLONGE);
          break;
        case 'en_retard':
          resultat = resultat.filter(e => e.id_statut === STATUT_EN_RETARD);
          break;
        case 'rendu':
          resultat = resultat.filter(e => e.id_statut === STATUT_RENDU);
          break;
        // 'tous' => pas de filtre
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

  filtrerEmprunts(filtre: string): void {
      this.filtreActifEmprunt = filtre;
      this.appliquerFiltresEmprunts();
  }

  estEnRetard(emprunt: Emprunt): boolean {
    return emprunt.id_statut === STATUT_EN_RETARD;
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

  // ==========================================
  // ===== MES EMPRUNTS (MEMBRE) =====
  // ==========================================

  chargerMesEmprunts(): void {
    this.loading = true;
    this.errorMsg = '';

    this.empruntService.getMesEmprunts().subscribe({
      next: (emprunts) => {
        this.mesEmprunts = emprunts;

        // En cours = tout ce qui n'est pas rendu (en_cours, bientot, en_retard, prolonge)
        this.empruntsEnCours = emprunts.filter(e => e.id_statut !== STATUT_RENDU);

        // Bientôt à rendre = uniquement statut "bientôt"
        this.empruntsBientotDus = emprunts.filter(e => e.id_statut === STATUT_BIENTOT);

        // Historique = rendus
        this.historiqueEmprunts = emprunts.filter(e => e.id_statut === STATUT_RENDU);

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Erreur lors du chargement de vos emprunts.';
        this.loading = false;
      }
    });
  }

  peutProlonger(emprunt: Emprunt): boolean {
    // Backend interdit prolongation si: rendu, en_retard, ou déjà prolongé une fois (nb_prolongations >= MAX)
    return emprunt.id_statut !== STATUT_RENDU
        && emprunt.id_statut !== STATUT_EN_RETARD
        && emprunt.nb_prolongations < 1; // MAX_PROLONGATIONS = 1 côté backend
  }

  getBadgeInfo(emprunt: Emprunt): { classe: string; libelle: string } {
    switch (emprunt.id_statut) {
      case STATUT_RENDU:
        return { classe: 'badge-ok', libelle: 'Rendu' };
      case STATUT_EN_RETARD:
        return { classe: 'badge-retard', libelle: 'En retard' };
      case STATUT_BIENTOT:
        return { classe: 'badge-bientot', libelle: 'Bientôt' };
      case STATUT_PROLONGE:
        return { classe: 'badge-prolonge', libelle: 'Prolongé' };
      case STATUT_EN_COURS:
      default:
        return { classe: 'badge-encours', libelle: 'En cours' };
    }
  }

  prolonger(emprunt: Emprunt): void {
    this.prolongationEnCours = emprunt.id_emprunt;

    this.empruntService.prolongerEmprunt(emprunt.id_emprunt).subscribe({
      next: () => {
        this.prolongationEnCours = null;
        this.chargerMesEmprunts();
      },
      error: (err) => {
        console.error(err);
        this.prolongationEnCours = null;
        alert(err.error?.message || 'Impossible de prolonger cet emprunt.');
      }
    });
  }


  // ==========================================
  // ===== STATISTIQUES (ADMIN) =====
  // ==========================================

  chargerStatistiques(): void {
    this.chargementStats = true;
    this.errorMsgStats = '';

    this.statistiqueService.getStatistiques().subscribe({
      next: (data) => {
        this.statistiques = data;
        this.construirePieChart();
        this.chargerLogsConnexion();
        this.chargementStats = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsgStats = 'Erreur lors du chargement des statistiques.';
        this.chargementStats = false;
      }
    });
  }

  construirePieChart(): void {
    if (this.statistiques?.repartitionCategories?.length) {
      this.pieChartData = {
        labels: this.statistiques.repartitionCategories.map(cat => cat.categorie),
        datasets: [
          {
            data: this.statistiques.repartitionCategories.map(cat => cat.nombre_livres),
            backgroundColor: this.statistiques.repartitionCategories.map(
              cat => getCouleurCategorie(cat.categorie)
            )
          }
        ]
      };
    }
  }

  chargerLogsConnexion(): void {
    this.statistiqueService.getLogsConnexion().subscribe({
      next: (res: any) => {
        this.logsConnexion = res.data;
        this.construireOptionsMembresConnexion();
        this.construireLineChart();
      },
      error: (err) => console.error(err)
    });
  }

  // Construit la liste unique des membres présents dans les logs (pour le select)
  construireOptionsMembresConnexion(): void {
    const map = new Map<number, string>();
    this.logsConnexion.forEach(log => {
      if (!map.has(log.id_membre)) {
        map.set(log.id_membre, log.email);
      }
    });
    this.optionsMembresConnexion = Array.from(map.entries())
      .map(([id_membre, email]) => ({ id_membre, email }))
      .sort((a, b) => a.email.localeCompare(b.email));
  }

  onChangementMembreConnexion(): void {
    this.construireLineChart();
  }

  construireLineChart(): void {
    if (!this.logsConnexion?.length) {
      this.lineChartData = { labels: [], datasets: [] };
      return;
    }

    // 1. Filtrer selon le membre sélectionné
    let logsFiltres = this.logsConnexion;
    if (this.membreSelectionneConnexion !== 'tous') {
      logsFiltres = this.logsConnexion.filter(
        log => log.id_membre === Number(this.membreSelectionneConnexion)
      );
    }

    // 2. Regrouper les connexions par jour (7 derniers jours)
    const nbJours = 7;
    const aujourdHui = new Date();
    const jours: string[] = [];
    const compteurParJour: { [date: string]: number } = {};

    for (let i = nbJours - 1; i >= 0; i--) {
      const d = new Date(aujourdHui);
      d.setDate(d.getDate() - i);
      const cle = d.toISOString().split('T')[0];
      jours.push(cle);
      compteurParJour[cle] = 0;
    }

    // 3. Compter les connexions réussies par jour
    logsFiltres.forEach(log => {
      if (!log.succes) return;
      const cleJour = log.date_connexion.split(' ')[0];
      if (compteurParJour.hasOwnProperty(cleJour)) {
        compteurParJour[cleJour]++;
      }
    });

    // 4. Labels formatés JJ/MM
    const labels = jours.map(j => {
      const [annee, mois, jour] = j.split('-');
      return `${jour}/${mois}`;
    });

    const data = jours.map(j => compteurParJour[j]);

    const labelDataset = this.membreSelectionneConnexion === 'tous'
      ? 'Connexions réussies (tous les membres)'
      : `Connexions de ${this.optionsMembresConnexion.find(o => o.id_membre === Number(this.membreSelectionneConnexion))?.email ?? ''}`;

    this.lineChartData = {
      labels: labels,
      datasets: [
        {
          label: labelDataset,
          data: data,
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54, 162, 235, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#36A2EB'
        }
      ]
    };
  }

  // Helper pour affichage propre du retard (valeur back parfois négative)
  joursRetardAbs(jours: string): number {
    return Math.abs(parseInt(jours, 10));
  }
  
  // ==========================================
  // ===== ACCUEIL =====
  // ==========================================

  empruntsRecents: Emprunt[] = [];

  chargerEmpruntsRecents(): void {
    this.loading = true;
    this.errorMsg = '';

    this.empruntService.getEmpruntsAdmin().subscribe({
      next: (data) => {
        this.empruntsRecents = data
          .slice()
          .sort((a, b) => new Date(b.date_emprunt).getTime() - new Date(a.date_emprunt).getTime())
          .slice(0, 4);

        if (this.emprunts.length === 0) {
          this.emprunts = data;
          this.appliquerFiltresEmprunts();
        }

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Erreur lors du chargement des emprunts récents.';
        this.loading = false;
      }
    });
  }

}