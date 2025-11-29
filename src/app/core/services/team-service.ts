import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// --- Interfaces para o nosso novo sistema ---
export interface Team {
  id: string; // Ex: 'midnight-robot-team'
  name: string;
  logoUrl: string;
}

// Mapeia um usuário a uma equipe e define seu cargo NESSA equipe
export interface UserTeamMembership {
  userId: number;
  teamId: string;
  role: 'Admin' | 'Membro'; // O cargo agora é específico da equipe
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  // --- Dados Mocados ---
  private allTeams: Team[] = [
    { id: 'midnight-robot-team', name: 'Midnight Robot Team', logoUrl: 'assets/images/Logomidnight.png' },
    { id: 'equipe-secundaria', name: 'Equipe de Testes', logoUrl: 'assets/images/logo-teste.png' } // Exemplo
  ];

  private userMemberships: UserTeamMembership[] = [
    { userId: 1, teamId: 'midnight-robot-team', role: 'Admin' }, // Admin User é Admin nesta equipe
    { userId: 1, teamId: 'equipe-secundaria', role: 'Membro' }, // ...e Membro na outra
    { userId: 101, teamId: 'midnight-robot-team', role: 'Membro' }, // Membro 1 só pertence a esta equipe
  ];

  // BehaviorSubject para notificar a aplicação sobre a equipe ativa
  private activeTeamSubject = new BehaviorSubject<Team | null>(null);
  public activeTeam$: Observable<Team | null> = this.activeTeamSubject.asObservable();

  constructor() {}

  /**
   * Encontra e define a equipe ativa.
   * Em uma aplicação real, isso poderia carregar a última equipe usada da memória.
   */
  loadInitialTeamForUser(userId: number): void {
    const userTeams = this.getTeamsForUser(userId);
    if (userTeams.length > 0) {
      this.setActiveTeam(userTeams[0]); // Define a primeira equipe como ativa
    }
  }

  /**
   * Retorna todas as equipes às quais um usuário pertence.
   */
  getTeamsForUser(userId: number): Team[] {
    const teamIds = this.userMemberships
      .filter(m => m.userId === userId)
      .map(m => m.teamId);
    
    return this.allTeams.filter(t => teamIds.includes(t.id));
  }

  /**
   * Retorna o cargo de um usuário em uma equipe específica.
   */
  getUserRoleInTeam(userId: number, teamId: string): 'Admin' | 'Membro' | null {
    const membership = this.userMemberships.find(m => m.userId === userId && m.teamId === teamId);
    return membership ? membership.role : null;
  }

  /**
   * Atualiza a equipe ativa e notifica todos os 'ouvintes'.
   */
  setActiveTeam(team: Team): void {
    this.activeTeamSubject.next(team);
    console.log(`Equipe ativa mudou para: ${team.name}`);
  }
}