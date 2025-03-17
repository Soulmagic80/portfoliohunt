export interface Portfolio {
  id: string;
  title: string;
  description: string;
  image?: string; // Pfad zum Bild im Storage
  image_url?: string; // Fallback für alte Daten
  upvotes: number;
  created_at: string;
  user_id: string;
  tags?: string[]; // Tags-Array
  rank_all_time?: number; // All Time Rang
  rank_new?: number | null; // New This Month Rang (null für ältere Portfolios)
}
  
  export interface Feedback {
    id: string;
    portfolio_id: string;
    user_id: string;
    positive: string;
    negative: string;
    optional_text?: string;
  }