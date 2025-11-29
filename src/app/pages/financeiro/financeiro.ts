import { Component, OnInit } from '@angular/core'; // Adicionado OnInit
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../core/services/permission-service';

// --- Interfaces (inalteradas) ---
interface Transaction {
  id: number;
  date: string;
  description: string;
  value: number;
  type: 'income' | 'expense';
}
interface Reimbursement {
  id: number;
  requester: string;
  details: string;
  value: number;
  receiptUrl?: string;
  status?: 'Aprovado' | 'Rejeitado';
  processedDate?: string;
}
interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  thresholdLow: number;
  thresholdOk: number;
}
interface Sponsor {
  id: number;
  name: string;
  contact: string;
  contractStatus: 'Ativo' | 'Inativo';
  history: SponsorContribution[];
}
interface SponsorContribution {
    id: number;
    date: string;
    description: string;
    type: 'Dinheiro' | 'Ferramentas' | 'Serviços';
    value?: number;
}
interface NewTransaction {
    description: string | null;
    value: number | null;
    date: string | null;
}
interface NewInventoryItem {
    name: string | null;
    quantity: number | null;
    thresholdLow: number | null;
    thresholdOk: number | null;
}
interface NewSponsor {
    name: string | null;
    contact: string | null;
}
interface NewContribution {
    date: string | null;
    description: string | null;
    type: 'Dinheiro' | 'Ferramentas' | 'Serviços';
    value?: number | null;
}

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './financeiro.html',
  styleUrls: ['./financeiro.css']
})
export class FinanceiroComponent implements OnInit { // Adicionado OnInit

  // --- DADOS MOCADOS (inalterados) ---
  saldoAtual: number = 1250.75;
  totalEntradasMes: number = 500.00;
  totalSaidasMes: number = 320.50;
  transacoes: Transaction[] = [
    { id: 1, date: '02/09/2025', description: 'Patrocínio Empresa X', value: 500.00, type: 'income' },
    { id: 2, date: '01/09/2025', description: 'Compra de motores', value: 180.00, type: 'expense' }
  ];
  reembolsosPendentes: Reimbursement[] = [
    { id: 1, requester: 'Membro 1', details: "Peças para o Robô 'Vespa'", value: 75.00, receiptUrl: '#' },
    { id: 2, requester: 'Membro 2', details: "Compra de filamento para impressora 3D", value: 120.00, receiptUrl: '#' }
  ];
  historicoReembolsos: Reimbursement[] = [];
  inventario: InventoryItem[] = [
    { id: 1, name: 'Parafusos M3', quantity: 25, thresholdLow: 20, thresholdOk: 50 },
    { id: 2, name: 'Placa Arduino Uno', quantity: 5, thresholdLow: 2, thresholdOk: 4 },
    { id: 3, name: 'Bateria LIPO 3S', quantity: 1, thresholdLow: 2, thresholdOk: 4 },
    { id: 4, name: 'Rodas de Combate', quantity: 0, thresholdLow: 2, thresholdOk: 4 },
  ];
  patrocinadores: Sponsor[] = [
    {
      id: 1,
      name: 'Empresa X',
      contact: '(XX) XXXXX-XXXX',
      contractStatus: 'Ativo',
      history: [
          { id: 1, date: '2025-09-02', description: 'Aporte mensal', type: 'Dinheiro', value: 500.00 },
          { id: 2, date: '2025-03-15', description: 'Aporte inicial', type: 'Dinheiro', value: 1500.00 },
          { id: 3, date: '2025-01-10', description: 'Impressão de Banners', type: 'Serviços' },
      ]
    }
  ];

  // --- LÓGICA PARA CONTROLE DOS MODAIS (inalterada) ---
  isRegisterIncomeModalVisible = false;
  isRegisterExpenseModalVisible = false;
  isAddItemModalVisible = false;
  isAddSponsorModalVisible = false;
  isEditTransactionModalVisible = false;
  isEditSponsorModalVisible = false;
  isReimbursementHistoryModalVisible = false;
  isSponsorHistoryModalVisible = false;
  isConfirmDeleteModalVisible = false;
  isAddContributionModalVisible = false;
  isConfirmReimbursementModalVisible = false;
  isEditItemModalVisible = false;
  isEditContributionModalVisible = false;

