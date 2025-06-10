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
    return this.http.get(`${environment.apiUrl}/pieces/code?code=${code}`);
  }

  getLegoPiecesByCategory(category: string, value: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/pieces/category?category=${category}&value=${value}`);
  }

  updateLegoPiece(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/pieces/${id}`, data);
  }

  addLegoPiece(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/pieces`, data);
  }

  deleteLegoPiece(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/pieces/${id}`);
  }
}
