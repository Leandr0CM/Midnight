import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 1. IMPORTADO PARA USAR [(ngModel)]

// --- Interfaces ---
interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  position: string;
  role: string;
  roleColor: string;
  since: string;
  projectsInvolved: number;
  tasksCompleted: number;
}

interface Invite {
  id: number;
  teamName: string;
  teamAvatar: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule], // 2. ADICIONADO AOS IMPORTS
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent {

  // --- Propriedades para os novos modais ---
  isChangePasswordModalVisible = false;
  isInviteConfirmModalVisible = false;
  
  passwordData = { newPassword: '', confirmPassword: '' };
  passwordFormError: string | null = null;
  
  inviteToConfirm: { invite: Invite, action: 'accept' | 'decline' } | null = null;
  
  // Dados de exemplo
  currentUser: UserProfile = {
    name: 'Capivara',
    email: 'capivara@email.com',
    avatar: 'CA',
    position: 'Membro',
    role: 'Capitão',
    roleColor: '#030fefff',
    since: 'Janeiro de 2024',
    projectsInvolved: 3,
    tasksCompleted: 18
  };

  invites: Invite[] = [
    { id: 1, teamName: 'Equipe Robô de Sumô', teamAvatar: 'SM' },
    { id: 2, teamName: 'AGVS', teamAvatar: 'AG' }
  ];

  constructor() { }

  // --- Funções para gerenciar os modais ---

  closeAllModals() {
    this.isChangePasswordModalVisible = false;
    this.isInviteConfirmModalVisible = false;
    this.passwordFormError = null;
    this.passwordData = { newPassword: '', confirmPassword: '' };
    this.inviteToConfirm = null;
  }
  
  openChangePasswordModal() {
    this.passwordData = { newPassword: '', confirmPassword: '' };
    this.passwordFormError = null;
    this.isChangePasswordModalVisible = true;
  }

  saveNewPassword() {
    this.passwordFormError = null;
    if (!this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      this.passwordFormError = 'Ambos os campos são obrigatórios.';
      return;
    }
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordFormError = 'As senhas não coincidem.';
      return;
    }
    // Lógica para salvar a senha (ex: chamada de API)
    console.log('Senha alterada com sucesso!');
    this.closeAllModals();
  }

  openInviteConfirmation(invite: Invite, action: 'accept' | 'decline') {
    this.inviteToConfirm = { invite, action };
    this.isInviteConfirmModalVisible = true;
  }

  handleInviteConfirmation() {
    if (!this.inviteToConfirm) return;

    const { invite, action } = this.inviteToConfirm;
    if (action === 'accept') {
      console.log(`Convite da equipe "${invite.teamName}" ACEITO.`);
    } else {
      console.log(`Convite da equipe "${invite.teamName}" RECUSADO.`);
    }

    // Remove o convite da lista
    this.invites = this.invites.filter(i => i.id !== invite.id);
    this.closeAllModals();
  }
}