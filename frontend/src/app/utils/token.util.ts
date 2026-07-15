const TOKEN_KEY = 'auth_token';
const MEMBRE_KEY = 'auth_membre';

export interface Membre {
  id_membre: number;
  nom: string;
  prenom: string;
  email: string;
  numero_tel: string;
  date_naissance: string;
  id_role: number;
  is_actif: boolean;
  date_inscription: string;
}

export interface MembreAdmin {
  id_membre: number;
  nom: string;
  prenom: string;
  email: string;
  numero_tel: string;
  is_actif: boolean;
  id_role: number;
  role: string;
  date_inscription: string;
}

export interface Livre {
  id_livre: number;
  titre: string;
  auteur: string;
  annee_publication: number | null;
  categorie: string | null;
  description: string | null;
  nb_exemplaires: number;
  nb_disponibles: number;
  url_couverture: string | null;
  date_ajout: string;
  date_maj: string | null;
}

export interface Emprunt {
  id_emprunt: number;
  id_membre: number;
  id_livre: number;
  date_emprunt: string;
  date_retour_prevue: string;
  date_retour_effective: string | null;
  id_statut: number;
  nb_prolongations: number;
  titre_livre: string;
  auteur: string;
  url_couverture: string;
  nom: string;
  prenom: string;
  email: string;
  statut_libelle: string;
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function setMembre(membre: Membre): void {
  localStorage.setItem(MEMBRE_KEY, JSON.stringify(membre));
}

export function getMembre(): Membre | null {
  const data = localStorage.getItem(MEMBRE_KEY);
  return data ? JSON.parse(data) : null;
}

export function removeMembre(): void {
  localStorage.removeItem(MEMBRE_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}