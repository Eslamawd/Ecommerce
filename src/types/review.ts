export type Review = {
  id: number;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  user: {
    id: number;
    name: string;
  };
  created_at: string;
};
