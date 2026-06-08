import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import GuestItem from '@/components/GuestItem';
import { guestList, guestGroups } from '@/data/guests';

const GuestsPage: React.FC = () => {
  const [activeGroup, setActiveGroup] = useState('all');

  const filteredGuests = useMemo(() => {
    if (activeGroup === 'all') return guestList;
    return guestList.filter((g) => g.group === activeGroup);
  }, [activeGroup]);

  const stats = useMemo(() => {
    const total = guestList.length;
    const confirmed = guestList.filter((g) => g.rsvpStatus === 'confirmed').length;
    const pending = guestList.filter((g) => g.rsvpStatus === 'pending').length;
    const declined = guestList.filter((g) => g.rsvpStatus === 'declined').length;
    const totalPeople = guestList.reduce((sum, g) => sum + g.guestsCount, 0);
    return { total, confirmed, pending, declined, totalPeople };
  }, []);

  const handleImport = () => {
    console.log('[Guests] Import guests');
    Taro.showActionSheet({
      itemList: ['手动添加', '从通讯录导入', '从Excel导入'],
      success: (res) => {
        console.log('[Guests] Import type selected:', res.tapIndex);
        Taro.showToast({ title: '功能开发中', icon: 'none' });
      },
    });
  };

  const handleExport = () => {
    console.log('[Guests] Export guests');
    Taro.showToast({ title: '导出成功', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.statsBar}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{stats.total}</Text>
          <Text className={styles.statLabel}>总人数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statNum, styles.statConfirmed)}>{stats.confirmed}</Text>
          <Text className={styles.statLabel}>已确认</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statNum, styles.statPending)}>{stats.pending}</Text>
          <Text className={styles.statLabel}>待回复</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statNum, styles.statDeclined)}>{stats.totalPeople}</Text>
          <Text className={styles.statLabel}>出席人数</Text>
        </View>
      </View>

      <ScrollView scrollX className={styles.groupTabs} enhanced showScrollbar={false}>
        {guestGroups.map((group) => (
          <View
            key={group.key}
            className={classnames(styles.groupTab, activeGroup === group.key && styles.active)}
            onClick={() => setActiveGroup(group.key)}
          >
            <Text>{group.label} ({group.count})</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY className={styles.listContent}>
        <View className={styles.guestList}>
          {filteredGuests.map((guest) => (
            <GuestItem key={guest.id} guest={guest} />
          ))}
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={classnames(styles.btn, styles.secondary)} onClick={handleExport}>
          <Text>导出名单</Text>
        </View>
        <View className={classnames(styles.btn, styles.primary)} onClick={handleImport}>
          <Text>添加宾客</Text>
        </View>
      </View>
    </View>
  );
};

export default GuestsPage;
