import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { AuthenticationService } from '../../../authentication/services/authentication.service'

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent {
  constructor(public authService: AuthenticationService) {}
}
