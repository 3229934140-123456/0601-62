import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Order, ORDER_STATUS_MAP } from '@/types/order';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const statusInfo = ORDER_STATUS_MAP[order.status];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      console.log('[OrderCard] Order clicked:', order.id);
      Taro.showToast({ title: '订单详情开发中', icon: 'none' });
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <Text className={styles.orderNo}>订单号：{order.orderNo}</Text>
        <Text className={styles.status} style={{ color: statusInfo.color }}>
          {statusInfo.label}
        </Text>
      </View>
      <View className={styles.content}>
        <Image className={styles.cover} src={order.coverImage} mode="aspectFill" />
        <View className={styles.info}>
          <Text className={styles.title}>{order.title}</Text>
          <Text className={styles.desc}>数量：{order.quantity} 张</Text>
          <Text className={styles.price}>
            ¥<Text className={styles.priceNum}>{order.totalPrice}</Text>
          </Text>
        </View>
      </View>
      <View className={styles.footer}>
        <Text className={styles.time}>下单时间：{order.createdAt}</Text>
        <View className={styles.actions}>
          {order.status === 'pending' && (
            <View className={classnames(styles.btn, styles.primary)}>
              <Text>去付款</Text>
            </View>
          )}
          {order.status === 'shipping' && (
            <View className={styles.btn}>
              <Text>查看物流</Text>
            </View>
          )}
          {order.status === 'completed' && (
            <View className={styles.btn}>
              <Text>再次下单</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default OrderCard;
