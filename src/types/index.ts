export interface Portfolio {
    id: string;
    title: string;
    description: string;
    image_url: string;
    upvotes: number;
    created_at: string;
    user_id: string;
  }
  
  export interface Feedback {
    id: string;
    portfolio_id: string;
    user_id: string;
    positive: string;
    negative: string;
    optional_text?: string;
  }