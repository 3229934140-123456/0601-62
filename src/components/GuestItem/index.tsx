import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Guest } from '@/types/guest';

interface GuestItemProps {
  guest: Guest;
  onClick?: () => void;
}

const statusMap = {
  pending: { label: '待回复', color: '#ff7d00' },
  confirmed: { label: '已确认', color: '#00b42a' },
  declined: { label: '已婉拒', color: '#c9cdd4' },
};

const GuestItem: React.FC<GuestItemProps> = ({ guest, onClick }) => {
  const status = statusMap[guest.rsvpStatus];

  return (
    <View className={styles.item} onClick={onClick}>
      <View className={styles.avatar}>
        <Text className={styles.avatarText}>{guest.name.charAt(0)}</Text>
      </View>
      <View className={styles.info}>
        <View className={styles.nameRow}>
          <Text className={styles.name}>{guest.title} {guest.name}</Text>
          <Text className={styles.status} style={{ color: status.color }}>
            {status.label}
          </Text>
        </View>
        <Text className={styles.phone}>{guest.phone}</Text>
        <View className={styles.bottomRow}>
          <Text className={styles.group}>{guest.group}</Text>
          <Text className={styles.count}>{guest.guestsCount}人出席</Text>
        </View>
      </View>
    </View>
  );
};

export default GuestItem;
