import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Catalogue } from './pages/catalogue/catalogue';
import { Emprunts } from './pages/emprunts/emprunts';
import { Connexion } from './pages/connexion/connexion';
import { Inscription } from './pages/inscription/inscription';
import { MonCompte } from './pages/mon-compte/mon-compte';
import { Deconnexion } from './pages/deconnexion/deconnexion';

export const routes: Routes = [
    { path: '', redirectTo: 'home',pathMatch: 'full'},
    { path: 'home', component: Home},
    { path: 'catalogue', component: Catalogue},
    { path: 'emprunt', component: Emprunts},
    { path: 'connexion', component: Connexion},
    { path: 'inscription', component: Inscription},
    { path: 'mon-compte', component: MonCompte},
    { path: 'deconnexion', component: Deconnexion}
];
