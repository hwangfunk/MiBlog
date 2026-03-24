export interface BlogPostSummary {
  slug: string;
  title: string;
  date: string;
}

export interface BlogPost extends BlogPostSummary {
  id?: number;
  content?: string;
}
