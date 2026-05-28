export interface ProjectRow {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  image_url: string | null;
  display_order: number;
  published: boolean;
  created_at: Date;
  updated_at: Date;
}
