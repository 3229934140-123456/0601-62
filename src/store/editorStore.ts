import { create } from 'zustand';
import { InvitationData, ScheduleItem } from '@/types/invitation';

interface EditorState {
  invitationData: InvitationData;
  setInvitationData: (data: Partial<InvitationData>) => void;
  updateField: (key: keyof InvitationData, value: any) => void;
  addPhoto: (photo: string) => void;
  removePhoto: (index: number) => void;
  addSchedule: (item: ScheduleItem) => void;
  removeSchedule: (index: number) => void;
  updateSchedule: (index: number, item: Partial<ScheduleItem>) => void;
  reset: () => void;
}

const defaultData: InvitationData = {
  title: '我们结婚啦',
  subtitle: 'Wedding Invitation',
  groomName: '新郎姓名',
  brideName: '新娘姓名',
  date: '2026-10-01',
  time: '12:00',
  location: '某某大酒店',
  address: '北京市朝阳区建国路88号',
  mapLat: 39.9042,
  mapLng: 116.4074,
  musicUrl: '',
  musicName: '梦中的婚礼',
  coverImage: 'https://picsum.photos/id/292/750/1200',
  photos: [
    'https://picsum.photos/id/292/600/400',
    'https://picsum.photos/id/312/600/400',
    'https://picsum.photos/id/1039/600/400',
  ],
  schedule: [
    { time: '10:00', title: '迎亲', description: '新郎到新娘家迎亲' },
    { time: '12:00', title: '婚礼仪式', description: '神圣的婚礼仪式' },
    { time: '13:00', title: '婚宴开始', description: '共进午餐，分享喜悦' },
  ],
  colorTheme: '#ff6b8b',
  countdownEnabled: true,
  passwordEnabled: false,
  password: '',
};

export const useEditorStore = create<EditorState>((set) => ({
  invitationData: defaultData,
  setInvitationData: (data) =>
    set((state) => ({
      invitationData: { ...state.invitationData, ...data },
    })),
  updateField: (key, value) =>
    set((state) => ({
      invitationData: { ...state.invitationData, [key]: value },
    })),
  addPhoto: (photo) =>
    set((state) => ({
      invitationData: {
        ...state.invitationData,
        photos: [...state.invitationData.photos, photo],
      },
    })),
  removePhoto: (index) =>
    set((state) => ({
      invitationData: {
        ...state.invitationData,
        photos: state.invitationData.photos.filter((_, i) => i !== index),
      },
    })),
  addSchedule: (item) =>
    set((state) => ({
      invitationData: {
        ...state.invitationData,
        schedule: [...state.invitationData.schedule, item],
      },
    })),
  removeSchedule: (index) =>
    set((state) => ({
      invitationData: {
        ...state.invitationData,
        schedule: state.invitationData.schedule.filter((_, i) => i !== index),
      },
    })),
  updateSchedule: (index, item) =>
    set((state) => {
      const newSchedule = [...state.invitationData.schedule];
      newSchedule[index] = { ...newSchedule[index], ...item };
      return {
        invitationData: {
          ...state.invitationData,
          schedule: newSchedule,
        },
      };
    }),
  reset: () => set({ invitationData: defaultData }),
}));
