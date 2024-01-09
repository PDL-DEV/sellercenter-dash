import { NgModule, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginViewComponent } from './view/login-view/login-view.component';
import { AccountService } from './service/account.service';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpUtils } from '../../utils/http.utils';


@NgModule({
  declarations: [
    LoginViewComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    AccountService,
    forwardRef(() => HttpUtils)
  ]
})
export class AccountModule { }
