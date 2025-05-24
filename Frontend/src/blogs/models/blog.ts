export class Blog {
  constructor(
    public id: number,
    public title: string,
    public body: string,
    public comments: Comment[],
    public number_of_likes: number[],
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
