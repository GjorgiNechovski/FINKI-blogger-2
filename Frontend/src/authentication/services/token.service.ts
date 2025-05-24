import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  storeToken(token: string): void {
    localStorage.setItem('jwtToken', token)
  }

  storeTokenDate(date: string): void {
    localStorage.setItem('jwtTokenDate', date.toString())
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken')
  }

  clearToken(): void {
    localStorage.removeItem('jwtToken')
  }

  checkTokenValidity(): boolean {
    const token = this.getToken()
    if (token) {
      const tokenDate = localStorage.getItem('jwtTokenDate')
      if (tokenDate) {
        const tokenDateMillis = parseInt(tokenDate, 10)

        if (isNaN(tokenDateMillis)) {
          console.error('Invalid token date:', tokenDate)
          return false
        }

        const now = new Date()
        const expirationTime = tokenDateMillis + 3600000

        return now.getTime() <= expirationTime
      }
    }
    return false
  }
}
