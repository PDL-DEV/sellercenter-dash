import { Component } from '@angular/core';
import { TopnavbarComponent } from '../topnavbar/topnavbar.component';
import { VerticalNavbarComponent } from '../vertical-navbar/vertical-navbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-base',
  standalone: true,
  imports: [
    TopnavbarComponent,
    VerticalNavbarComponent,
    RouterOutlet
  ],
  templateUrl: './layout-base.component.html',
  styleUrl: './layout-base.component.scss'
})
export class LayoutBaseComponent {

}
