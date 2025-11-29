import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Project, Task } from '../../core/models/project.model';
import { PermissionService, Permissions } from '../../core/services/permission-service';

// --- Interfaces específicas deste componente ---

interface TeamMember {
  id: number;
  name: string;
}

interface Part {
  id: number;
  inventoryId?: number; // ID do item no inventário geral
  name: string;
  quantity: number; // Quantidade alocada
  owner: 'Equipe' | 'Pessoal';
  ownerClass: 'team' | 'personal';
}

interface InventoryItem {
  id: number;
  name: string;
  availableQuantity: number;
}

interface FullTask extends Task {
  id: number;
  title: string;
  assignee: string;
  statusClass: 'status-done' | 'status-in-progress' | 'status-pending';
}

interface FullProject extends Project {
  status: 'Em Andamento' | 'Pendente' | 'Concluído';
  statusClass: 'in-progress' | 'pending' | 'done';
  category: string;
  categoryIcon: string;
  description: string;
  progress: number;
  parts: Part[];
  members: string[];
  tasks: FullTask[];
  isCompleted?: boolean;
}

interface NewProjectData {
    nome: string | null;
    category: string | null;
    description: string | null;
}

interface NewTaskData {
    title: string | null;
    assignee: string | null;
}

interface NewPartData {
  inventoryItemId: number | null;
  name: string | null;
  quantity: number | null;
}

@Component({
  selector: 'app-projetos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projetos.html',
  styleUrls: ['./projetos.css']
})
export class ProjetosComponent implements OnInit {

  Permissions = Permissions;

  // --- DADOS DA PÁGINA ---
  projetos: FullProject[] = [
    {
      id: 1,
      nome: 'Robô "Golira"',
      ownerIds: [101, 1],
      status: 'Em Andamento',
      statusClass: 'in-progress',
      category: 'Beetleweight (1,36 kg)',
      categoryIcon: 'fa-weight-hanging',
      description: 'Projeto de robô com foco em arma de impacto horizontal.',
      progress: 75,
      parts: [
        { id: 201, inventoryId: 1001, name: 'Motor Brushless 2205', quantity: 4, owner: 'Equipe', ownerClass: 'team' },
        { id: 202, name: 'Bateria 4s', quantity: 1, owner: 'Pessoal', ownerClass: 'personal' }
      ],
      members: ['Capivara', 'Vass'],
      tasks: [
        { id: 101, title: 'Desenhar a arma', assignee: 'Capivara', status: 'Concluído', statusClass: 'status-done' },
        { id: 102, title: 'Montar o chassi', assignee: 'Vass', status: 'Em Andamento', statusClass: 'status-in-progress' }
      ]
    },
    {
      id: 2,
      nome: 'Robô "Papo Furado"',
      ownerIds: [102],
      status: 'Pendente',
      statusClass: 'pending',
      category: 'Fairyweight (150g)',
      categoryIcon: 'fa-weight-hanging',
      description: 'Novo protótipo com sistema de locomoção aprimorado.',
      progress: 40,
      parts: [
        { id: 203, name: 'Micro Servo Motor', quantity: 2, owner: 'Equipe', ownerClass: 'team' }
      ],
      members: ['Betoneira', 'Leonardo'],
      tasks: [
        { id: 103, title: 'Projetar rodas', assignee: 'Betoneira', status: 'Concluído', statusClass: 'status-done' },
        { id: 104, title: 'Desenhar a arma', assignee: 'Leonardo', status: 'Em Andamento', statusClass: 'status-in-progress' },
      ]
    },
    {
      id: 3,
      nome: 'Manutenção Geral',
      ownerIds: [1],
      status: 'Concluído',
      statusClass: 'done',
      category: 'Atividade Interna',
      categoryIcon: 'fa-tools',
      description: 'Revisão e manutenção dos robôs da temporada passada.',
      progress: 100,
      parts: [
        { id: 204, name: 'Peças de reposição', quantity: 10, owner: 'Equipe', ownerClass: 'team' }
      ],
      members: ['Vass', 'Capivara','Leonardo'],
      tasks: [],
      isCompleted: true
    }
  ];

  // --- LÓGICA PARA CONTROLE DOS MODAIS ---
  selectedProject: FullProject | null = null;
  editingProject: FullProject | null = null;
  editingTask: FullTask | null = null;
  itemToDelete: { item: any; type: 'task' | 'project' | 'part'; projectContext?: FullProject } | null = null;

  isCreateProjectModalVisible = false;
  isViewTasksModalVisible = false;
  isViewHistoryModalVisible = false;
  isEditProjectModalVisible = false;
  isAllocatePartModalVisible = false;
  isAddTaskModalVisible = false;
  isEditTaskModalVisible = false;
  isConfirmDeleteModalVisible = false;
  isChangeStatusModalVisible = false;

  partAllocationSource: 'team' | 'personal' = 'team';
  newProjectData: NewProjectData = { nome: null, category: null, description: null };
  newTask: NewTaskData = { title: null, assignee: null };
  newPartData: NewPartData = { inventoryItemId: null, name: null, quantity: null };
  
