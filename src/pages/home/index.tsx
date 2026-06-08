import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import CategoryBar from '@/components/CategoryBar';
import TemplateCard from '@/components/TemplateCard';
import { templateList } from '@/data/templates';
import { TemplateCategory } from '@/types/template';

const HomePage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  const filteredTemplates = useMemo(() => {
    let list = templateList;
    if (activeCategory !== 'all') {
      list = list.filter((t) => t.category === activeCategory);
    }
    if (searchText) {
      list = list.filter((t) => t.title.includes(searchText) || t.tags.some((tag) => tag.includes(searchText)));
    }
    return list;
  }, [activeCategory, searchText]);

  const hotTemplates = filteredTemplates.filter((t) => t.isHot).slice(0, 4);
  const newTemplates = filteredTemplates.filter((t) => t.isNew || !t.isHot).slice(0, 4);

  const handleQuickEntry = (type: string) => {
    console.log('[Home] Quick entry clicked:', type);
    switch (type) {
      case 'editor':
        Taro.navigateTo({ url: '/pages/editor/index' });
        break;
      case 'material':
        Taro.navigateTo({ url: '/pages/material/index' });
        break;
      case 'guests':
        Taro.navigateTo({ url: '/pages/guests/index' });
        break;
      case 'statistics':
        Taro.navigateTo({ url: '/pages/statistics/index' });
        break;
      default:
        break;
    }
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>喜帖设计</Text>
        <Text className={styles.headerSubtitle}>三分钟制作精美电子邀请函</Text>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索模板、风格..."
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>
      </View>

      <View className={`${styles.section} ${styles.categorySection}`}>
        <CategoryBar activeKey={activeCategory} onChange={setActiveCategory} />
      </View>

      <View className={styles.quickEntry}>
        <View className={styles.quickItem} onClick={() => handleQuickEntry('editor')}>
          <View className={styles.quickIcon}>✏️</View>
          <Text className={styles.quickLabel}>去制作</Text>
        </View>
        <View className={styles.quickItem} onClick={() => handleQuickEntry('material')}>
          <View className={styles.quickIcon}>🎨</View>
          <Text className={styles.quickLabel}>素材库</Text>
        </View>
        <View className={styles.quickItem} onClick={() => handleQuickEntry('guests')}>
          <View className={styles.quickIcon}>👥</View>
          <Text className={styles.quickLabel}>宾客名单</Text>
        </View>
        <View className={styles.quickItem} onClick={() => handleQuickEntry('statistics')}>
          <View className={styles.quickIcon}>📊</View>
          <Text className={styles.quickLabel}>数据统计</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>🔥 热门推荐</Text>
          <Text className={styles.sectionMore}>查看更多 ›</Text>
        </View>
        <View className={styles.hotGrid}>
          {hotTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} size="small" />
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>✨ 最新上线</Text>
          <Text className={styles.sectionMore}>查看更多 ›</Text>
        </View>
        <View className={styles.newList}>
          {newTemplates.map((template) => (
            <View key={template.id} className={styles.newItem}>
              <View className={styles.newImageWrap}>
                <Image className={styles.newImage} src={template.cover} mode="aspectFill" />
              </View>
              <View className={styles.newInfo}>
                <View>
                  <Text className={styles.newTitle}>{template.title}</Text>
                  <Text className={styles.newDesc}>{template.description}</Text>
                </View>
                <View className={styles.newBottom}>
                  <View className={styles.newTags}>
                    {template.tags.slice(0, 2).map((tag) => (
                      <Text key={tag} className={styles.newTag}>
                        {tag}
                      </Text>
                    ))}
                  </View>
                  <Text className={`${styles.newPrice} ${template.isFree ? styles.free : ''}`}>
                    {template.isFree ? '免费' : `¥${template.price}`}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