  // --- Propriedades de Formulários (inalteradas) ---
  itemFormError: string | null = null;
  transactionFormError: string | null = null;
  contributionFormError: string | null = null;
  sponsorFormError: string | null = null;
  actionMenuOpenForItem: number | null = null;
  reimbursementToConfirm: { action: 'approve' | 'reject', reimbursement: Reimbursement } | null = null;
  selectedSponsor: Sponsor | null = null;
  newIncome: NewTransaction = { description: null, value: null, date: null };
  newExpense: NewTransaction = { description: null, value: null, date: null };
  newItem: NewInventoryItem = { name: null, quantity: null, thresholdLow: null, thresholdOk: null };
  newSponsor: NewSponsor = { name: null, contact: null };
  newContribution: NewContribution = { date: null, description: null, type: 'Dinheiro', value: null };
  editingTransaction: Transaction | null = null;
  editingSponsor: Sponsor | null = null;
  editingItem: InventoryItem | null = null;
  editingContribution: SponsorContribution | null = null;
  itemToDelete: { type: string, id: number } | null = null;

  // [NOVO] Propriedades para a busca no inventário
  public inventorySearchTerm: string = '';
  public filteredInventario: InventoryItem[] = [];

  constructor(public permissionService: PermissionService) {}

  ngOnInit(): void {
    // [NOVO] Inicializa a lista filtrada com todos os itens do inventário
    this.filteredInventario = [...this.inventario];
  }

  // [NOVO] Função que filtra o inventário com base no termo de busca
  filterInventory(): void {
    const searchTerm = this.inventorySearchTerm.toLowerCase();
    if (!searchTerm) {
      this.filteredInventario = [...this.inventario];
    } else {
      this.filteredInventario = this.inventario.filter(item => 
        item.name.toLowerCase().includes(searchTerm)
      );
    }
  }

