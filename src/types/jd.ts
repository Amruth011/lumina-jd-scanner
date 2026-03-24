export interface Skill {
  category: string;
  skill: string;
  importance: number;
}

export interface JdVaultEntry {
  id: string;
  title: string;
  skills_json: Skill[];
  raw_text: string;
  created_at: string;
}