  teamInventory: InventoryItem[] = [
    { id: 1001, name: 'Motor Brushless 2205', availableQuantity: 10 },
    { id: 1002, name: 'ESC 30A', availableQuantity: 8 },
    { id: 1003, name: 'Placa Arduino Uno', availableQuantity: 5 },
    { id: 1004, name: 'Bateria LIPO 4S', availableQuantity: 4 },
  ];
  filteredInventory: InventoryItem[] = [];
  partSearchTerm: string = '';
  formError: string | null = null;
  isPartListOpen = false;

  constructor(public permissionService: PermissionService) { }

  ngOnInit(): void {
    this.projetos.sort((a, b) => {
      if (a.nome === 'Manutenção Geral') return -1;
      if (b.nome === 'Manutenção Geral') return 1;
      return 0;
    });
  }

  // --- FUNÇÕES PARA GERENCIAR MODAIS ---
  closeAllModals() {
    this.isCreateProjectModalVisible = false;
    this.isViewTasksModalVisible = false;
    this.isViewHistoryModalVisible = false;
    this.isEditProjectModalVisible = false;
    this.isAllocatePartModalVisible = false;
    this.isAddTaskModalVisible = false;
    this.isEditTaskModalVisible = false;
    this.isConfirmDeleteModalVisible = false;
    this.isChangeStatusModalVisible = false;
    
    this.selectedProject = null;
    this.editingProject = null;
    this.editingTask = null;
    this.newProjectData = { nome: null, category: null, description: null };
    this.newTask = { title: null, assignee: null };
    this.newPartData = { inventoryItemId: null, name: null, quantity: null };
    this.itemToDelete = null;
    this.formError = null;
    this.partSearchTerm = '';
    this.isPartListOpen = false;
  }

  openCreateProjectModal() { this.isCreateProjectModalVisible = true; }
  
  openConfirmDeleteModal(item: any, type: 'task' | 'project' | 'part', projectContext?: FullProject) {
    this.itemToDelete = { item: item, type: type, projectContext: projectContext };
    this.isConfirmDeleteModalVisible = true;
  }

  handleDeleteConfirmation() {
    if (!this.itemToDelete) return;

    const { item, type, projectContext } = this.itemToDelete;

    if (type === 'task' && projectContext) {
      // Exclui uma tarefa (lógica inalterada)
      projectContext.tasks = projectContext.tasks.filter(task => task.id !== item.id);

    } else if (type === 'part' && projectContext) {
      const partToDelete = item as Part;

      // Verifica se a peça é do inventário da equipe (se tem um inventoryId)
      if (partToDelete.inventoryId) {
        const inventoryItem = this.teamInventory.find(i => i.id === partToDelete.inventoryId);
        if (inventoryItem) {
          // Devolve a quantidade da peça para o inventário
          inventoryItem.availableQuantity += partToDelete.quantity;
        }
      }

      // Remove a peça da lista do projeto
      projectContext.parts = projectContext.parts.filter(part => part.id !== partToDelete.id);

    } else if (type === 'project') {
      const projectToDelete = item as FullProject;

      // Itera sobre todas as peças do projeto a ser excluído
      projectToDelete.parts.forEach(part => {
        // Verifica se a peça é do inventário da equipe
        if (part.inventoryId) {
          const inventoryItem = this.teamInventory.find(i => i.id === part.inventoryId);
          if (inventoryItem) {
            // Devolve a quantidade de cada peça para o inventário
            inventoryItem.availableQuantity += part.quantity;
          }
        }
      });

      // Remove o projeto da lista de projetos
      this.projetos = this.projetos.filter(p => p.id !== projectToDelete.id);
    }

    this.closeAllModals();
  }

  openViewTasksModal(project: FullProject) { this.selectedProject = project; this.isViewTasksModalVisible = true; }
  openEditProjectModal(project: FullProject) { this.editingProject = JSON.parse(JSON.stringify(project)); this.isEditProjectModalVisible = true; }
  openViewHistoryModal(project: FullProject) { this.selectedProject = project; this.isViewHistoryModalVisible = true; }
  
  openAllocatePartModal(project: FullProject) {
    this.selectedProject = project;
    this.partAllocationSource = 'team';
    this.filteredInventory = [...this.teamInventory];
    this.formError = null;
    this.isAllocatePartModalVisible = true;
  }

  openAddTaskModal(project: FullProject) { this.selectedProject = project; this.isAddTaskModalVisible = true; }
  openEditTaskModal(task: FullTask) { this.selectedProject = this.projetos.find(p => p.tasks.some(t => t.id === task.id)) || null; this.editingTask = { ...task }; this.isEditTaskModalVisible = true; }
  openChangeStatusModal(project: FullProject) { this.editingProject = { ...project }; this.isChangeStatusModalVisible = true; }

  togglePartList(event: Event) {
    event.stopPropagation();
    this.isPartListOpen = !this.isPartListOpen;
  }

  filterInventory() {
    if (!this.partSearchTerm) {
      this.filteredInventory = [...this.teamInventory];
    } else {
      this.filteredInventory = this.teamInventory.filter(item =>
        item.name.toLowerCase().includes(this.partSearchTerm.toLowerCase())
      );
    }
    this.isPartListOpen = true;
  }

