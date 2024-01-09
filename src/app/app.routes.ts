import { Routes } from '@angular/router';
import { LayoutBaseComponent } from './components/layout-base/layout-base.component'
import { DashboardViewComponent } from './modules/dashboard/view/dashboard-view/dashboard-view.component';
import { LoginViewComponent } from './modules/account/view/login-view/login-view.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginViewComponent
    },
    {
        path: '',
        component: LayoutBaseComponent,
        children: [
            {
                path: '',
                component: DashboardViewComponent
            }
        ]
    }
];
