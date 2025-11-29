import { Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ProjetosComponent } from './pages/projetos/projetos';
import { FinanceiroComponent } from './pages/financeiro/financeiro';
import { MembrosComponent } from './pages/membros/membros';
import { PerfilComponent } from './pages/perfil/perfil'; // 1. IMPORTADO AQUI

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    { path: 'login', component: LoginComponent },
    
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'projetos', component: ProjetosComponent },
            { path: 'financeiro', component: FinanceiroComponent },
            { path: 'membros', component: MembrosComponent },
            { path: 'perfil', component: PerfilComponent }, // 2. ROTA ADICIONADA AQUI
        ]
    },

    { path: '**', redirectTo: 'login' }
];