import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  getOptions(category: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/options?category=${category}`);
  }

  addLego(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}`, data);
  }

  getLegoResults(searchBy: string, searchValue: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}?searchBy=${searchBy}&searchValue=${searchValue}`);
  }

  editLego(data: any, id: number): Observable<any> {
    return this.http.put(`${environment.apiUrl}/${id}`, data);
  }

  deleteLego(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/${id}`);
  }

}