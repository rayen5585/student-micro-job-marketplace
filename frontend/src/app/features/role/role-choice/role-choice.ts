import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../../../core/student.service';

@Component({
  selector: 'app-role-choice',
  templateUrl: './role-choice.html',
  styleUrl: './role-choice.css'
})
export class RoleChoice {

  private studentService = inject(StudentService);
  private router = inject(Router);

  message = signal('');   // texte d'erreur, vide au départ
  saving = signal(false); // true pendant l'enregistrement : bloque un 2e clic

  // Appelée au clic sur une des deux zones : 'client' ou 'freelancer'
  choose(role: 'client' | 'freelancer'): void {
    const id = Number(localStorage.getItem('studentId'));
    if (!id) {
      this.router.navigate(['/sign-in']);
      return;
    }

    this.saving.set(true);
    this.message.set('');

    // On enregistre le rôle dans la base (PUT /api/students/:id avec { role })
    this.studentService.updateStudent(id, { role }).subscribe({
      // Les deux zones (Client et Freelancer) ouvrent la même page : client layout (celle de ton ami)
      next: () => this.router.navigate(['/client']),
      error: () => {
        this.saving.set(false);
        this.message.set('Erreur : le rôle n\'a pas été enregistré. Vérifie que le backend et MySQL (XAMPP) sont lancés.');
      }
    });
  }
}
