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
}