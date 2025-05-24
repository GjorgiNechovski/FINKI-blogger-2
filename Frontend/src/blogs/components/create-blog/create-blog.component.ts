import { Component } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { BlogService } from '../../services/blog.service'

@Component({
  selector: 'app-create-blog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-blog.component.html',
  styleUrl: './create-blog.component.css',
})
export class CreateBlogComponent {
  createBlogForm = new FormGroup({
    title: new FormControl(),
    blogText: new FormControl(),
  })

  constructor(
    private blogService: BlogService,
    private router: Router,
  ) {}

  public createBlog(): void {
    this.blogService
      .createBlog(
        this.createBlogForm.value['title'],
        this.createBlogForm.value['blogText'],
      )
      .subscribe(() => {
        this.router.navigate(['/list'])
      })
  }
}
