import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentService } from '../../../core/student.service';

declare const google: any; // "google" vient du script chargé dans index.html

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  return group.get('password')?.value === group.get('confirmPassword')?.value
    ? null
    : { mismatch: true };
}

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css'
})
export class SignUp {
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private router = inject(Router);
  error = signal('');
  showPassword = signal(false);

  form = this.fb.nonNullable.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordsMatch }
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { firstName, lastName, email, password } = this.form.getRawValue();
    const name = `${firstName} ${lastName}`.trim(); // "Prénom Nom"
    this.studentService
      .createStudent({ name, email, password, skills: [], portfolio: '' })
      .subscribe({
        next: () => this.router.navigate(['/sign-in']),
        error: (e) => this.error.set(
          e.status === 409 ? 'Cet email est déjà utilisé.' : 'Erreur : vérifie que le backend et MySQL (XAMPP) sont lancés.'
        )
      });
  }

  // Inscription / connexion avec Google
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
          error: () => this.error.set('Erreur Google : vérifie que le backend et MySQL (XAMPP) sont lancés.')
        });
      }
    });
    client.requestAccessToken(); // ouvre la fenêtre Google
  }
}