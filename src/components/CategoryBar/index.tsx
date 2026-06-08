import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { CATEGORY_LIST } from '@/types/template';

interface CategoryBarProps {
  activeKey: string;
  onChange?: (key: string) => void;
  showAll?: boolean;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ activeKey, onChange, showAll = true }) => {
  const categories = showAll ? CATEGORY_LIST : CATEGORY_LIST.filter((c) => c.key !== 'all');

  return (
    <ScrollView scrollX className={styles.container} enhanced showScrollbar={false}>
      <View className={styles.wrap}>
        {categories.map((cat) => (
          <View
            key={cat.key}
            className={classnames(styles.item, activeKey === cat.key && styles.active)}
            onClick={() => onChange?.(cat.key)}
          >
            <Text className={styles.icon}>{cat.icon}</Text>
            <Text className={styles.label}>{cat.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default CategoryBar;
