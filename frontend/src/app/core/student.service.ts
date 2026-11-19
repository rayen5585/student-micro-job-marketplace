import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Student {
  id: number;
  name: string;
  email: string;
  skills: string[];
  portfolio: string;
  createdAt: string;
  role?: 'client' | 'freelancer' | null; // choisi sur la page /role
  token?: string; // jeton JWT, renvoyé seulement à la connexion
  password?: string; // envoyé seulement à l'inscription, jamais renvoyé par le backend
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private apiUrl = 'http://localhost:3000/api/students';

  constructor(private http: HttpClient) {}

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  getStudent(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  createStudent(student: Partial<Student>): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, student);
  }

  updateStudent(id: number, student: Partial<Student>): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student);
  }

  deleteStudent(id: number): Observable<Student> {
    return this.http.delete<Student>(`${this.apiUrl}/${id}`);
  }

  // Garde le jeton JWT dans le navigateur (s'il est présent dans la réponse)
  private saveToken(student: Student): void {
    if (student.token) {
      localStorage.setItem('token', student.token);
    }
  }

  // Connexion avec email + mot de passe
  login(email: string, password: string): Observable<Student> {
    return this.http
      .post<Student>('http://localhost:3000/api/auth/login', { email, password })
      .pipe(tap(student => this.saveToken(student)));
  }

  // Connexion / inscription avec Google : le backend crée l'étudiant s'il n'existe pas
  googleLogin(accessToken: string): Observable<Student> {
    return this.http
      .post<Student>('http://localhost:3000/api/auth/google', { accessToken })
      .pipe(tap(student => this.saveToken(student)));
  }
}