import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Catalogue } from './pages/catalogue/catalogue';
import { DetailLivre } from './pages/detail-livre/detail-livre';
import { Emprunts } from './pages/emprunts/emprunts';
import { Connexion } from './pages/connexion/connexion';
import { Inscription } from './pages/inscription/inscription';
import { MonCompte } from './pages/mon-compte/mon-compte';
import { Deconnexion } from './pages/deconnexion/deconnexion';
import { authGuard } from './services/auth-guard';


export const routes: Routes = [
    { path: '', redirectTo: 'home',pathMatch: 'full'},
    { path: 'home', component: Home},
    { path: 'catalogue', component: Catalogue, canActivate: [authGuard]},
    { path: 'detail-livre', component: DetailLivre},
    { path: 'emprunt', component: Emprunts},
    { path: 'connexion', component: Connexion},
    { path: 'inscription', component: Inscription},
    { path: 'mon-compte', component: MonCompte},
    { path: 'deconnexion', component: Deconnexion}
];
