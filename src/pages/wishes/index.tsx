import React, { useState } from 'react';
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import WishItem from '@/components/WishItem';
import { wishList as initialWishes } from '@/data/wishes';
import { Wish } from '@/types/wish';

const WishesPage: React.FC = () => {
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const [showModal, setShowModal] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [wishContent, setWishContent] = useState('');

  const handleLike = (id: string) => {
    console.log('[Wishes] Like wish:', id);
    setWishes((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              isLiked: !w.isLiked,
              likes: w.isLiked ? w.likes - 1 : w.likes + 1,
            }
          : w
      )
    );
  };

  const handleSubmit = () => {
    if (!authorName.trim()) {
      Taro.showToast({ title: '请输入您的称呼', icon: 'none' });
      return;
    }
    if (!wishContent.trim()) {
      Taro.showToast({ title: '请输入祝福内容', icon: 'none' });
      return;
    }

    console.log('[Wishes] Submit wish:', { authorName, wishContent });
    const newWish: Wish = {
      id: 'w' + Date.now(),
      author: authorName,
      avatar: 'https://picsum.photos/id/1027/100/100',
      content: wishContent,
      createdAt: new Date().toLocaleString('zh-CN'),
      likes: 0,
      isLiked: false,
    };

    setWishes([newWish, ...wishes]);
    setShowModal(false);
    setAuthorName('');
    setWishContent('');
    Taro.showToast({ title: '祝福发送成功', icon: 'success' });
  };

  const totalWishes = wishes.length;
  const totalLikes = wishes.reduce((sum, w) => sum + w.likes, 0);

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>💝 祝福墙</Text>
        <Text className={styles.subtitle}>感谢每一位送来祝福的朋友</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{totalWishes}</Text>
            <Text className={styles.statLabel}>条祝福</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{totalLikes}</Text>
            <Text className={styles.statLabel}>次点赞</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.wishList}>
        {wishes.map((wish) => (
          <WishItem key={wish.id} wish={wish} onLike={handleLike} />
        ))}
      </ScrollView>

      <View className={styles.writeBtn} onClick={() => setShowModal(true)}>
        <Text className={styles.writeIcon}>✏️</Text>
        <Text className={styles.writeText}>写祝福</Text>
      </View>

      {showModal && (
        <View className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>送上祝福</Text>
              <Text className={styles.modalClose} onClick={() => setShowModal(false)}>
                ✕
              </Text>
            </View>
            <Input
              className={styles.nameInput}
              placeholder="请输入您的称呼"
              value={authorName}
              onInput={(e) => setAuthorName(e.detail.value)}
              maxLength={20}
            />
            <Textarea
              className={styles.contentTextarea}
              placeholder="写下您的祝福..."
              value={wishContent}
              onInput={(e) => setWishContent(e.detail.value)}
              maxLength={200}
            />
            <View className={styles.submitBtn} onClick={handleSubmit}>
              <Text>发送祝福</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default WishesPage;
