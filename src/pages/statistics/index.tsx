import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatCard from '@/components/StatCard';

type RangeType = 'today' | 'week' | 'month';

const weekData = [
  { day: '周一', value: 45 },
  { day: '周二', value: 62 },
  { day: '周三', value: 38 },
  { day: '周四', value: 71 },
  { day: '周五', value: 55 },
  { day: '周六', value: 89 },
  { day: '周日', value: 76 },
];

const sourceData = [
  { name: '微信分享', value: 128, percent: 45 },
  { name: '朋友圈', value: 86, percent: 30 },
  { name: '二维码', value: 45, percent: 16 },
  { name: '其他', value: 25, percent: 9 },
];

const StatisticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<RangeType>('week');

  const maxValue = Math.max(...weekData.map((d) => d.value));

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.overviewGrid}>
        <StatCard icon="👁️" label="总浏览量" value="384" trend="↑ 12% 较昨日" color="#ff6b8b" />
        <StatCard icon="✅" label="报名数" value="145" trend="↑ 8% 较昨日" color="#00b42a" />
        <StatCard icon="💬" label="祝福数" value="99" color="#ff7d00" />
        <StatCard icon="👥" label="宾客数" value="200" color="#165dff" />
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
        <View className={styles.sectionTitle}>宾客来源</View>
        <View className={styles.sourceList}>
          {sourceData.map((item, index) => (
            <View key={index} className={styles.sourceItem}>
              <Text className={styles.sourceName}>{item.name}</Text>
              <View className={styles.sourceBar}>
                <View className={styles.sourceFill} style={{ width: `${item.percent}%` }} />
              </View>
              <Text className={styles.sourceValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>RSVP 统计</View>
        <View className={styles.rsvpStats}>
          <View className={styles.rsvpItem}>
            <Text className={styles.rsvpNum}>56</Text>
            <Text className={styles.rsvpLabel}>已确认</Text>
          </View>
          <View className={styles.rsvpItem}>
            <Text className={classnames(styles.rsvpNum, styles.rsvpPending)}>18</Text>
            <Text className={styles.rsvpLabel}>待回复</Text>
          </View>
          <View className={styles.rsvpItem}>
            <Text className={classnames(styles.rsvpNum, styles.rsvpDeclined)}>6</Text>
            <Text className={styles.rsvpLabel}>已婉拒</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>热门作品</View>
        <View style={{ padding: '40rpx 0', textAlign: 'center', color: '#86909c' }}>
          <Text style={{ fontSize: '60rpx' }}>📊</Text>
          <Text style={{ marginTop: '16rpx', display: 'block', fontSize: '26rpx' }}>作品排行功能开发中</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default StatisticsPage;
