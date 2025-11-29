import { Permissions } from './permission-service';

// Este objeto (mapa) associa cada valor do enum a um nome legível.
export const PERMISSION_NAMES_MAP: Record<Permissions, string> = {
  [Permissions.MANAGE_COMPETITIONS]: 'Gerenciar Competições',
  [Permissions.MANAGE_INVENTORY]: 'Gerenciar Inventário',
  [Permissions.CREATE_PROJECTS]: 'Criar Projetos',
  [Permissions.MANAGE_ALL_PROJECTS]: 'Gerenciar Todos os Projetos',
  [Permissions.MANAGE_FINANCE]: 'Gerenciar Finanças',
  [Permissions.MANAGE_MEMBERS]: 'Gerenciar Membros',
  [Permissions.MANAGE_ROLES]: 'Gerenciar Funções e Permissões',
};