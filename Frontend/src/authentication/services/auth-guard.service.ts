import { Injectable } from '@angular/core'
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router'

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean | UrlTree {
    const token = localStorage.getItem('jwtToken')
    const jwtTokenDate = localStorage.getItem('jwtTokenDate')

    if (!token || !jwtTokenDate) {
      return this.router.parseUrl('/login')
    }

    const tokenDate = new Date(parseInt(jwtTokenDate, 10))
    const expirationTime = tokenDate.getTime() + 3600000
    if (Date.now() >= expirationTime) {
      localStorage.removeItem('jwtToken')
      localStorage.removeItem('jwtTokenDate')
      return this.router.parseUrl('/login')
    }

    return true
  }
}
