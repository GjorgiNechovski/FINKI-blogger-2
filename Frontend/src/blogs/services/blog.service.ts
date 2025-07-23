import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, of, throwError } from 'rxjs'
import { Blog } from '../models/blog'
import { mockBlogServiceResponses } from '../models/blog.mock'

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  constructor(private httpClient: HttpClient) {}

  // getBlogs(): Observable<Blog[]> {
  //   return this.httpClient.get<Blog[]>(`${blogs_url}/blogs`)
  // }

  // createBlog(title: string, blogText: string): Observable<Blog> {
  //   const data = { title: title, blog_text: blogText }
  //   return this.httpClient.post<Blog>(`${blogs_url}/create`, data, {
  //     headers,
  //   })
  // }

  // getBlogDetails(blogId: string): Observable<Blog> {
  //   return this.httpClient.get<Blog>(`${blogs_url}/blogs/${blogId}`, {
  //     headers,
  //   })
  // }

  // deleteBlog(blogId: number): Observable<void> {
  //   return this.httpClient.post<void>(`${blogs_url}/deleteBlog/${blogId}`, {
  //     headers,
  //   })
  // }

  // createComment(blog_id: number, comment_text: string): Observable<void> {
  //   const data = { blog_id: blog_id, comment_text: comment_text }
  //   return this.httpClient.post<void>(`${comments_url}/create-comment`, data, {
  //     headers,
  //   })
  // }

  // deleteComment(comment_id: string): Observable<void> {
  //   console.log(comment_id)

  //   return this.httpClient.post<void>(
  //     `${comments_url}/delete-comment?comment_id=${comment_id}`,
  //     {},
  //     {
  //       headers,
  //     },
  //   )
  // }

  // likeBlog(blog_id: number) {
  //   return this.httpClient.post<void>(
  //     `${like_url}/like?blog_id=${blog_id}`,
  //     {},
  //     {
  //       headers,
  //     },
  //   )
  // }

  getBlogs(): Observable<Blog[]> {
    return of(mockBlogServiceResponses.getBlogs())
  }

  createBlog(title: string, blogText: string): Observable<Blog> {
    return of(mockBlogServiceResponses.createBlog(title, blogText))
  }

  getBlogDetails(blogId: string): Observable<Blog> {
    const blog = mockBlogServiceResponses.getBlogDetails(blogId)
    if (blog) {
      return of(blog)
    }
    return throwError(() => new Error(`Blog with ID ${blogId} not found`))
  }
  deleteBlog(blogId: number): Observable<void> {
    mockBlogServiceResponses.deleteBlog(blogId)
    return of(void 0)
  }

  createComment(blog_id: number, comment_text: string): Observable<void> {
    mockBlogServiceResponses.createComment(blog_id, comment_text)
    return of(void 0)
  }

  deleteComment(comment_id: string): Observable<void> {
    console.log(comment_id)
    mockBlogServiceResponses.deleteComment(comment_id)
    return of(void 0)
  }

  likeBlog(blog_id: number): Observable<void> {
    mockBlogServiceResponses.likeBlog(blog_id)
    return of(void 0)
  }
}
