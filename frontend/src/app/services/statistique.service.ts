import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Statistiques } from '../utils/stats.util';

interface StatsResponse {
  status: string;
  message: string;
  data: Statistiques;
}

@Injectable({
  providedIn: 'root',
})
export class StatistiqueService {
  private apiUrl = 'http://localhost:81/api/stats';
  private apiAdminUrl = 'http://localhost:81/api/admin'

  constructor(private http: HttpClient) {}

  getStatistiques(): Observable<Statistiques> {
    return this.http.get<StatsResponse>(this.apiUrl).pipe(
      map(res => res.data)
    );
  }

  getLogsConnexion(): Observable<any> {
    return this.http.get<any>(`${this.apiAdminUrl}/logs-connexion`);
  }
}