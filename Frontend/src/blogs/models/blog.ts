export class Blog {
  constructor(
    public id: number,
    public title: string,
    public blog_text: string,
    public comments: Comment[],
    public number_of_likes: number[],
    public user_id: string,
  ) {}
}

export class Comment {
  constructor(
    public comment_id: string,
    public blog: Blog,
    public userId: number,
    public comment_text: string,
    public dateCreate: Date,
  ) {}
}