  selectTeamPart(item: InventoryItem) {
    this.newPartData.inventoryItemId = item.id;
    this.newPartData.name = item.name;
    this.partSearchTerm = item.name;
    this.isPartListOpen = false;
  }
  
  getSelectedInventoryItem(): InventoryItem | undefined {
    if (!this.newPartData.inventoryItemId) return undefined;
    return this.teamInventory.find(i => i.id === this.newPartData.inventoryItemId);
  }

  saveNewProject() {
    if (!this.newProjectData.nome || !this.newProjectData.category || !this.newProjectData.description) {
        this.formError = 'Por favor, preencha todos os campos obrigatórios.';
        return;
    }
    const newProjectEntry: FullProject = {
        id: Date.now(),
        nome: this.newProjectData.nome,
        ownerIds: [this.permissionService.currentUser!.id],
        status: 'Pendente',
        statusClass: 'pending',
        category: this.newProjectData.category,
        categoryIcon: 'fa-robot',
        description: this.newProjectData.description,
        progress: 0,
        parts: [],
        members: [],
        tasks: []
    };
    this.projetos.push(newProjectEntry);
    this.closeAllModals();
  }

  saveProjectStatus() {
    if (!this.editingProject) return;
    const projectInList = this.projetos.find(p => p.id === this.editingProject!.id);
    if (projectInList) {
        projectInList.status = this.editingProject.status;
        if (this.editingProject.status === 'Concluído') {
            projectInList.statusClass = 'done'; projectInList.isCompleted = true;
        } else if (this.editingProject.status === 'Em Andamento') {
            projectInList.statusClass = 'in-progress'; projectInList.isCompleted = false;
        } else {
            projectInList.statusClass = 'pending'; projectInList.isCompleted = false;
        }
    }
    this.closeAllModals();
  }
  
  saveEditedProject() {
    if (!this.editingProject) return;
    const index = this.projetos.findIndex(p => p.id === this.editingProject!.id);
    if (index > -1) {
        this.projetos[index] = this.editingProject;
    }
    this.closeAllModals();
  }

  saveNewTask() {
    if (!this.newTask.title || !this.newTask.assignee || !this.selectedProject) {
        this.formError = 'Por favor, preencha todos os campos.';
        return;
    }
    const newTaskEntry: FullTask = {
        id: Date.now(),
        title: this.newTask.title,
        assignee: this.newTask.assignee,
        status: 'Pendente',
        statusClass: 'status-pending'
    };
    this.selectedProject.tasks.push(newTaskEntry);
    this.closeAllModals();
  }

  saveEditedTask() {
    if (!this.editingTask || !this.selectedProject) return;
    const taskIndex = this.selectedProject.tasks.findIndex(t => t.id === this.editingTask!.id);
    if (taskIndex > -1) {
        if (this.editingTask.status === 'Concluído') { this.editingTask.statusClass = 'status-done'; } 
        else if (this.editingTask.status === 'Em Andamento') { this.editingTask.statusClass = 'status-in-progress'; } 
        else { this.editingTask.statusClass = 'status-pending'; }
        this.selectedProject.tasks[taskIndex] = this.editingTask;
    }
    this.closeAllModals();
  }

  saveNewPart() {
    this.formError = null;
    if (!this.selectedProject) return;

    const { inventoryItemId, name, quantity } = this.newPartData;

    if (quantity === null || quantity === undefined) {
      this.formError = 'A quantidade é obrigatória.'; return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      this.formError = 'A quantidade deve ser um número inteiro positivo.'; return;
    }

    let newPartEntry: Part;

    if (this.partAllocationSource === 'team') {
      if (!inventoryItemId) {
        this.formError = 'Selecione uma peça da lista.'; return;
      }
      const inventoryItem = this.teamInventory.find(i => i.id === inventoryItemId);
      if (!inventoryItem) return;

      if (quantity > inventoryItem.availableQuantity) {
        this.formError = `Quantidade indisponível. Máximo: ${inventoryItem.availableQuantity}.`; return;
      }

      newPartEntry = { id: Date.now(), inventoryId: inventoryItemId, name: inventoryItem.name, quantity: quantity, owner: 'Equipe', ownerClass: 'team' };
      inventoryItem.availableQuantity -= quantity;
    
    } else {
      if (!name || name.trim() === '') {
        this.formError = 'O nome da peça é obrigatório.'; return;
      }
      newPartEntry = { id: Date.now(), name: name, quantity: quantity, owner: 'Pessoal', ownerClass: 'personal' };
    }
    
    this.selectedProject.parts.push(newPartEntry);
    this.closeAllModals();
  }

  calculateTaskProgress(project: FullProject | null): number {
    if (!project || !project.tasks || !project.tasks.length) { return 0; }
    const completedTasks = project.tasks.filter((task: FullTask) => task.status === 'Concluído').length;
    const totalTasks = project.tasks.length;
    return (completedTasks / totalTasks) * 100;
  }

  getInitials(name: string): string {
    if (!name) { return ''; }
    const words = name.split(' ');
    if (words.length > 1) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}