import { Material, MaterialCategory } from '@/types/material';

export const materialCategories: MaterialCategory[] = [
  { key: 'all', label: '全部' },
  { key: 'flower', label: '花卉' },
  { key: 'ribbon', label: '丝带' },
  { key: 'frame', label: '边框' },
  { key: 'sticker', label: '贴纸' },
  { key: 'text', label: '文字' },
  { key: 'icon', label: '图标' },
];

export const materialList: Material[] = [
  { id: 'm001', name: '玫瑰花束', category: 'flower', imageUrl: 'https://picsum.photos/id/292/200/200', isFavorite: false, isVip: false },
  { id: 'm002', name: '粉色丝带', category: 'ribbon', imageUrl: 'https://picsum.photos/id/312/200/200', isFavorite: true, isVip: false },
  { id: 'm003', name: '金色边框', category: 'frame', imageUrl: 'https://picsum.photos/id/431/200/200', isFavorite: false, isVip: true },
  { id: 'm004', name: '爱心贴纸', category: 'sticker', imageUrl: 'https://picsum.photos/id/237/200/200', isFavorite: false, isVip: false },
  { id: 'm005', name: '婚礼标题', category: 'text', imageUrl: 'https://picsum.photos/id/1080/200/200', isFavorite: true, isVip: false },
  { id: 'm006', name: '钻石图标', category: 'icon', imageUrl: 'https://picsum.photos/id/3/200/200', isFavorite: false, isVip: true },
  { id: 'm007', name: '樱花装饰', category: 'flower', imageUrl: 'https://picsum.photos/id/1039/200/200', isFavorite: false, isVip: false },
  { id: 'm008', name: '蝴蝶结', category: 'ribbon', imageUrl: 'https://picsum.photos/id/1015/200/200', isFavorite: false, isVip: false },
  { id: 'm009', name: '花边边框', category: 'frame', imageUrl: 'https://picsum.photos/id/787/200/200', isFavorite: true, isVip: false },
  { id: 'm010', name: '气球贴纸', category: 'sticker', imageUrl: 'https://picsum.photos/id/1082/200/200', isFavorite: false, isVip: false },
  { id: 'm011', name: '生日快乐', category: 'text', imageUrl: 'https://picsum.photos/id/201/200/200', isFavorite: false, isVip: false },
  { id: 'm012', name: '星星图标', category: 'icon', imageUrl: 'https://picsum.photos/id/64/200/200', isFavorite: false, isVip: true },
];
