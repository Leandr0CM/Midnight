import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService, Permissions } from '../../core/services/permission-service';
import { PERMISSION_NAMES_MAP } from '../../core/services/permission.map';

// --- Interfaces ---
interface Member {
  id: number;
  name: string;
  avatar: string;
  position: 'Membro' | 'Trainee';
  positionClass: 'tag-member' | 'tag-intern';
  roleId: number;
  contact: string;
}

interface Role {
  id: number;
  name: string;
  color: string;
  permissions: string[];
  isUnique?: boolean; // true se apenas um membro puder ter esta função
}

interface MemberFormData {
  id: number | null;
  name: string | null;
  position: 'Membro' | 'Trainee' | null;
  roleId: number | null;
  contact: string | null;
}

interface RoleFormData {
  id: number | null;
  name: string | null;
  color: string;
  isUnique: boolean;
  permissions: { [key: string]: boolean };
}


@Component({
  selector: 'app-membros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './membros.html',
  styleUrls: ['./membros.css']
})
export class MembrosComponent {

  Permissions = Permissions;
  permissionNames = PERMISSION_NAMES_MAP;

  // --- CONTROLE DE VISIBILIDADE DOS MODAIS ---
  isAddMemberModalVisible = false;
  isCreateRoleModalVisible = false;
  isConfirmDeleteRoleModalVisible = false;
  isEditRoleModalVisible = false;
  isEditMemberModalVisible = false;
  isConfirmDeleteMemberModalVisible = false;

  // --- DADOS PARA OS FORMULÁRIOS E AÇÕES ---
  memberFormData: MemberFormData = { id: null, name: null, position: 'Membro', roleId: null, contact: null };
  roleFormData!: RoleFormData;
  
  roleToDelete: Role | null = null;
  memberToDelete: Member | null = null;

  availablePermissions: { [key: string]: string[] } = {};
  assignableRoles: Role[] = [];

  // --- DADOS DA PÁGINA ---
  members: Member[] = [
    { id: 1, name: 'Capivara', avatar: 'CA', position: 'Membro', positionClass: 'tag-member', roleId: 4, contact: 'capivara@email.com' },
    { id: 2, name: 'Vass', avatar: 'VA', position: 'Membro', positionClass: 'tag-member', roleId: 2, contact: 'vass@email.com' },
    { id: 3, name: 'Leonardo', avatar: 'LE', position: 'Membro', positionClass: 'tag-member', roleId: 3, contact: 'leonardo@email.com' },
    { id: 4, name: 'Betoneira', avatar: 'BE', position: 'Membro', positionClass: 'tag-member', roleId: 1, contact: 'betoneira@email.com' },
    { id: 5, name: 'Dalpra', avatar: 'DA', position: 'Trainee', positionClass: 'tag-intern', roleId: 5, contact: 'dalpra@email.com' }
  ];

  roles: Role[] = [
    { id: 1, name: 'Administrador', color: '#c9302c', permissions: Object.values(Permissions), isUnique: true },
    { id: 2, name: 'Líder de RH', color: '#f0ad4e', permissions: [Permissions.MANAGE_MEMBERS], isUnique: true },
    { id: 3, name: 'Líder Financeiro', color: '#2a8a4d', permissions: [Permissions.MANAGE_FINANCE], isUnique: true },
    { id: 4, name: 'Capitão', color: '#030fefff', permissions: [Permissions.CREATE_PROJECTS, Permissions.MANAGE_ALL_PROJECTS], isUnique: true },
    { id: 5, name: 'Membro', color: '#5bc0de', permissions: [], isUnique: false }
  ];

  constructor(public permissionService: PermissionService) {
    this.groupPermissions();
    this.resetRoleForm();
  }

  groupPermissions() {
    const grouped: { [key: string]: string[] } = {
      projetos: [],
      financeiro: [],
      membros: []
    };
    for (const permissionValue of Object.values(Permissions)) {
      if (permissionValue.includes('project')) {
        grouped['projetos'].push(permissionValue);
      } 
      else if (permissionValue.includes('finance') || permissionValue.includes('inventory')) {
        grouped['financeiro'].push(permissionValue);
      } 
      else if (permissionValue.includes('member') || permissionValue.includes('role') || permissionValue.includes('competition')) {
        grouped['membros'].push(permissionValue);
      }
    }
    this.availablePermissions = grouped;
  }

  // --- FUNÇÕES DE GERENCIAMENTO DE MODAIS ---

  closeAllModals(): void {
    this.isAddMemberModalVisible = false;
    this.isCreateRoleModalVisible = false;
    this.isConfirmDeleteRoleModalVisible = false;
    this.isEditRoleModalVisible = false;
    this.isEditMemberModalVisible = false;
    this.isConfirmDeleteMemberModalVisible = false;

    this.roleToDelete = null;
    this.memberToDelete = null;
    this.resetRoleForm();
    this.resetMemberForm();
  }
  
  updateAssignableRoles(editingMemberId?: number | null): void {
    const assignedUniqueRoleIds = new Set(
      this.members
        .filter(member => member.id !== editingMemberId)
        .map(member => member.roleId)
        .filter(roleId => this.roles.find(r => r.id === roleId)?.isUnique)
    );

    this.assignableRoles = this.roles.filter(role => 
      !role.isUnique || !assignedUniqueRoleIds.has(role.id)
    );
  }

