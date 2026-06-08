import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Invitation } from '@/types/invitation';

interface WorkCardProps {
  work: Invitation;
  onEdit?: () => void;
  onPreview?: () => void;
}

const WorkCard: React.FC<WorkCardProps> = ({ work, onEdit, onPreview }) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    } else {
      Taro.navigateTo({ url: `/pages/editor/index?workId=${work.id}` });
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPreview) {
      onPreview();
    } else {
      Taro.navigateTo({ url: `/pages/preview/index?workId=${work.id}` });
    }
  };

  const getCategoryLabel = () => {
    const map: Record<string, string> = {
      wedding: '婚礼',
      birthday: '生日',
      anniversary: '店庆',
    };
    return map[work.category] || '其他';
  };

  return (
    <View className={styles.card}>
      <View className={styles.coverWrap}>
        <Image className={styles.cover} src={work.templateCover} mode="aspectFill" />
        <View className={classnames(styles.statusBadge, work.status === 'published' ? styles.published : styles.draft)}>
          <Text>{work.status === 'published' ? '已发布' : '草稿'}</Text>
        </View>
        <View className={styles.categoryBadge}>
          <Text>{getCategoryLabel()}</Text>
        </View>
      </View>
      <View className={styles.info}>
        <Text className={styles.title}>{work.title}</Text>
        <Text className={styles.time}>更新于 {work.updatedAt}</Text>
        {work.status === 'published' && (
          <View className={styles.stats}>
            <View className={styles.statItem}>
              <Text className={styles.statIcon}>👁️</Text>
              <Text className={styles.statNum}>{work.views}</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statIcon}>✅</Text>
              <Text className={styles.statNum}>{work.rsvps}</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statIcon}>💬</Text>
              <Text className={styles.statNum}>{work.wishes}</Text>
            </View>
          </View>
        )}
        <View className={styles.actions}>
          <View className={classnames(styles.btn, styles.primary)} onClick={handleEdit}>
            <Text>编辑</Text>
          </View>
          <View className={styles.btn} onClick={handlePreview}>
            <Text>预览</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WorkCard;
