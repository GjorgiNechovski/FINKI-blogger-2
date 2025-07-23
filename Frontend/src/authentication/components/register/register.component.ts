import { Component } from '@angular/core'
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
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
    userName: new FormControl('', [Validators.required]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
  })

  register() {
    const userName = this.registerForm.value.userName
    const firstName = this.registerForm.value.firstName
    const lastName = this.registerForm.value.lastName
    const email = this.registerForm.value.email
    const password = this.registerForm.value.password
    const confirmPassword = this.registerForm.value.confirmPassword

    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (this.registerForm.invalid) {
      alert('Please fill out all required fields correctly')
      return
    }

    if (
      userName &&
      firstName &&
      lastName &&
      email &&
      password &&
      confirmPassword
    )
      this.authService
        .register(
          userName,
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
        )
        .subscribe({
          next: () => this.router.navigateByUrl('/login'),
          error: err =>
            alert(`Registration failed: ${err.error?.message || err.message}`),
        })
  }
}
