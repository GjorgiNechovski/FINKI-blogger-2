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

    if (!token) {
      return this.router.parseUrl('/login')
    }

    if (jwtTokenDate) {
      const date = new Date(jwtTokenDate)
      if (date.getTime() < Date.now()) {
        localStorage.removeItem('jwtToken')
        localStorage.removeItem('jwtTokenDate')
        return this.router.parseUrl('/login')
      }
    }

    return true
  }
}
