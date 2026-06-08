export interface Template {
  id: string;
  title: string;
  category: 'wedding' | 'birthday' | 'anniversary';
  cover: string;
  price: number;
  isFree: boolean;
  isHot: boolean;
  isNew: boolean;
  tags: string[];
  description: string;
}

export type TemplateCategory = 'wedding' | 'birthday' | 'anniversary';

export const CATEGORY_LIST: { key: TemplateCategory | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '🎨' },
  { key: 'wedding', label: '婚礼', icon: '💒' },
  { key: 'birthday', label: '生日', icon: '🎂' },
  { key: 'anniversary', label: '店庆', icon: '🏪' },
];
