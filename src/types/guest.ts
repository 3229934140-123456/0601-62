export interface Guest {
  id: string;
  name: string;
  phone: string;
  group: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  guestsCount: number;
  title: string;
  note?: string;
  createdAt: string;
}

export interface GuestGroup {
  key: string;
  label: string;
  count: number;
}
