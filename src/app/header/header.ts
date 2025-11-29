import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TeamSelectorComponent } from '../core/components/team-selector/team-selector'; // 1. IMPORTE AQUI

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TeamSelectorComponent], // 2. ADICIONE AQUI
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  // A lógica do header não precisa mudar
}