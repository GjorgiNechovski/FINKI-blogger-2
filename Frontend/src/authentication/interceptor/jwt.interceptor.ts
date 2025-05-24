import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    let token = localStorage.getItem('jwtToken')
    const jwtTokenDate = localStorage.getItem('jwtTokenDate')
    let date

    if (jwtTokenDate) {
      date = new Date(jwtTokenDate)
    }

    if (date && date?.getTime() < Date.now()) {
      localStorage.removeItem('jwtToken')
      localStorage.removeItem('jwtTokenDate')
      token = null
    }

    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      })
      return next.handle(cloned)
    }

    return next.handle(req)
  }
}
