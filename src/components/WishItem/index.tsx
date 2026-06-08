import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Wish } from '@/types/wish';

interface WishItemProps {
  wish: Wish;
  onLike?: (id: string) => void;
}

const WishItem: React.FC<WishItemProps> = ({ wish, onLike }) => {
  return (
    <View className={styles.item}>
      <Image
        className={styles.avatar}
        src={wish.avatar}
        mode="aspectFill"
        onError={(e) => console.error('[WishItem] Avatar error:', e)}
      />
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.author}>{wish.author}</Text>
          <Text className={styles.time}>{wish.createdAt}</Text>
        </View>
        <Text className={styles.text}>{wish.content}</Text>
        <View className={styles.footer}>
          <View className={styles.likeBtn} onClick={() => onLike?.(wish.id)}>
            <Text className={classnames(styles.likeIcon, wish.isLiked && styles.liked)}>
              {wish.isLiked ? '❤️' : '🤍'}
            </Text>
            <Text className={styles.likeCount}>{wish.likes}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default WishItem;
