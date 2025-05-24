import { Component } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { AuthenticationService } from '../../services/authentication.service'

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {}

  registerForm = new FormGroup({
    firstName: new FormControl(),
    lastName: new FormControl(),
    email: new FormControl(),
    password: new FormControl(),
    confirmPassword: new FormControl(),
  })

  register() {
    const firstName = this.registerForm.value.firstName
    const lastName = this.registerForm.value.lastName
    const email = this.registerForm.value.email
    const password = this.registerForm.value.password
    const confirmPassword = this.registerForm.value.confirmPassword

    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    this.authService
      .register(firstName, lastName, email, password, confirmPassword)
      .subscribe()

    this.router.navigateByUrl('/login')
  }
}
