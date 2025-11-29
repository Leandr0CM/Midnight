import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Team, TeamService } from '../../services/team-service';
import { PermissionService } from '../../services/permission-service';

@Component({
  selector: 'app-team-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-selector.html',
  styleUrls: ['./team-selector.css']
})
export class TeamSelectorComponent implements OnInit {
  
  userTeams: Team[] = [];
  activeTeam: Team | null = null;
  isDropdownOpen = false;

  constructor(
    private teamService: TeamService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    // Escuta mudanças na equipe ativa
    this.teamService.activeTeam$.subscribe(team => {
      this.activeTeam = team;
    });

    // Carrega as equipes do usuário logado
    const currentUser = this.permissionService.currentUser;
    if (currentUser) {
      this.userTeams = this.teamService.getTeamsForUser(currentUser.id);
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectTeam(team: Team): void {
    this.teamService.setActiveTeam(team);
    this.isDropdownOpen = false;
  }
}