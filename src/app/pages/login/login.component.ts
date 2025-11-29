import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmbersComponent } from '../../animations/embers/embers';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EmbersComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Propriedades para o formulário
  username = '';
  password = '';
  loginError = false;

  formState: 'login' | 'register' | 'forgotPassword' = 'login';
  emailSent = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(private router: Router) { }

  onLogin() {
    this.loginError = false;
    
    // Lógica de autenticação simulada
    if (this.username === 'Capivara' && this.password === '12345') {
      console.log('Login bem-sucedido!');
      this.router.navigate(['/dashboard']);
    } else {
      console.log('Falha no login: credenciais inválidas.');
      this.loginError = true;
    }
  }

  // Funções de controle do formulário
  setFormState(state: 'login' | 'register' | 'forgotPassword') {
    this.formState = state;
    if (state !== 'forgotPassword') {
      this.emailSent = false;
    }
  }

  toggleShowPassword() { this.showPassword = !this.showPassword; }
  toggleShowConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }
  onRegister() { console.log('Formulário de cadastro enviado!'); }
  onForgotPassword() { this.emailSent = true; }
}