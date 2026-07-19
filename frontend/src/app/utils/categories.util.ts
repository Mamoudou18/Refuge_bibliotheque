export interface CategorieInfo {
  classe: string;
  couleur: string;
}

export const CATEGORIES_INFO: { [key: string]: CategorieInfo } = {
  'Roman':     { classe: 'badge-roman',    couleur: '#F5A623' },
  'BD':        { classe: 'badge-bd',       couleur: '#1B5FA8' },
  'Jeunesse':  { classe: 'badge-jeunesse', couleur: '#4BC0C0' },
  'Conte':  { classe: 'badge-conte', couleur: '#a1cd42' },
  'Poésie':  { classe: 'badge-poesie', couleur: '#e271cf' },
  'Doc':       { classe: 'badge-doc',      couleur: '#044d4d' }
};

export const CATEGORIE_DEFAUT: CategorieInfo = { classe: 'badge-roman', couleur: '#FF6384' };

export function getCategorieInfo(categorie: string | null): CategorieInfo {
  return categorie ? (CATEGORIES_INFO[categorie] || CATEGORIE_DEFAUT) : CATEGORIE_DEFAUT;
}

// Raccourcis pratiques
export function getBadgeClass(categorie: string | null): string {
  return getCategorieInfo(categorie).classe;
}

export function getCouleurCategorie(categorie: string | null): string {
  return getCategorieInfo(categorie).couleur;
}