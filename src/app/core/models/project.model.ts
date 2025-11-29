// --- Interfaces ---
// Esta interface Task também é compartilhada
export interface Task {
  status: 'Concluído' | 'Em Andamento' | 'Pendente';
}

// Nossa fonte única e verdadeira para a interface Project
export interface Project {
  id: number;
  nome: string;
  ownerIds: number[];
  tasks: Task[];
}