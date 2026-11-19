import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentService } from '../../../core/student.service';

declare const google: any; // "google" vient du script chargé dans index.html

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css'
})
export class SignIn {
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private router = inject(Router);
  message = signal('');
  showPassword = signal(false); // true = mot de passe visible

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.studentService.login(email, password).subscribe({
      next: (student) => {
        localStorage.setItem('studentId', String(student.id)); // on retient qui est connecté
        this.router.navigate(['/role']);                    // on affiche les deux zones (choix du rôle)
      },
      error: (e) => this.message.set(
        e.status === 401 ? 'Email ou mot de passe incorrect.' : 'Erreur : le serveur ou MySQL (XAMPP) ne répond pas.'
      )
    });
  }

  // Connexion / inscription avec Google
  googleLogin(): void {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: 'TON_CLIENT_ID.apps.googleusercontent.com', // à remplacer par ton Client ID
      scope: 'email profile',                                 // on demande email + nom
      callback: (res: any) => {                               // exécuté après le choix du compte
        this.studentService.googleLogin(res.access_token).subscribe({
          next: (student) => {
            localStorage.setItem('studentId', String(student.id)); // on retient qui est connecté
            this.router.navigate(['/role']);
          },
          error: () => this.message.set('Erreur Google : vérifie que le backend et MySQL (XAMPP) sont lancés.')
        });
      }
    });
    client.requestAccessToken(); // ouvre la fenêtre Google
  }
}
