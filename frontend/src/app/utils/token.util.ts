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