import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatCard from '@/components/StatCard';
import { useGuestStore, selectGuestStats, selectGroupStats } from '@/store/guestStore';

type RangeType = 'today' | 'week' | 'month';
type SortField = 'views' | 'rsvp' | 'people';

const weekData = [
  { day: '周一', value: 45 },
  { day: '周二', value: 62 },
  { day: '周三', value: 38 },
  { day: '周四', value: 71 },
  { day: '周五', value: 55 },
  { day: '周六', value: 89 },
  { day: '周日', value: 76 },
];

const StatisticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<RangeType>('week');
  const [sortField, setSortField] = useState<SortField>('views');
  const [showGroupDetail, setShowGroupDetail] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const guestStats = useGuestStore(selectGuestStats);
  const groupStats = useGuestStore(selectGroupStats);
  const guests = useGuestStore((state) => state.guests);
  const hydrate = useGuestStore((state) => state.hydrate);
  const getDisplayTitle = useGuestStore((state) => state.getDisplayTitle);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const maxValue = Math.max(...weekData.map((d) => d.value));

  const sortedGuests = useMemo(() => {
    const list = [...guests];
    switch (sortField) {
      case 'views':
        return list.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      case 'rsvp':
        const order = { confirmed: 0, pending: 1, declined: 2 };
        return list.sort((a, b) => order[a.rsvpStatus] - order[b.rsvpStatus]);
      case 'people':
        return list.sort((a, b) => b.guestsCount - a.guestsCount);
      default:
        return list;
    }
  }, [guests, sortField]);

  const groupList = useMemo(() => {
    return Object.entries(groupStats).map(([name, stats]) => ({
      name,
      ...stats,
    }));
  }, [groupStats]);

  const groupDetailGuests = useMemo(() => {
    if (!selectedGroup) return [];
    return guests.filter((g) => g.group === selectedGroup);
  }, [selectedGroup, guests]);

  const handleGroupClick = (groupName: string) => {
    setSelectedGroup(groupName);
    setShowGroupDetail(true);
  };

  const getRsvpLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '已确认';
      case 'declined':
        return '已婉拒';
      default:
        return '待回复';
    }
  };

  const getRsvpClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return styles.rsvpConfirmed;
      case 'declined':
        return styles.rsvpDeclined;
      default:
        return styles.rsvpPending;
    }
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.overviewGrid}>
        <StatCard icon="👁️" label="总浏览量" value={guestStats.totalViews.toString()} trend="累计访问" color="#ff6b8b" />
        <StatCard
          icon="✅"
          label="报名数"
          value={guestStats.confirmed.toString()}
          trend="RSVP确认"
          color="#00b42a"
        />
        <StatCard icon="💬" label="祝福数" value="99" color="#ff7d00" />
        <StatCard
          icon="👥"
          label="宾客数"
          value={guestStats.total.toString()}
          color="#165dff"
        />
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>浏览趋势</View>
        <View className={styles.timeRange}>
          {[
            { key: 'today', label: '今日' },
            { key: 'week', label: '本周' },
            { key: 'month', label: '本月' },
          ].map((range) => (
            <View
              key={range.key}
              className={classnames(styles.rangeBtn, timeRange === range.key && styles.active)}
              onClick={() => setTimeRange(range.key as RangeType)}
            >
              <Text>{range.label}</Text>
            </View>
          ))}
        </View>
        <View className={styles.barChart}>
          {weekData.map((item, index) => (
            <View key={index} className={styles.barItem}>
              <View
                className={styles.bar}
                style={{ height: `${(item.value / maxValue) * 180}rpx` }}
              />
              <Text className={styles.barLabel}>{item.day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>分组统计</View>
        <View className={styles.groupStats}>
          {groupList.map((group) => (
            <View
              key={group.name}
              className={styles.groupStatCard}
              onClick={() => handleGroupClick(group.name)}
            >
              <View className={styles.groupHeader}>
                <Text className={styles.groupName}>{group.name}</Text>
                <Text className={styles.groupCount}>{group.count}人</Text>
              </View>
              <View className={styles.groupDetailRow}>
                <View className={styles.groupDetailItem}>
                  <Text className={styles.groupDetailValue} style={{ color: '#00b42a' }}>{group.confirmed}</Text>
                  <Text className={styles.groupDetailLabel}>已确认</Text>
                </View>
                <View className={styles.groupDetailItem}>
                  <Text className={styles.groupDetailValue} style={{ color: '#ff7d00' }}>{group.pending}</Text>
                  <Text className={styles.groupDetailLabel}>待回复</Text>
                </View>
                <View className={styles.groupDetailItem}>
                  <Text className={styles.groupDetailValue} style={{ color: '#86909c' }}>{group.declined}</Text>
                  <Text className={styles.groupDetailLabel}>已婉拒</Text>
                </View>
                <View className={styles.groupDetailItem}>
                  <Text className={styles.groupDetailValue} style={{ color: '#ff6b8b' }}>{group.people}</Text>
                  <Text className={styles.groupDetailLabel}>预计出席</Text>
                </View>
              </View>
              <View className={styles.groupViews}>
                <Text style={{ color: '#86909c', fontSize: 22 }}>👁️ 浏览 {group.views} 次</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>宾客明细</Text>
          <View className={styles.sortTabs}>
            {[
              { key: 'views', label: '按浏览' },
              { key: 'rsvp', label: '按RSVP' },
              { key: 'people', label: '按人数' },
            ].map((tab) => (
              <View
                key={tab.key}
                className={classnames(styles.sortTab, sortField === tab.key && styles.active)}
                onClick={() => setSortField(tab.key as SortField)}
              >
                <Text>{tab.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View className={styles.guestList}>
          {sortedGuests.map((guest) => (
            <View key={guest.id} className={styles.guestRow}>
              <View className={styles.guestInfo}>
                <Text className={styles.guestName}>{getDisplayTitle(guest)}</Text>
                <Text className={styles.guestGroup}>{guest.group}</Text>
              </View>
              <View className={styles.guestStats}>
                <View className={styles.guestStatItem}>
                  <Text className={styles.guestStatValue}>{guest.viewCount || 0}</Text>
                  <Text className={styles.guestStatLabel}>浏览</Text>
                </View>
                <View className={styles.guestStatItem}>
                  <Text className={classnames(styles.guestStatValue, getRsvpClass(guest.rsvpStatus))}>
                    {getRsvpLabel(guest.rsvpStatus)}
                  </Text>
                  <Text className={styles.guestStatLabel}>RSVP</Text>
                </View>
                <View className={styles.guestStatItem}>
                  <Text className={styles.guestStatValue}>{guest.rsvpStatus !== 'declined' ? guest.guestsCount : 0}</Text>
                  <Text className={styles.guestStatLabel}>出席人数</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>RSVP 统计</View>
        <View className={styles.rsvpStats}>
          <View className={styles.rsvpItem}>
            <Text className={styles.rsvpNum}>{guestStats.confirmed}</Text>
            <Text className={styles.rsvpLabel}>已确认</Text>
          </View>
          <View className={styles.rsvpItem}>
            <Text className={classnames(styles.rsvpNum, styles.rsvpPending)}>{guestStats.pending}</Text>
            <Text className={styles.rsvpLabel}>待回复</Text>
          </View>
          <View className={styles.rsvpItem}>
            <Text className={classnames(styles.rsvpNum, styles.rsvpDeclined)}>{guestStats.declined}</Text>
            <Text className={styles.rsvpLabel}>已婉拒</Text>
          </View>
        </View>
        <View style={{ marginTop: 24, textAlign: 'center' }}>
          <Text style={{ fontSize: 24, color: '#86909c' }}>
            预计出席人数：<Text style={{ color: '#ff6b8b', fontWeight: 600 }}>{guestStats.totalPeople}</Text> 人
          </Text>
        </View>
      </View>

      {showGroupDetail && (
        <View className={styles.modal} onClick={() => setShowGroupDetail(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>{selectedGroup} - 宾客详情</Text>
              <Text className={styles.modalClose} onClick={() => setShowGroupDetail(false)}>×</Text>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              {groupDetailGuests.length === 0 ? (
                <View style={{ padding: 60, textAlign: 'center', color: '#86909c' }}>
                  <Text>暂无宾客</Text>
                </View>
              ) : (
                groupDetailGuests.map((guest) => (
                  <View key={guest.id} className={styles.detailGuestItem}>
                    <View className={styles.detailGuestInfo}>
                      <Text className={styles.detailGuestName}>{getDisplayTitle(guest)}</Text>
                      <View className={styles.detailGuestTags}>
                        <Text className={classnames(styles.detailRsvpTag, getRsvpClass(guest.rsvpStatus))}>
                          {getRsvpLabel(guest.rsvpStatus)}
                        </Text>
                        <Text className={styles.detailViewTag}>�️ {guest.viewCount || 0}</Text>
                      </View>
                    </View>
                    <View className={styles.detailGuestPeople}>
                      <Text style={{ fontSize: 28, fontWeight: 600, color: '#ff6b8b' }}>
                        {guest.rsvpStatus !== 'declined' ? guest.guestsCount : 0}
                      </Text>
                      <Text style={{ fontSize: 20, color: '#86909c' }}>人出席</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default StatisticsPage;
