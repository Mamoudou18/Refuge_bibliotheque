export interface StatsGeneral {
  livresTotal: number;
  membresTotal: number;
  empruntsEnCours: number;
  empruntsEnRetard: number;
}

export interface StatsActivite {
  empruntsCeMois: number;
  retoursCeMois: number;
  tauxDeRetard: number;
}

export interface TopLivre {
  titre: string;
  auteur: string;
  nb_emprunts: number;
}

export interface RepartitionCategorie {
  categorie: string;
  nombre_livres: number;
  pourcentage: number;
}

export interface MembreEnRetard {
  nom_membre: string;
  titre_livre: string;
  jours_retard: string;
}

export interface NouveauMembre {
  nom_complet: string;
  date_inscription: string;
}

export interface Statistiques {
  general: StatsGeneral;
  activite: StatsActivite;
  topLivres: TopLivre[];
  repartitionCategories: RepartitionCategorie[];
  membresEnRetard: MembreEnRetard[];
  nouveauxMembres: NouveauMembre[];
}