  // --- FUNÇÕES DE MEMBROS ---
  
  resetMemberForm(): void {
    this.memberFormData = { id: null, name: null, position: 'Membro', roleId: null, contact: null };
  }

  addMember(): void { 
    this.resetMemberForm();
    this.updateAssignableRoles();
    this.isAddMemberModalVisible = true; 
  }
  
  saveMember(): void {
    if (!this.memberFormData.name || !this.memberFormData.position || !this.memberFormData.roleId || !this.memberFormData.contact) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (this.memberFormData.id) {
      const memberIndex = this.members.findIndex(m => m.id === this.memberFormData.id);
      if (memberIndex > -1) {
        const memberToUpdate = this.members[memberIndex];
        memberToUpdate.name = this.memberFormData.name;
        memberToUpdate.avatar = this.memberFormData.name.substring(0, 2).toUpperCase();
        memberToUpdate.position = this.memberFormData.position;
        memberToUpdate.positionClass = this.memberFormData.position === 'Membro' ? 'tag-member' : 'tag-intern';
        memberToUpdate.roleId = this.memberFormData.roleId;
        memberToUpdate.contact = this.memberFormData.contact;
      }
    } else {
      const newId = this.members.length > 0 ? Math.max(...this.members.map(m => m.id)) + 1 : 1;
      const newAvatar = this.memberFormData.name.substring(0, 2).toUpperCase();
      const memberToAdd: Member = {
        id: newId,
        name: this.memberFormData.name,
        avatar: newAvatar,
        position: this.memberFormData.position,
        positionClass: this.memberFormData.position === 'Membro' ? 'tag-member' : 'tag-intern',
        roleId: this.memberFormData.roleId,
        contact: this.memberFormData.contact
      };
      this.members.push(memberToAdd);
    }
    this.closeAllModals();
  }

  editMember(member: Member): void { 
    this.memberFormData = { ...member };
    this.updateAssignableRoles(member.id);
    this.isEditMemberModalVisible = true;
  }

  removeMember(member: Member): void { 
    this.memberToDelete = member;
    this.isConfirmDeleteMemberModalVisible = true;
  }
  
  handleDeleteMemberConfirmation(): void {
    if (!this.memberToDelete) return;
    this.members = this.members.filter(member => member.id !== this.memberToDelete!.id);
    this.closeAllModals();
  }
  
  // --- FUNÇÕES DE FUNÇÕES/CARGOS ---
  
  resetRoleForm(): void {
    this.roleFormData = { id: null, name: null, color: '#8a9299', isUnique: false, permissions: {} };
    Object.values(Permissions).forEach(permission => {
      this.roleFormData.permissions[permission] = false;
    });
  }

  createNewRole(): void {
    this.resetRoleForm();
    this.isCreateRoleModalVisible = true;
  }
  
  openEditRoleModal(role: Role): void {
    const permissionsForForm: { [key: string]: boolean } = {};
    Object.values(Permissions).forEach(p => {
      permissionsForForm[p] = role.permissions.includes(p);
    });

    this.roleFormData = {
      id: role.id,
      name: role.name,
      color: role.color,
      isUnique: role.isUnique || false,
      permissions: permissionsForForm
    };

    this.isEditRoleModalVisible = true;
  }

  saveRole(): void {
    if (!this.roleFormData.name) {
      alert('Por favor, digite um nome para a nova função.');
      return;
    }
    const enabledPermissions = Object.keys(this.roleFormData.permissions)
      .filter(permission => this.roleFormData.permissions[permission]);
      
    if (this.roleFormData.id) {
      const roleIndex = this.roles.findIndex(r => r.id === this.roleFormData.id);
      if (roleIndex > -1) {
        this.roles[roleIndex].name = this.roleFormData.name;
        this.roles[roleIndex].color = this.roleFormData.color;
        this.roles[roleIndex].isUnique = this.roleFormData.isUnique;
        this.roles[roleIndex].permissions = enabledPermissions;
      }
    } else {
      const newId = this.roles.length > 0 ? Math.max(...this.roles.map(r => r.id)) + 1 : 1;
      const roleToAdd: Role = {
        id: newId, 
        name: this.roleFormData.name, 
        color: this.roleFormData.color, 
        isUnique: this.roleFormData.isUnique,
        permissions: enabledPermissions
      };
      this.roles.push(roleToAdd);
    }
    this.closeAllModals();
  }
  
  openConfirmDeleteRoleModal(role: Role): void {
    this.roleToDelete = role;
    this.isConfirmDeleteRoleModalVisible = true;
  }

  handleDeleteRoleConfirmation(): void {
    if (!this.roleToDelete) return;
    this.roles = this.roles.filter(role => role.id !== this.roleToDelete!.id);
    this.closeAllModals();
  }

  getRoleById(roleId: number): Role | undefined {
    return this.roles.find(r => r.id == roleId);
  }

  getObjectKeys(obj: object): string[] {
    return Object.keys(obj);
  }

  getPermissionName(permissionKey: string): string {
    return PERMISSION_NAMES_MAP[permissionKey as Permissions];
  }
}