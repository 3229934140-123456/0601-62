import { create } from 'zustand';
import { Guest } from '@/types/guest';
import { guestList as initialGuestList } from '@/data/guests';
import Taro from '@tarojs/taro';

interface GuestState {
  guests: Guest[];
  addGuest: (guest: Omit<Guest, 'id' | 'createdAt'> & { id?: string }) => void;
  addGuests: (guests: Omit<Guest, 'id' | 'createdAt'>[]) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  updateRsvp: (id: string, status: 'pending' | 'confirmed' | 'declined') => void;
  updateGuestsCount: (id: string, count: number) => void;
  generateTitle: (name: string, gender?: 'male' | 'female') => string;
  hydrate: () => void;
}

const STORAGE_KEY = 'guest_store_data';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
};

const loadFromStorage = (): Guest[] => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY);
    if (data && Array.isArray(data)) {
      return data;
    }
  } catch (e) {
    console.warn('[GuestStore] Failed to load from storage:', e);
  }
  return initialGuestList;
};

const saveToStorage = (guests: Guest[]) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, guests);
  } catch (e) {
    console.warn('[GuestStore] Failed to save to storage:', e);
  }
};

export const useGuestStore = create<GuestState>((set, get) => ({
  guests: initialGuestList,

  hydrate: () => {
    const saved = loadFromStorage();
    set({ guests: saved });
  },

  addGuest: (guest) => {
    const newGuest: Guest = {
      id: guest.id || generateId(),
      name: guest.name,
      phone: guest.phone || '',
      group: guest.group || '朋友',
      rsvpStatus: guest.rsvpStatus || 'pending',
      guestsCount: guest.guestsCount || 1,
      title: guest.title || '',
      note: guest.note,
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    set((state) => {
      const newGuests = [...state.guests, newGuest];
      saveToStorage(newGuests);
      return { guests: newGuests };
    });
  },

  addGuests: (guests) => {
    const now = new Date().toLocaleString('zh-CN');
    const newGuests: Guest[] = guests.map((g) => ({
      id: generateId(),
      name: g.name,
      phone: g.phone || '',
      group: g.group || '朋友',
      rsvpStatus: g.rsvpStatus || 'pending',
      guestsCount: g.guestsCount || 1,
      title: g.title || '',
      note: g.note,
      createdAt: now,
    }));
    set((state) => {
      const updated = [...state.guests, ...newGuests];
      saveToStorage(updated);
      return { guests: updated };
    });
  },

  updateGuest: (id, updates) => {
    set((state) => {
      const updated = state.guests.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      );
      saveToStorage(updated);
      return { guests: updated };
    });
  },

  deleteGuest: (id) => {
    set((state) => {
      const updated = state.guests.filter((g) => g.id !== id);
      saveToStorage(updated);
      return { guests: updated };
    });
  },

  updateRsvp: (id, status) => {
    set((state) => {
      const updated = state.guests.map((g) =>
        g.id === id ? { ...g, rsvpStatus: status } : g
      );
      saveToStorage(updated);
      return { guests: updated };
    });
  },

  updateGuestsCount: (id, count) => {
    set((state) => {
      const updated = state.guests.map((g) =>
        g.id === id ? { ...g, guestsCount: count } : g
      );
      saveToStorage(updated);
      return { guests: updated };
    });
  },

  generateTitle: (name, gender) => {
    if (gender === 'male') return `${name}先生`;
    if (gender === 'female') return `${name}女士`;
    return `${name}先生/女士`;
  },
}));

export const selectGuestStats = (state: GuestState) => {
  const { guests } = state;
  const total = guests.length;
  const confirmed = guests.filter((g) => g.rsvpStatus === 'confirmed').length;
  const pending = guests.filter((g) => g.rsvpStatus === 'pending').length;
  const declined = guests.filter((g) => g.rsvpStatus === 'declined').length;
  const totalPeople = guests
    .filter((g) => g.rsvpStatus !== 'declined')
    .reduce((sum, g) => sum + g.guestsCount, 0);
  return { total, confirmed, pending, declined, totalPeople };
};

export const selectGroupStats = (state: GuestState) => {
  const { guests } = state;
  const stats: Record<string, { count: number; people: number }> = {};
  guests.forEach((g) => {
    if (!stats[g.group]) {
      stats[g.group] = { count: 0, people: 0 };
    }
    stats[g.group].count += 1;
    if (g.rsvpStatus !== 'declined') {
      stats[g.group].people += g.guestsCount;
    }
  });
  return stats;
};
