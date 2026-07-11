import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, finalize } from 'rxjs';
import { setToken, getToken, removeToken, setMembre, removeMembre, Membre } from '../utils/token.util';

export interface InscriptionData {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  confirmPassword: string;
  numero_tel: string;
  date_naissance: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:81/api';

  constructor(private http: HttpClient) {}

  inscrireUtilisateur(donnees: InscriptionData): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, donnees);
  }

  connexionUtilisateur(donnees: { email: string; mot_de_passe: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, donnees).pipe(
      tap((response: any) => {
        const token = response?.data?.token;
        const membre: Membre = response?.data?.membre;
        if (token) {
          setToken(token);
        }
        if (membre) {
          setMembre(membre);
        }
      })
    );
  }

  deconnexionUtilisateur(): Observable<any> {
    const token = getToken();
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      finalize(() => {
        removeToken();
        removeMembre();
      })
    );
  }

  isLoggedIn(): boolean {
    return !!getToken();
  }
}