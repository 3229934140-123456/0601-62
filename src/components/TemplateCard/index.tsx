import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Template } from '@/types/template';

interface TemplateCardProps {
  template: Template;
  size?: 'normal' | 'small';
  onClick?: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, size = 'normal', onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/editor/index?templateId=${template.id}`,
      });
    }
  };

  return (
    <View className={classnames(styles.card, size === 'small' && styles.small)} onClick={handleClick}>
      <View className={styles.imageWrap}>
        <Image
          className={styles.image}
          src={template.cover}
          mode="aspectFill"
          lazyLoad
          onError={(e) => console.error('[TemplateCard] Image load error:', e)}
        />
        {template.isHot && (
          <View className={classnames(styles.tag, styles.hot)}>
            <Text>热门</Text>
          </View>
        )}
        {template.isNew && (
          <View className={classnames(styles.tag, styles.new)}>
            <Text>新品</Text>
          </View>
        )}
        {template.isFree ? (
          <View className={classnames(styles.priceTag, styles.free)}>
            <Text>免费</Text>
          </View>
        ) : (
          <View className={styles.priceTag}>
            <Text>¥{template.price}</Text>
          </View>
        )}
      </View>
      <View className={styles.info}>
        <Text className={styles.title}>{template.title}</Text>
        <View className={styles.tags}>
          {template.tags.slice(0, 2).map((tag) => (
            <Text key={tag} className={styles.tagItem}>
              {tag}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

export default TemplateCard;
