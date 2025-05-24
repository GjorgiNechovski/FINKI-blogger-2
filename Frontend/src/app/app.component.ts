import { Component, OnInit } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { AuthenticationService } from '../authentication/services/authentication.service'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthenticationService) {}

  title = 'Frontend'

  ngOnInit(): void {
    this.authService.getUser()
  }
}
