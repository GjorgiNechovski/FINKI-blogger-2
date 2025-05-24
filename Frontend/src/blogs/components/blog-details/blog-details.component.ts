import { Component, inject, OnInit } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { finalize } from 'rxjs'
import { Blog, Comment } from '../../models/blog'
import { BlogService } from '../../services/blog.service'

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.css',
})
export class BlogDetailsComponent implements OnInit {
  createBlogForm = new FormGroup({
    commentText: new FormControl(),
  })

  blog?: Blog

  blogService = inject(BlogService)
  route = inject(ActivatedRoute)
  router = inject(Router)

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const blogId = params['id']
      this.blogService.getBlogDetails(blogId).subscribe(blog => {
        this.blog = blog
      })
    })
  }

  deleteBlog(blogId?: number): void {
    if (blogId) {
      this.blogService.deleteBlog(blogId).subscribe(() => {
        this.router.navigate(['/list'])
      })
    }
  }

  createComment() {
    const comment_text = this.createBlogForm.value['commentText']

    this.blogService
      .createComment(this.blog!.id, comment_text)
      .subscribe(() => window.location.reload())
  }

  deleteComment(comment: Comment) {
    console.log(comment)

    this.blogService.deleteComment(comment.comment_id).subscribe(() => {
      window.location.reload()
    })
  }

  likeBlog(blog?: Blog) {
    if (blog) {
      this.blogService
        .likeBlog(blog.id)
        .pipe(
          finalize(() => {
            window.location.reload()
          }),
        )
        .subscribe()
    }
  }
}
