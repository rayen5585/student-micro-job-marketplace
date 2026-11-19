import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-skill-tag',
  templateUrl: './skill-tag.html',
  styleUrl: './skill-tag.css'
})
export class SkillTag {

  // Input : le parent donne le nom de la compétence (obligatoire)
  name = input.required<string>();

  // Input : le parent dit si on affiche le bouton × (faux par défaut)
  removable = input(false);

  // Output : l'enfant prévient le parent qu'on veut supprimer, et lui envoie le nom
  remove = output<string>();

  onRemove(): void {
    this.remove.emit(this.name());
  }
}
