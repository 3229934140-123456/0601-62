import { create } from 'zustand';
import { InvitationData, ScheduleItem } from '@/types/invitation';
import Taro from '@tarojs/taro';

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
  hydrate: () => void;
}

const STORAGE_KEY = 'editor_store_data';

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

const loadFromStorage = (): InvitationData | null => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY);
    if (data && typeof data === 'object') {
      return data as InvitationData;
    }
  } catch (e) {
    console.warn('[EditorStore] Failed to load from storage:', e);
  }
  return null;
};

const saveToStorage = (data: InvitationData) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, data);
  } catch (e) {
    console.warn('[EditorStore] Failed to save to storage:', e);
  }
};

export const useEditorStore = create<EditorState>((set, get) => ({
  invitationData: defaultData,

  hydrate: () => {
    const saved = loadFromStorage();
    if (saved) {
      set({ invitationData: { ...defaultData, ...saved } });
    }
  },

  setInvitationData: (data) =>
    set((state) => {
      const newData = { ...state.invitationData, ...data };
      saveToStorage(newData);
      return { invitationData: newData };
    }),

  updateField: (key, value) =>
    set((state) => {
      const newData = { ...state.invitationData, [key]: value };
      saveToStorage(newData);
      return { invitationData: newData };
    }),

  addPhoto: (photo) =>
    set((state) => {
      const newData = {
        ...state.invitationData,
        photos: [...state.invitationData.photos, photo],
      };
      saveToStorage(newData);
      return { invitationData: newData };
    }),

  removePhoto: (index) =>
    set((state) => {
      const newData = {
        ...state.invitationData,
        photos: state.invitationData.photos.filter((_, i) => i !== index),
      };
      saveToStorage(newData);
      return { invitationData: newData };
    }),

  addSchedule: (item) =>
    set((state) => {
      const newData = {
        ...state.invitationData,
        schedule: [...state.invitationData.schedule, item],
      };
      saveToStorage(newData);
      return { invitationData: newData };
    }),

  removeSchedule: (index) =>
    set((state) => {
      const newData = {
        ...state.invitationData,
        schedule: state.invitationData.schedule.filter((_, i) => i !== index),
      };
      saveToStorage(newData);
      return { invitationData: newData };
    }),

  updateSchedule: (index, item) =>
    set((state) => {
      const newSchedule = [...state.invitationData.schedule];
      newSchedule[index] = { ...newSchedule[index], ...item };
      const newData = {
        ...state.invitationData,
        schedule: newSchedule,
      };
      saveToStorage(newData);
      return { invitationData: newData };
    }),

  reset: () => {
    saveToStorage(defaultData);
    set({ invitationData: defaultData });
  },
}));
