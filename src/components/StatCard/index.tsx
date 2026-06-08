import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  trend?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, color = '#ff6b8b' }) => {
  return (
    <View className={styles.card} style={{ borderTopColor: color }}>
      <View className={styles.icon} style={{ background: `${color}15` }}>
        <Text className={styles.iconText}>{icon}</Text>
      </View>
      <Text className={styles.value} style={{ color }}>{value}</Text>
      <Text className={styles.label}>{label}</Text>
      {trend && <Text className={styles.trend}>{trend}</Text>}
    </View>
  );
};

export default StatCard;
