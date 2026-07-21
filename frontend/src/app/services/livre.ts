import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Livre } from '../utils/token.util';
import { environment } from '../../environments/environment.development';

interface LivresResponse {
  status: string;
  message: string;
  data: {
    livres: Livre[];
  };
}

interface LivreResponse {
  status: string;
  message: string;
  data: {
    livre: Livre;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LivreService {
  private apiUrl = `${environment.apiUrl}/livres`;
  private apiUrlAdmin = `${environment.apiUrl}/admin/livres`;

  constructor(private http: HttpClient) {}

  // ===== ROUTES PUBLIQUES (nécessitent juste d'être connecté) =====

  getLivres(): Observable<Livre[]> {
    return this.http.get<LivresResponse>(this.apiUrl).pipe(
      map(res => res.data.livres)
    );
  }

  getLivre(id: number): Observable<Livre> {
    return this.http.get<LivreResponse>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data.livre)
    );
  }

  // ===== ROUTES ADMIN =====

  getLivresAdmin(): Observable<Livre[]> {
    return this.http.get<LivresResponse>(this.apiUrlAdmin).pipe(
      map(res => res.data.livres)
    );
  }

  getLivreAdmin(id: number): Observable<Livre> {
    return this.http.get<LivreResponse>(`${this.apiUrlAdmin}/${id}`).pipe(
      map(res => res.data.livre)
    );
  }

  creerLivre(donnees: FormData): Observable<Livre> {
    return this.http.post<LivreResponse>(this.apiUrlAdmin, donnees).pipe(
      map(res => res.data.livre)
    );
  }

  modifierLivre(id: number, donnees: FormData): Observable<Livre> {
    donnees.append('_method', 'PUT');
    return this.http.post<LivreResponse>(`${this.apiUrlAdmin}/${id}`, donnees).pipe(
      map(res => res.data.livre)
    );
  }

  supprimerLivre(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrlAdmin}/${id}`);
  }
}