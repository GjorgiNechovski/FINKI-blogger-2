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
  total = 0
  skip = 0
  limit = 20

  ngOnInit(): void {
    this.load()
  }

  load(): void {
    this.blogService.getBlogs(this.skip, this.limit).subscribe(page => {
      this.blogs = page.items
      this.total = page.total
    })
  }

  next(): void {
    if (this.skip + this.limit < this.total) {
      this.skip += this.limit
      this.load()
    }
  }

  prev(): void {
    if (this.skip > 0) {
      this.skip = Math.max(0, this.skip - this.limit)
      this.load()
    }
  }

  get page(): number {
    return Math.floor(this.skip / this.limit) + 1
  }

  get pages(): number {
    return Math.max(1, Math.ceil(this.total / this.limit))
  }

  details(id: number) {
    this.router.navigate(['/blogs', id])
  }
}
