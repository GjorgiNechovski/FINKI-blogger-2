import { Component } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { AuthenticationService } from '../../services/authentication.service'
import { TokenService } from '../../services/token.service'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  constructor(
    private authService: AuthenticationService,
    private tokenService: TokenService,
    private router: Router,
  ) {}

  loginForm = new FormGroup({
    email: new FormControl(),
    password: new FormControl(),
  })

  login() {
    const email = this.loginForm.value.email
    const password = this.loginForm.value.password

    this.authService.login(email, password).subscribe(data => {
      this.tokenService.storeToken(data)
      this.tokenService.storeTokenDate(Date.now().toString())
      this.router.navigate(['/blogs'])
    })
  }
}
