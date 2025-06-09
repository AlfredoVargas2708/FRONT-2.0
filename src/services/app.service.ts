import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  getLegoPieces(): Observable<any> {
    return this.http.get(`${environment.apiUrl}`)
  }

  getSetImages(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/images`)
  }

  getOptions(category: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/options?category=${category}`)
  }

  getLegoPiecesByCode(code: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/pieces/${code}`);
  }

  updateLegoPiece(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/pieces/${id}`, data);
  }
}
