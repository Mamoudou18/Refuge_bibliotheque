import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { MembreAdmin } from '../utils/token.util';
import { environment } from '../../environments/environment.development';

interface MembresResponse {
  status: string;
  message: string;
  data: {
    membres: MembreAdmin[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class MembreService {
  private apiUrl = `${environment.apiUrl}/membres`;

  constructor(private http: HttpClient) {}

  getMembres(): Observable<MembreAdmin[]> {
    return this.http.get<MembresResponse>(this.apiUrl).pipe(
      map(res => res.data.membres)
    );
  }

  toggleStatut(id: number, nouveauStatut: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/statut`, { is_actif: nouveauStatut });
  }
}