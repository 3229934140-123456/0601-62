import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { materialCategories, materialList } from '@/data/materials';

type TabType = 'all' | 'favorite';

const MaterialPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [materials, setMaterials] = useState(materialList);

  const filteredMaterials = useMemo(() => {
    let list = materials;
    if (activeTab === 'favorite') {
      list = list.filter((m) => m.isFavorite);
    }
    if (activeCategory !== 'all') {
      list = list.filter((m) => m.category === activeCategory);
    }
    return list;
  }, [materials, activeTab, activeCategory]);

  const toggleFavorite = (id: string) => {
    console.log('[Material] Toggle favorite:', id);
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m))
    );
  };

  const handleMaterialClick = (id: string) => {
    console.log('[Material] Material clicked:', id);
    Taro.showToast({ title: '已添加到画布', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        <View
          className={classnames(styles.tabItem, activeTab === 'all' && styles.active)}
          onClick={() => setActiveTab('all')}
        >
          <Text>全部素材</Text>
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'favorite' && styles.active)}
          onClick={() => setActiveTab('favorite')}
        >
          <Text>我的收藏</Text>
        </View>
      </View>

      <ScrollView scrollX className={styles.categoryBar} enhanced showScrollbar={false}>
        {materialCategories.map((cat) => (
          <View
            key={cat.key}
            className={classnames(styles.categoryItem, activeCategory === cat.key && styles.active)}
            onClick={() => setActiveCategory(cat.key)}
          >
            <Text>{cat.label}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.materialGrid}>
        {filteredMaterials.map((material) => (
          <View key={material.id} className={styles.materialItem} onClick={() => handleMaterialClick(material.id)}>
            <Image
              className={styles.materialImage}
              src={material.imageUrl}
              mode="aspectFill"
              onError={(e) => console.error('[Material] Image error:', e)}
            />
            {material.isVip && (
              <View className={styles.materialVip}>
                <Text>VIP</Text>
              </View>
            )}
            <View className={styles.favoriteBtn} onClick={(e) => { e.stopPropagation(); toggleFavorite(material.id); }}>
              <Text>{material.isFavorite ? '❤️' : '🤍'}</Text>
            </View>
            <Text className={styles.materialName}>{material.name}</Text>
          </View>
        ))}
      </View>

      {filteredMaterials.length === 0 && (
        <View style={{ textAlign: 'center', padding: '120rpx 0', color: '#86909c' }}>
          <Text style={{ fontSize: '80rpx' }}>🎨</Text>
          <Text style={{ marginTop: '24rpx', display: 'block' }}>暂无素材</Text>
        </View>
      )}
    </View>
  );
};

export default MaterialPage;
