import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import OrderCard from '@/components/OrderCard';
import { orderList } from '@/data/orders';

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'paid', label: '待发货' },
  { key: 'shipping', label: '配送中' },
  { key: 'completed', label: '已完成' },
];

const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orderList;
    return orderList.filter((o) => o.status === activeTab);
  }, [activeTab]);

  return (
    <ScrollView scrollY className={styles.page}>
      <ScrollView scrollX className={styles.tabs} enhanced showScrollbar={false}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </ScrollView>

      {filteredOrders.length > 0 ? (
        <View className={styles.orderList}>
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📦</Text>
          <Text className={styles.emptyText}>暂无相关订单</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default OrdersPage;
