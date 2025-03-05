export interface Portfolio {
  id: string;
  title: string;
  description: string;
  image?: string; // Pfad zum Bild im Storage (z. B. "portfolio-images/...")
  image_url?: string; // Fallback für alte Daten
  upvotes: number;
  created_at: string;
  user_id: string;
  tags?: string[]; // Neues Tags-Feld
}
  
  export interface Feedback {
    id: string;
    portfolio_id: string;
    user_id: string;
    positive: string;
    negative: string;
    optional_text?: string;
  }