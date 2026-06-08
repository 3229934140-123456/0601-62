import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import WorkCard from '@/components/WorkCard';
import { worksList } from '@/data/works';

type TabType = 'all' | 'published' | 'draft';

const WorksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filteredWorks = useMemo(() => {
    if (activeTab === 'all') return worksList;
    return worksList.filter((w) => w.status === activeTab);
  }, [activeTab]);

  const handleCreate = () => {
    console.log('[Works] Create new work');
    Taro.switchTab({ url: '/pages/home/index' });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.tabs}>
        {[
          { key: 'all', label: '全部' },
          { key: 'published', label: '已发布' },
          { key: 'draft', label: '草稿' },
        ].map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key as TabType)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      {filteredWorks.length > 0 ? (
        <View className={styles.workList}>
          {filteredWorks.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📝</Text>
          <Text className={styles.emptyText}>暂无作品，快去创建一个吧</Text>
          <View className={styles.createBtn} onClick={handleCreate}>
            <Text>去创建</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default WorksPage;
