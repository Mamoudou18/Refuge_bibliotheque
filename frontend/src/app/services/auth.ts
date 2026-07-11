import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}