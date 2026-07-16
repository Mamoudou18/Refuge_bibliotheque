import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Emprunt } from '../utils/token.util';

interface EmpruntsResponse {
  status: string;
  message: string;
  data: Emprunt[];
}

interface EmpruntResponse {
  status: string;
  message: string;
  data: Emprunt;
}

@Injectable({
  providedIn: 'root',
})
export class EmpruntService {
  private apiUrl = 'http://localhost:81/api/emprunts';
  private apiUrlAdmin = 'http://localhost:81/api/admin/emprunts';

  constructor(private http: HttpClient) {}

  // ===== ROUTES ADMIN =====

  getEmpruntsAdmin(): Observable<Emprunt[]> {
    return this.http.get<EmpruntsResponse>(this.apiUrlAdmin).pipe(
      map(res => res.data)
    );
  }

  creerEmprunt(id_membre: number, id_livre: number): Observable<Emprunt> {
    return this.http.post<EmpruntResponse>(this.apiUrlAdmin, { id_membre, id_livre }).pipe(
      map(res => res.data)
    );
  }

  retournerLivre(id_emprunt: number): Observable<Emprunt> {
    return this.http.patch<EmpruntResponse>(`${this.apiUrlAdmin}/${id_emprunt}`, {}).pipe(
      map(res => res.data)
    );
  }

  // ===== ROUTES MEMBRE =====

  // Liste des emprunts du membre connecté
  getMesEmprunts(): Observable<Emprunt[]> {
    return this.http.get<EmpruntsResponse>(this.apiUrl).pipe(
      map(res => res.data)
    );
  }

  // Emprunter un livre
  emprunterLivre(id_livre: number): Observable<Emprunt> {
    return this.http.post<EmpruntResponse>(this.apiUrl, { id_livre }).pipe(
      map(res => res.data)
    );
  }

  // Prolonger un emprunt
  prolongerEmprunt(id_emprunt: number): Observable<Emprunt> {
    return this.http.patch<EmpruntResponse>(`${this.apiUrl}/${id_emprunt}/prolonger`, {}).pipe(
      map(res => res.data)
    );
  }
}