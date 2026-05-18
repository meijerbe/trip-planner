export interface Pin {
  id: string;
  board_id: string;
  lng: number;
  lat: number;
  label: string;
  author: string;
  color: string;
  created_at: string;
}

export interface PendingPin {
  lng: number;
  lat: number;
}
