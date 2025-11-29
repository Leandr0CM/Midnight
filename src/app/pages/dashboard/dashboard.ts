import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService, Permissions } from '../../core/services/permission-service';
import { Project, Task } from '../../core/models/project.model';

// --- Interfaces ---
interface Competition {
    id: number;
    name: string;
    date: string;
    location: string;
}

interface NewCompetition {
    name: string | null;
    date: string | null;
    location: string | null;
}

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  thresholdLow: number;
  thresholdOk: number;
}

// Interfaces para os formulários dos modais
interface ReimbursementRequest {
  value: number | null;
  description: string | null;
  file: File | null;
}

interface NewPieceRequest {
  name: string | null;
  quantity: number | null;
}

// Interface para o formulário de nova tarefa
interface NewTaskRequest {
  name: string | null;
  projectId: number | null;
  assigneeId: number | null;
}

// Interface para o histórico de atividades
interface Activity {
  usuario: string;
  acao: string;
}


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  Permissions = Permissions;

  // --- Propriedades para Controle dos Modais ---
  isNovaTarefaModalOpen = false;
  isSolicitarReembolsoModalOpen = false;
  isRegistrarPecaModalOpen = false;
  isRegisterCompetitionModalVisible = false;
  isEditCompetitionModalVisible = false;
  isConfirmDeleteModalVisible = false;

  // Propriedades para os formulários e suas mensagens de erro
  newReimbursement: ReimbursementRequest = { value: null, description: null, file: null };
  reimbursementFormError: string | null = null;

  newPiece: NewPieceRequest = { name: null, quantity: null };
  pieceFormError: string | null = null;
  
  newTask: NewTaskRequest = { name: null, projectId: null, assigneeId: null };
  taskFormError: string | null = null;


  editableProjects: Project[] = [];

  // --- Dados da Dashboard ---
  saldoFinanceiro: number = 1250.75;

  currentUser = { id: 1, nome: 'Capivara' };

  membrosDaEquipe = [
    { id: 1, nome: 'Capivara' },
    { id: 2, nome: 'Vass' },
    { id: 3, nome: 'Leonardo' },
    { id: 4, nome: 'Betoneira' },
    { id: 5, nome: 'Dalpra' },
    { id: 6, nome: 'Trainee 1' }
  ];

  projetos: Project[] = [
    { id: 1, nome: 'Robô "Golira"', ownerIds: [101], tasks: [{ status: 'Concluído' as const }, { status: 'Em Andamento' as const }] },
    { id: 2, nome: 'Robô "Papo Furado"', ownerIds: [102], tasks: [{ status: 'Pendente' as const },{ status: 'Pendente' as const },{ status: 'Concluído' as const }] },
    { id: 3, nome: 'Manutenção Geral', ownerIds: [1], tasks: [{ status: 'Concluído' as const },{ status: 'Concluído' as const }] }
  ];
  
  competitions: Competition[] = [
    { id: 1, name: 'Winter Challenge', date: '2025-12-10', location: 'São Paulo' }
  ];
  
  editingCompetition: Competition | null = null;
  newCompetition: NewCompetition = { name: null, date: null, location: null };
  itemToDelete: { item: Competition, type: 'competition' } | null = null;

  despesas = [
    { mes: 'Mar', valor: 250, altura: 50 },
    { mes: 'Abr', valor: 350, altura: 70 },
    { mes: 'Mai', valor: 200, altura: 40 },
    { mes: 'Jun', valor: 425, altura: 85 },
    { mes: 'Jul', valor: 300, altura: 60 }
  ];

  atividadesRecentes: Activity[] = [
    { usuario: 'Líder Financeiro', acao: 'aprovou um reembolso.' },
    { usuario: 'Membro', acao: "alocou 2x 'Parafuso M4' no projeto 'Papo Furado'." },
    { usuario: 'Líder RH', acao: 'adicionou um novo membro Trainee.' }
  ];

  inventario: InventoryItem[] = [
    { id: 1, name: 'Parafusos M3', quantity: 25, thresholdLow: 20, thresholdOk: 50 },
    { id: 2, name: 'Placa Arduino Uno', quantity: 5, thresholdLow: 2, thresholdOk: 4 },
    { id: 3, name: 'Bateria LIPO 3S', quantity: 1, thresholdLow: 2, thresholdOk: 4 },
    { id: 4, name: 'Rodas de Combate', quantity: 0, thresholdLow: 2, thresholdOk: 4 },
  ];
  
  inventoryAlerts: InventoryItem[] = [];


  constructor(public permissionService: PermissionService) { }

  ngOnInit(): void {
    this.inventoryAlerts = this.inventario.filter(item => 
      item.quantity <= item.thresholdLow
    );
  }
  
  getStockStatus(item: InventoryItem): { text: string, class: string } {
    if (item.quantity === 0) {
      return { text: 'Vazio', class: 'status-empty' };
    }
    if (item.quantity <= item.thresholdLow) {
      return { text: 'Pouco', class: 'status-low' };
    }
    if (item.quantity <= item.thresholdOk) {
      return { text: 'OK', class: 'status-ok' };
    }
    return { text: 'Bastante', class: 'status-plenty' };
  }

  calculateTaskProgress(project: { tasks: Task[] }): number {
    if (!project || !project.tasks || !project.tasks.length) { return 0; }
    const completedTasks = project.tasks.filter((task: Task) => task.status === 'Concluído').length;
    const totalTasks = project.tasks.length;
    if (totalTasks === 0) return 0;
    if (completedTasks === totalTasks) return 100;
    return (completedTasks / totalTasks) * 100;
  }

  // --- Funções para Gerenciar Modais ---

  closeModal() {
    this.isNovaTarefaModalOpen = false;
    this.isSolicitarReembolsoModalOpen = false;
    this.isRegistrarPecaModalOpen = false;
    this.isRegisterCompetitionModalVisible = false;
    this.isEditCompetitionModalVisible = false;
    this.isConfirmDeleteModalVisible = false;
    
    this.editingCompetition = null;
    this.newCompetition = { name: null, date: null, location: null };
    this.itemToDelete = null;
    this.reimbursementFormError = null;
    this.newReimbursement = { value: null, description: null, file: null };
    this.pieceFormError = null;
    this.newPiece = { name: null, quantity: null };
    this.taskFormError = null;
    this.newTask = { name: null, projectId: null, assigneeId: null };
  }

  novaTarefa() {
    this.editableProjects = this.projetos.filter(projeto => 
      this.permissionService.canEditProject(projeto)
    );
    this.taskFormError = null;
    this.newTask = { name: null, projectId: null, assigneeId: null };
    this.isNovaTarefaModalOpen = true;
  }

  solicitarReembolso() {
    this.reimbursementFormError = null;
    this.newReimbursement = { value: null, description: null, file: null };
    this.isSolicitarReembolsoModalOpen = true;
  }

  registrarPeca() {
    this.pieceFormError = null;
    this.newPiece = { name: null, quantity: null };
    this.isRegistrarPecaModalOpen = true;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        if (file.type !== 'application/pdf') {
            this.reimbursementFormError = 'O arquivo selecionado não é um PDF. Por favor, anexe um PDF.';
            this.newReimbursement.file = null;
            input.value = '';
        } else {
            this.reimbursementFormError = null;
            this.newReimbursement.file = file;
        }
    }
  }

  submitReimbursement() {
    this.reimbursementFormError = null;
    const { value, description, file } = this.newReimbursement;
  
    if (value === null || value === undefined || !description || !file) {
      this.reimbursementFormError = 'Todos os campos são obrigatórios.';
      return;
    }
  
    if (value < 0) {
      this.reimbursementFormError = 'O valor do reembolso não pode ser negativo.';
      return;
    }
  
    if (value > 9999) {
      this.reimbursementFormError = 'O valor não pode ser maior que R$ 9.999,00.';
      return;
    }
    if (file.type !== 'application/pdf') {
        this.reimbursementFormError = 'O arquivo precisa ser um PDF.';
        return;
    }
  
    console.log('Solicitação de reembolso enviada:', this.newReimbursement);
    this.closeModal();
  }

  submitNewPiece() {
    this.pieceFormError = null;
    const { name, quantity } = this.newPiece;

    if (!name || quantity === null || quantity === undefined) {
      this.pieceFormError = 'Ambos os campos são obrigatórios.';
      return;
    }
    if (quantity > 999) {
      this.pieceFormError = 'A quantidade não pode ser maior que 999.';
      return;
    }
    if (quantity < 0) {
      this.pieceFormError = 'A quantidade não pode ser negativa.';
      return;
    }

    const acao = `registrou a peça "${name}" (${quantity} un.) no inventário.`;
    this.addActivity(this.currentUser.nome, acao);

    console.log('Nova peça registrada:', this.newPiece);
    this.closeModal();
  }

  submitNewTask() {
    this.taskFormError = null;
    const { name, projectId, assigneeId } = this.newTask;

    if (!name || !projectId || !assigneeId) {
      this.taskFormError = 'Todos os campos são obrigatórios.';
      return;
    }

    // [CORRIGIDO] A comparação foi alterada de '===' para '==' para evitar problemas
    // com tipos de dados (número vs. texto) vindos do formulário.
    const projectName = this.projetos.find(p => p.id == projectId)?.nome || 'Projeto Desconhecido';

    const acao = `criou a tarefa "${name}" no projeto "${projectName}".`;
    this.addActivity(this.currentUser.nome, acao);

    console.log('Nova tarefa criada:', this.newTask);
    this.closeModal();
  }
  
  private addActivity(usuario: string, acao: string) {
    this.atividadesRecentes.unshift({ usuario, acao });
    if (this.atividadesRecentes.length > 5) {
      this.atividadesRecentes.pop();
    }
  }
  
  openRegisterCompetitionModal() { this.isRegisterCompetitionModalVisible = true; }
  openEditCompetitionModal(competition: Competition) { 
    this.editingCompetition = { ...competition }; 
    this.isEditCompetitionModalVisible = true; 
  }

  openConfirmDeleteModal(item: Competition, type: 'competition') {
    this.itemToDelete = { item: item, type: type };
    this.isConfirmDeleteModalVisible = true;
  }

  handleDeleteConfirmation() {
    if (!this.itemToDelete) return;
    if (this.itemToDelete.type === 'competition') {
        const competitionToDelete = this.itemToDelete.item as Competition;
        this.competitions = this.competitions.filter(c => c.id !== competitionToDelete.id);
    }
    this.closeModal();
  }

  saveNewCompetition() {
    if (!this.newCompetition.name || !this.newCompetition.date || !this.newCompetition.location) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    const newCompetitionEntry: Competition = {
        id: Date.now(),
        name: this.newCompetition.name,
        date: this.newCompetition.date,
        location: this.newCompetition.location
    };
    this.competitions.push(newCompetitionEntry);
    this.closeModal();
  }

  saveEditedCompetition() {
    if (!this.editingCompetition) return;
    const index = this.competitions.findIndex(c => c.id === this.editingCompetition!.id);
    if (index > -1) {
        this.competitions[index] = this.editingCompetition;
    }
    this.closeModal();
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}