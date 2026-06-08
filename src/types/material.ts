export interface Material {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  isFavorite: boolean;
  isVip: boolean;
}

export interface MaterialCategory {
  key: string;
  label: string;
}
