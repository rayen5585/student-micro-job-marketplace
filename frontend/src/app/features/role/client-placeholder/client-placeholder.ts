import { Component } from '@angular/core';

// Page TEMPORAIRE : à remplacer par la page client de ton ami quand tu fusionnes les projets.
// Pour la remplacer : change le loadComponent de la route 'client' dans role.routes.ts, puis supprime ce dossier.
@Component({
  selector: 'app-client-placeholder',
  template: `
    <div style="max-width: 600px; margin: 80px auto; padding: 20px; font-family: Arial, sans-serif; text-align: center;">
      <h1>Page Client</h1>
      <p>Ici s'affichera la page client de ton ami.</p>
    </div>
  `
})
export class ClientPlaceholder {}
