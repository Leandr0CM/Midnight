import { Injectable } from '@angular/core';
import { Project } from '../models/project.model';
import { TeamService } from './team-service';

// Interfaces
interface User {
  id: number;
  name: string;
}

export enum Permissions {
  MANAGE_COMPETITIONS = 'manage_competitions',
  MANAGE_INVENTORY = 'manage_inventory',
  CREATE_PROJECTS = 'create_projects',
  MANAGE_ALL_PROJECTS = 'manage_all_projects',
  MANAGE_FINANCE = 'manage_finance',
  MANAGE_MEMBERS = 'manage_members',
  MANAGE_ROLES = 'manage_roles',
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private mockUsers: User[] = [
    { id: 1, name: 'Admin User' },
    { id: 101, name: 'Membro 1' },
  ];

  public currentUser: User | null = null; // CORRIGIDO: de 'private' para 'public'
  private currentUserPermissions: Set<string> = new Set();

  constructor(private teamService: TeamService) {
    this.simulateLogin(this.mockUsers[0]);
    
    this.teamService.activeTeam$.subscribe(activeTeam => {
      if (this.currentUser && activeTeam) {
        this.loadPermissionsForUser(this.currentUser, activeTeam.id);
      }
    });
  }

  simulateLogin(user: User): void {
    this.currentUser = user;
    this.teamService.loadInitialTeamForUser(user.id);
  }

  private loadPermissionsForUser(user: User, teamId: string): void {
    this.currentUserPermissions.clear();
    const userRoleInTeam = this.teamService.getUserRoleInTeam(user.id, teamId);
    
    if (userRoleInTeam === 'Admin') {
      this.currentUserPermissions = new Set(Object.values(Permissions));
    } else if (userRoleInTeam === 'Membro') {
      this.currentUserPermissions = new Set();
    }
  }

  hasPermission(permission: Permissions): boolean {
    return this.currentUserPermissions.has(permission);
  }

  // --- MÉTODOS DE CONVENIÊNCIA RESTAURADOS ---
  canManageFinance(): boolean {
    return this.hasPermission(Permissions.MANAGE_FINANCE);
  }
  
  canCreateProjects(): boolean {
    return this.hasPermission(Permissions.CREATE_PROJECTS);
  }
  // --- FIM DOS MÉTODOS RESTAURADOS ---

  canEditProject(project: Project): boolean {
    if (!this.currentUser) return false;
    return this.hasPermission(Permissions.MANAGE_ALL_PROJECTS) || project.ownerIds.includes(this.currentUser.id);
  }
}