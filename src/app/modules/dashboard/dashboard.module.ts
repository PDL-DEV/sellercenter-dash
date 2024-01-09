import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from './service/dashboard.service';
import { DashboardViewComponent } from './view/dashboard-view/dashboard-view.component';

@NgModule({
  declarations: [
    DashboardViewComponent
  ],
  imports: [
    CommonModule
  ],
  providers: [
    DashboardService
  ],
})

export class DashboardModule { }
