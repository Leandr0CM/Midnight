import { ComponentFixture, TestBed } from '@angular/core/testing';

// CORREÇÃO: Importando o nome correto da classe
import { ProjetosComponent } from './projetos';

// CORREÇÃO: Atualizando a descrição do teste (boa prática)
describe('ProjetosComponent', () => {
  // CORREÇÃO: Tipando as variáveis com o nome correto
  let component: ProjetosComponent;
  let fixture: ComponentFixture<ProjetosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // CORREÇÃO: Usando o nome correto no 'imports'
      imports: [ProjetosComponent]
    })
    .compileComponents();

    // CORREÇÃO: Criando o componente com o nome correto
    fixture = TestBed.createComponent(ProjetosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});