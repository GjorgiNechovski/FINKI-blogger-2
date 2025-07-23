import { Blog, Comment } from '../models/blog'

// Create Blog instances first
const blog1 = new Blog(
  1,
  'First Blog Post',
  'This is the content of the first blog post.',
  [],
  [101, 102, 103],
  'user_001',
)

const blog2 = new Blog(
  2,
  'Second Blog Post',
  'This is the content of the second blog post.',
  [],
  [101],
  'user_002',
)

// Now create Comments with references to the Blogs
blog1.comments = [
  new Comment(
    'c1',
    blog1,
    101,
    'Great post!',
    new Date('2025-07-20T10:00:00Z'),
  ),
  new Comment(
    'c2',
    blog1,
    102,
    'Very informative!',
    new Date('2025-07-20T11:00:00Z'),
  ),
]

blog2.comments = [
  new Comment(
    'c3',
    blog2,
    103,
    'Interesting read!',
    new Date('2025-07-21T09:00:00Z'),
  ),
]

export const mockBlogs: Blog[] = [blog1, blog2]

export const mockBlogServiceResponses = {
  getBlogs: () => mockBlogs,
  getBlogDetails: (blogId: string) =>
    mockBlogs.find(blog => blog.id === parseInt(blogId)) || null,
  createBlog: (title: string, blogText: string) => {
    const newBlog = new Blog(
      mockBlogs.length + 1,
      title,
      blogText,
      [],
      [],
      'user_003',
    )
    mockBlogs.push(newBlog)
    return newBlog
  },
  deleteBlog: (blogId: number) => {
    const index = mockBlogs.findIndex(blog => blog.id === blogId)
    if (index !== -1) {
      mockBlogs.splice(index, 1)
    }
  },
  createComment: (blogId: number, commentText: string) => {
    const blog = mockBlogs.find(b => b.id === blogId)
    if (blog) {
      const newComment = new Comment(
        `c${mockBlogs.reduce((acc, b) => acc + b.comments.length, 0) + 1}`,
        blog,
        101,
        commentText,
        new Date(),
      )
      blog.comments.push(newComment)
    }
  },
  deleteComment: (commentId: string) => {
    mockBlogs.forEach(blog => {
      const index = blog.comments.findIndex(c => c.comment_id === commentId)
      if (index !== -1) {
        blog.comments.splice(index, 1)
      }
    })
  },
  likeBlog: (blogId: number) => {
    const blog = mockBlogs.find(b => b.id === blogId)
    if (blog && !blog.number_of_likes.includes(101)) {
      blog.number_of_likes.push(101)
    }
  },
}
