import { Routes } from '@angular/router'
import { LoginComponent } from '../authentication/components/login/login.component'
import { RegisterComponent } from '../authentication/components/register/register.component'
import { AuthGuard } from '../authentication/services/auth-guard.service'
import { BlogDetailsComponent } from '../blogs/components/blog-details/blog-details.component'
import { BlogListComponent } from '../blogs/components/blog-list/blog-list.component'
import { CreateBlogComponent } from '../blogs/components/create-blog/create-blog.component'
import { NavBarComponent } from '../navBar/components/nav-bar/nav-bar.component'

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'blogs',
    pathMatch: 'full',
  },
  {
    path: '',
    component: NavBarComponent,
    children: [
      { path: 'blogs', component: BlogListComponent, canActivate: [AuthGuard] },
      {
        path: 'create',
        component: CreateBlogComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'blogs/:id',
        component: BlogDetailsComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: '**',
    redirectTo: 'blogs',
  },
]
