export interface Invitation {
  id: string;
  title: string;
  templateId: string;
  templateCover: string;
  category: 'wedding' | 'birthday' | 'anniversary';
  status: 'draft' | 'published';
  updatedAt: string;
  views: number;
  rsvps: number;
  wishes: number;
}

export interface InvitationData {
  id: string;
  title: string;
  subtitle: string;
  groomName: string;
  brideName: string;
  date: string;
  time: string;
  location: string;
  address: string;
  mapLat?: number;
  mapLng?: number;
  musicUrl?: string;
  musicName: string;
  coverImage: string;
  photos: string[];
  schedule: ScheduleItem[];
  colorTheme: string;
  countdownEnabled: boolean;
  passwordEnabled: boolean;
  password: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
}
