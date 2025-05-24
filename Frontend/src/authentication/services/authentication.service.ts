import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { authentication_url } from '../../environment'
import { User } from '../models/user'
import { TokenService } from './token.service'

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private httpClient: HttpClient,
    private tokenService: TokenService,
  ) {}

  public user?: User

  login(email: string, password: string): Observable<string> {
    return this.httpClient.post<string>(
      `${authentication_url}/Authentication/login`,
      {
        email: email,
        password: password,
      },
      {
        responseType: 'text' as 'json',
      },
    )
  }

  register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
  ): Observable<{ token: string }> {
    return this.httpClient.post<{ token: string }>(
      `${authentication_url}/Authentication/register`,
      {
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        confirmPassword: confirmPassword,
      },
    )
  }

  getUser(): void {
    if (this.tokenService.checkTokenValidity()) {
      this.httpClient
        .get<User>(`${authentication_url}/user`)
        .subscribe(user => (this.user = user))
    }
  }
}
