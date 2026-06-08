import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const handleMenuItem = (key: string) => {
    console.log('[Mine] Menu clicked:', key);
    switch (key) {
      case 'works':
        Taro.switchTab({ url: '/pages/works/index' });
        break;
      case 'orders':
        Taro.switchTab({ url: '/pages/orders/index' });
        break;
      case 'guests':
        Taro.navigateTo({ url: '/pages/guests/index' });
        break;
      case 'wishes':
        Taro.navigateTo({ url: '/pages/wishes/index' });
        break;
      case 'statistics':
        Taro.navigateTo({ url: '/pages/statistics/index' });
        break;
      case 'material':
        Taro.navigateTo({ url: '/pages/material/index' });
        break;
      default:
        Taro.showToast({ title: '功能开发中', icon: 'none' });
        break;
    }
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Image
          className={styles.avatar}
          src="https://picsum.photos/id/64/200/200"
          mode="aspectFill"
          onError={(e) => console.error('[Mine] Avatar load error:', e)}
        />
        <View className={styles.userInfo}>
          <Text className={styles.nickname}>创意设计师</Text>
          <Text className={styles.memberLevel}>✨ VIP会员</Text>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>4</Text>
          <Text className={styles.statLabel}>作品数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>3</Text>
          <Text className={styles.statLabel}>订单数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>384</Text>
          <Text className={styles.statLabel}>总浏览</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>145</Text>
          <Text className={styles.statLabel}>总报名</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.menuTitle}>我的创作</Text>
        <View className={styles.menuItem} onClick={() => handleMenuItem('works')}>
          <View className={styles.menuIcon}>📝</View>
          <Text className={styles.menuText}>我的作品</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuItem('orders')}>
          <View className={styles.menuIcon}>📦</View>
          <Text className={styles.menuText}>我的订单</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuItem('material')}>
          <View className={styles.menuIcon}>🎨</View>
          <Text className={styles.menuText}>素材收藏</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.menuTitle}>宾客与互动</Text>
        <View className={styles.menuItem} onClick={() => handleMenuItem('guests')}>
          <View className={styles.menuIcon}>👥</View>
          <Text className={styles.menuText}>宾客名单</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuItem('wishes')}>
          <View className={styles.menuIcon}>💬</View>
          <Text className={styles.menuText}>祝福墙</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuItem('statistics')}>
          <View className={styles.menuIcon}>📊</View>
          <Text className={styles.menuText}>数据统计</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.menuTitle}>设置与帮助</Text>
        <View className={styles.menuItem} onClick={() => handleMenuItem('service')}>
          <View className={styles.menuIcon}>💁</View>
          <Text className={styles.menuText}>联系客服</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuItem('settings')}>
          <View className={styles.menuIcon}>⚙️</View>
          <Text className={styles.menuText}>设置</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
