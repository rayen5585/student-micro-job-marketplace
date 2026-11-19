import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentService, Student } from '../../../core/student.service';
import { SkillTag } from '../skill-tag/skill-tag';

@Component({
  selector: 'app-student-profile',
  imports: [FormsModule, SkillTag],
  templateUrl: './student-profile.html',
  styleUrl: './student-profile.css'
})
export class StudentProfile implements OnInit {

  private studentService = inject(StudentService);
  private router = inject(Router);

  // Signals : Angular met l'écran à jour tout seul quand leur valeur change
  student = signal<Student | null>(null);
  editStudent = signal<Student | null>(null);
  editMode = signal(false);

  // computed() : valeur calculée à partir d'un signal, recalculée automatiquement quand il change
  skillsCount = computed(() => this.student()?.skills.length ?? 0);

  // effect() : s'exécute à chaque fois que le signal qu'il lit (student) change
  logProfile = effect(() => {
    console.log('Profil mis à jour :', this.student()?.name);
  });

  // Champ de saisie simple, lié à l'écran avec [(ngModel)]
  newSkill = '';

  ngOnInit(): void {
    // Côté serveur (SSR) localStorage n'existe pas : le chargement se fait dans le navigateur
    if (typeof localStorage === 'undefined') return;

    // Pas connecté -> retour à la page de connexion
    const id = Number(localStorage.getItem('studentId'));
    if (!id) {
      this.router.navigate(['/sign-in']);
      return;
    }

    this.studentService.getStudent(id).subscribe({
      next: (data) => this.student.set(data),
      error: (error) => {
        console.error(error);
        // Compte introuvable ou serveur arrêté -> on repart de la connexion
        localStorage.removeItem('studentId');
        localStorage.removeItem('token');
        this.router.navigate(['/sign-in']);
      }
    });
  }

  beginEdit(): void {
    const student = this.student();
    if (student) {
      // On modifie une copie, pour pouvoir annuler sans toucher à l'original
      this.editStudent.set({ ...student, skills: [...student.skills] });
      this.editMode.set(true);
    }
  }

  addSkill(): void {
    const edit = this.editStudent();
    if (!edit || !this.newSkill.trim()) return;

    // On met un nouvel objet dans le signal (set), sinon Angular ne voit pas le changement
    this.editStudent.set({ ...edit, skills: [...edit.skills, this.newSkill.trim()] });
    this.newSkill = '';
  }

  removeSkill(skill: string): void {
    // update() : on calcule la nouvelle valeur à partir de l'ancienne
    this.editStudent.update(edit =>
      edit && { ...edit, skills: edit.skills.filter(s => s !== skill) }
    );
  }

  updateSkills(value: string): void {
    this.editStudent.update(edit =>
      edit && {
        ...edit,
        skills: value
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)
      }
    );
  }

  cancelEdit(): void {
    this.editMode.set(false);
    this.editStudent.set(null);
  }

  saveProfile(): void {
    const edit = this.editStudent();
    if (!edit) return;

    this.studentService.updateStudent(edit.id, edit).subscribe({
      next: (data) => {
        this.student.set(data);
        this.editStudent.set(null);
        this.editMode.set(false);
      },
      error: (error) => {
        console.error('Erreur :', error);
        alert(error.status === 0
          ? 'Le backend ne répond pas : lance "npm start" dans student-1-backend.'
          : 'Erreur lors de la modification.');
      }
    });
  }
}
