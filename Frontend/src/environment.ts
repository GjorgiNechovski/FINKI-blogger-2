import { HttpHeaders } from '@angular/common/http'

export const headers = new HttpHeaders({
  'Content-Type': 'application/json',
  Accept: 'application/json',
})

export const authentication_url = 'http://localhost:8000/user'
export const blogs_url = 'http://localhost:8000/blog'
export const comments_url = 'http://localhost:8000/comments'
export const like_url = 'http://localhost:8000/likes'
