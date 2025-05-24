import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Blog } from '../../models/blog'
import { BlogService } from '../../services/blog.service'

@Component({
  selector: 'app-blog-list',
  standalone: true,
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.css',
})
export class BlogListComponent implements OnInit {
  constructor(
    private blogService: BlogService,
    private router: Router,
  ) {}

  blogs: Blog[] = []
  ngOnInit(): void {
    this.blogService.getBlogs().subscribe(blogs => (this.blogs = blogs))
  }

  details(id: number) {
    this.router.navigate(['/blogs', id])
  }
}
