import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../service/account.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-view',
  standalone: false,
  templateUrl: './login-view.component.html',
  styleUrl: './login-view.component.scss'
})
export class LoginViewComponent implements OnInit {

  public formGroup!: FormGroup;
  public loading: boolean = false;
  public invalidAccess: boolean = false;
  public invalidMessage: string = 'Confira seu email e senha';

  constructor(
    private readonly AccountService: AccountService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router
  ) { }


  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      email: this.formBuilder.control("", [Validators.required, Validators.email]),
      password: this.formBuilder.control("", [Validators.required])
    });
  }

  async login(): Promise<void> {
    this.loading = true;
    this.invalidAccess = false;

    const access = await this.AccountService.login(this.formGroup.value);    

    if (!access) {
      this.invalidAccess = true;
      this.loading = false;
      return;
    }


    await this.AccountService.setAccessLogin(access);
    const user = await this.AccountService.getUser();

    if (!user) {
      this.invalidAccess = true;
      this.loading = false;
      this.invalidMessage = "Tivemos uma falha ao buscar sua conta. Entre em contato com nosso suporte."
      return;
    }

    await this.AccountService.setUserLogged(user);
    await this.router.navigate(['/']);
  }

}
