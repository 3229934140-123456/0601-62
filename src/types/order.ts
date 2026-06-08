export interface Order {
  id: string;
  orderNo: string;
  type: 'print';
  status: 'pending' | 'paid' | 'shipping' | 'completed' | 'cancelled';
  title: string;
  coverImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
  createdAt: string;
  paidAt?: string;
  shippingAddress?: string;
  trackingNo?: string;
}

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待付款', color: '#ff7d00' },
  paid: { label: '已付款', color: '#165dff' },
  shipping: { label: '配送中', color: '#00b42a' },
  completed: { label: '已完成', color: '#86909c' },
  cancelled: { label: '已取消', color: '#c9cdd4' },
};