  // --- Demais funções da classe (inalteradas) ---
  // ... (getStockStatus, toggleActionMenu, etc.)
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
  toggleActionMenu(event: Event, itemId: number) {
    event.stopPropagation();
    if (this.actionMenuOpenForItem === itemId) {
      this.actionMenuOpenForItem = null;
    } else {
      this.actionMenuOpenForItem = itemId;
    }
  }
  closeActionMenu() {
    this.actionMenuOpenForItem = null;
  }
  increaseItemQuantity(item: InventoryItem) {
    if (item.quantity < 999) {
      item.quantity++;
    }
  }
  decreaseItemQuantity(item: InventoryItem) {
    if (item.quantity > 0) {
      item.quantity--;
    }
  }
  enforceMaxQuantity() {
    if (this.newItem.quantity && this.newItem.quantity > 999) {
      this.newItem.quantity = 999;
    }
    if (this.newItem.thresholdLow && this.newItem.thresholdLow > 999) {
      this.newItem.thresholdLow = 999;
    }
    if (this.newItem.thresholdOk && this.newItem.thresholdOk > 999) {
      this.newItem.thresholdOk = 999;
    }
    if (this.editingItem && this.editingItem.quantity && this.editingItem.quantity > 999) {
      this.editingItem.quantity = 999;
    }
    if (this.editingItem && this.editingItem.thresholdLow && this.editingItem.thresholdLow > 999) {
      this.editingItem.thresholdLow = 999;
    }
    if (this.editingItem && this.editingItem.thresholdOk && this.editingItem.thresholdOk > 999) {
      this.editingItem.thresholdOk = 999;
    }
  }
  openEditItemModal(item: InventoryItem) {
    this.itemFormError = null;
    this.editingItem = { ...item };
    this.isEditItemModalVisible = true;
    this.closeActionMenu();
  }
  saveEditedItem() {
    if (!this.editingItem) return;
    this.itemFormError = null;
    const { quantity, thresholdLow, thresholdOk } = this.editingItem;
    if (quantity === null || quantity === undefined || thresholdLow === null || thresholdLow === undefined || thresholdOk === null || thresholdOk === undefined) {
        this.itemFormError = 'Todos os campos numéricos são obrigatórios.';
        return;
    }
    if (!Number.isInteger(quantity) || !Number.isInteger(thresholdLow) || !Number.isInteger(thresholdOk)) {
        this.itemFormError = 'Todos os valores devem ser números inteiros.';
        return;
    }
    if (quantity < 0 || thresholdLow < 0 || thresholdOk < 0) {
        this.itemFormError = 'Os valores não podem ser negativos.';
        return;
    }
    if (thresholdOk < thresholdLow) {
        this.itemFormError = 'O nível "OK" não pode ser menor que o nível "Baixo".';
        return;
    }
    const index = this.inventario.findIndex(i => i.id === this.editingItem!.id);
    if (index > -1) {
      this.inventario[index] = this.editingItem;
      this.filterInventory(); // Atualiza a lista filtrada após a edição
    }
    this.closeAllModals();
  }
  openConfirmationForApproval(reimbursement: Reimbursement) {
    this.reimbursementToConfirm = { action: 'approve', reimbursement: reimbursement };
    this.isConfirmReimbursementModalVisible = true;
  }
  openConfirmationForRejection(reimbursement: Reimbursement) {
    this.reimbursementToConfirm = { action: 'reject', reimbursement: reimbursement };
    this.isConfirmReimbursementModalVisible = true;
  }
  handleReimbursementConfirmation() {
    if (!this.reimbursementToConfirm) return;
    const { action, reimbursement } = this.reimbursementToConfirm;
    const processedReimbursement: Reimbursement = {
      ...reimbursement,
      status: action === 'approve' ? 'Aprovado' : 'Rejeitado',
      processedDate: new Date().toLocaleDateString('pt-BR')
    };
    this.historicoReembolsos.unshift(processedReimbursement);
    this.reembolsosPendentes = this.reembolsosPendentes.filter(r => r.id !== reimbursement.id);
    this.closeAllModals();
  }
  closeAllModals() {
    this.isRegisterIncomeModalVisible = false;
    this.isRegisterExpenseModalVisible = false;
    this.isAddItemModalVisible = false;
    this.isAddSponsorModalVisible = false;
    this.isEditTransactionModalVisible = false;
    this.isEditSponsorModalVisible = false;
    this.isReimbursementHistoryModalVisible = false;
    this.isSponsorHistoryModalVisible = false;
    this.isConfirmDeleteModalVisible = false;
    this.isAddContributionModalVisible = false;
    this.isConfirmReimbursementModalVisible = false;
    this.isEditItemModalVisible = false;
    this.isEditContributionModalVisible = false;
    this.closeActionMenu();
    this.itemFormError = null;
    this.transactionFormError = null;
    this.contributionFormError = null;
    this.sponsorFormError = null;
    this.selectedSponsor = null;
    this.reimbursementToConfirm = null;
    this.newIncome = { description: null, value: null, date: null };
    this.newExpense = { description: null, value: null, date: null };
    this.newItem = { name: null, quantity: null, thresholdLow: null, thresholdOk: null };
    this.newSponsor = { name: null, contact: null };
    this.newContribution = { date: null, description: null, type: 'Dinheiro', value: null };
    this.editingTransaction = null;
    this.editingSponsor = null;
    this.editingItem = null;
    this.editingContribution = null;
    this.itemToDelete = null;
  }
  openAddItemModal() {
    this.itemFormError = null;
    this.isAddItemModalVisible = true;
  }
  openRegisterIncomeModal() {
    this.transactionFormError = null;
    this.newIncome.date = new Date().toISOString().split('T')[0];
    this.isRegisterIncomeModalVisible = true;
  }
  openRegisterExpenseModal() {
    this.transactionFormError = null;
    this.newExpense.date = new Date().toISOString().split('T')[0];
    this.isRegisterExpenseModalVisible = true;
  }
  openAddSponsorModal() {
    this.sponsorFormError = null;
    this.isAddSponsorModalVisible = true;
  }
  openReimbursementHistoryModal() { this.isReimbursementHistoryModalVisible = true; }
  openEditTransactionModal(transaction: Transaction) {
    this.transactionFormError = null;
    const [day, month, year] = transaction.date.split('/');
    const formattedDate = `${year}-${month}-${day}`;
    this.editingTransaction = { ...transaction, date: formattedDate };
    this.isEditTransactionModalVisible = true;
  }
  openEditSponsorModal(sponsor: Sponsor) {
    this.editingSponsor = { ...sponsor };
    this.isEditSponsorModalVisible = true;
  }
  openSponsorHistoryModal(sponsor: Sponsor) {
    this.selectedSponsor = sponsor;
    this.isSponsorHistoryModalVisible = true;
  }
  openAddContributionModal() {
    this.contributionFormError = null;
    this.isAddContributionModalVisible = true;
  }
  openEditContributionModal(contribution: SponsorContribution) {
    this.contributionFormError = null;
    this.editingContribution = { ...contribution };
    this.isEditContributionModalVisible = true;
  }
  openConfirmDeleteModal(item: { id: number }, type: string) {
    this.itemToDelete = { type: type, id: item.id };
    this.isConfirmDeleteModalVisible = true;
    this.closeActionMenu();
  }
  saveIncome() {
    this.transactionFormError = null;
    if (!this.newIncome.description) {
      this.transactionFormError = 'A descrição é obrigatória.';
      return;
    }
    const value = this.newIncome.value;
    if (value === null || value === undefined) {
      this.transactionFormError = 'O valor é obrigatório e deve ser um número válido.';
      return;
    }
    if (value < 0) {
      this.transactionFormError = 'O valor não pode ser negativo.';
      return;
    }
    if (value > 99999) {
      this.transactionFormError = 'O valor não pode ser maior que R$ 99.999.';
      return;
    }
    const [year, month, day] = this.newIncome.date!.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    const newTransaction: Transaction = {
      id: Date.now(),
      date: formattedDate,
      description: this.newIncome.description,
      value: value,
      type: 'income'
    };
    this.transacoes.unshift(newTransaction);
    this.closeAllModals();
  }
  saveExpense() {
    this.transactionFormError = null;
    if (!this.newExpense.description) {
      this.transactionFormError = 'A descrição é obrigatória.';
      return;
    }
    const value = this.newExpense.value;
    if (value === null || value === undefined) {
      this.transactionFormError = 'O valor é obrigatório e deve ser um número válido.';
      return;
    }
    if (value < 0) {
      this.transactionFormError = 'O valor não pode ser negativo.';
      return;
    }
    if (value > 99999) {
      this.transactionFormError = 'O valor não pode ser maior que R$ 99.999.';
      return;
    }
    const [year, month, day] = this.newExpense.date!.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    const newTransaction: Transaction = {
      id: Date.now(),
      date: formattedDate,
      description: this.newExpense.description,
      value: value,
      type: 'expense'
    };
    this.transacoes.unshift(newTransaction);
    this.closeAllModals();
  }
  saveItem() {
    this.itemFormError = null;
    if (!this.newItem.name) {
        this.itemFormError = 'O nome do item é obrigatório.';
        return;
    }
    const { quantity, thresholdLow, thresholdOk } = this.newItem;
    if (quantity === null || quantity === undefined || thresholdLow === null || thresholdLow === undefined || thresholdOk === null || thresholdOk === undefined) {
        this.itemFormError = 'Todos os campos numéricos são obrigatórios.';
        return;
    }
    if (!Number.isInteger(quantity) || !Number.isInteger(thresholdLow) || !Number.isInteger(thresholdOk)) {
        this.itemFormError = 'Todos os valores devem ser números inteiros.';
        return;
    }
    if (quantity < 0 || thresholdLow < 0 || thresholdOk < 0) {
        this.itemFormError = 'Os valores não podem ser negativos.';
        return;
    }
    if (thresholdOk < thresholdLow) {
        this.itemFormError = 'O nível "OK" não pode ser menor que o nível "Baixo".';
        return;
    }
    const newItemEntry: InventoryItem = {
        id: Date.now(),
        name: this.newItem.name,
        quantity: quantity,
        thresholdLow: thresholdLow,
        thresholdOk: thresholdOk
    };
    this.inventario.push(newItemEntry);
    this.filterInventory(); // Atualiza a lista filtrada após adicionar
    this.closeAllModals();
  }
  saveNewSponsor() {
    this.sponsorFormError = null;
    if (!this.newSponsor.name || !this.newSponsor.contact) {
      this.sponsorFormError = 'Por favor, preencha todos os campos.';
      return;
    }
    const newSponsor: Sponsor = {
        id: Date.now(),
        name: this.newSponsor.name,
        contact: this.newSponsor.contact,
        contractStatus: 'Ativo',
        history: []
    };
    this.patrocinadores.push(newSponsor);
    this.closeAllModals();
  }
  saveContribution() {
    this.contributionFormError = null;
    if (!this.selectedSponsor || !this.newContribution.date || !this.newContribution.description) {
        this.contributionFormError = 'Os campos de data e descrição são obrigatórios.';
        return;
    }
    if (this.newContribution.type === 'Dinheiro') {
        const value = this.newContribution.value;
        if (value === null || value === undefined) {
            this.contributionFormError = 'O valor é obrigatório para contribuições em dinheiro.';
            return;
        }
        if (value < 0) {
            this.contributionFormError = 'O valor não pode ser negativo.';
            return;
        }
    }
    const newEntry: SponsorContribution = {
        id: Date.now(),
        date: this.newContribution.date,
        description: this.newContribution.description,
        type: this.newContribution.type,
        value: this.newContribution.type === 'Dinheiro' ? Number(this.newContribution.value) : undefined
    };
    this.selectedSponsor.history.unshift(newEntry);
    this.isAddContributionModalVisible = false;
    this.newContribution = { date: null, description: null, type: 'Dinheiro', value: null };
  }
  saveTransaction() {
    if (!this.editingTransaction) return;
    this.transactionFormError = null;
    if (!this.editingTransaction.description || this.editingTransaction.description.trim() === '') {
        this.transactionFormError = 'A descrição é obrigatória.';
        return;
    }
    const value = this.editingTransaction.value;
    if (value === null || value === undefined) {
        this.transactionFormError = 'O valor é obrigatório e deve ser um número válido.';
        return;
    }
    if (value < 0) {
        this.transactionFormError = 'O valor não pode ser negativo.';
        return;
    }
    if (value > 99999) {
      this.transactionFormError = 'O valor não pode ser maior que R$ 99.999.';
      return;
    }
    const [year, month, day] = this.editingTransaction.date.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    this.editingTransaction.date = formattedDate;
    const index = this.transacoes.findIndex(t => t.id === this.editingTransaction!.id);
    if (index > -1) {
      this.transacoes[index] = this.editingTransaction;
    }
    this.closeAllModals();
  }
  saveSponsor() {
    if (!this.editingSponsor) return;
    const index = this.patrocinadores.findIndex(s => s.id === this.editingSponsor!.id);
    if (index > -1) {
      this.patrocinadores[index] = this.editingSponsor;
    }
    this.closeAllModals();
  }
  saveEditedContribution() {
    if (!this.editingContribution || !this.selectedSponsor) return;
    this.contributionFormError = null;
    if (!this.editingContribution.date || !this.editingContribution.description) {
        this.contributionFormError = 'Os campos de data e descrição são obrigatórios.';
        return;
    }
    if (this.editingContribution.type === 'Dinheiro') {
        const value = this.editingContribution.value;
        if (value === null || value === undefined) {
            this.contributionFormError = 'O valor é obrigatório para contribuições em dinheiro.';
            return;
        }
        if (value < 0) {
            this.contributionFormError = 'O valor não pode ser negativo.';
            return;
        }
    }
    const sponsorIndex = this.patrocinadores.findIndex(s => s.id === this.selectedSponsor!.id);
    if (sponsorIndex > -1) {
      const contributionIndex = this.patrocinadores[sponsorIndex].history.findIndex(h => h.id === this.editingContribution!.id);
      if (contributionIndex > -1) {
        this.patrocinadores[sponsorIndex].history[contributionIndex] = this.editingContribution;
      }
    }
    this.isEditContributionModalVisible = false;
  }
  handleDeleteConfirmation() {
    if (!this.itemToDelete) return;
    if (this.itemToDelete.type === 'transaction') {
      this.transacoes = this.transacoes.filter(t => t.id !== this.itemToDelete!.id);
    } else if (this.itemToDelete.type === 'sponsor') {
      this.patrocinadores = this.patrocinadores.filter(s => s.id !== this.itemToDelete!.id);
    } else if (this.itemToDelete.type === 'inventory') {
      this.inventario = this.inventario.filter(i => i.id !== this.itemToDelete!.id);
      this.filterInventory(); // Atualiza a lista filtrada após a exclusão
    } else if (this.itemToDelete.type === 'contribution' && this.selectedSponsor) {
      this.selectedSponsor.history = this.selectedSponsor.history.filter(h => h.id !== this.itemToDelete!.id);
    }
    this.closeAllModals();
  }
}