import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Input, Switch, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useEditorStore } from '@/store/editorStore';
import { getCountdown } from '@/utils';

type PanelType = 'text' | 'photo' | 'color' | 'music' | 'map' | 'countdown' | 'schedule' | null;

const colorThemes = [
  { key: 'pink', value: '#ff6b8b', label: '玫瑰粉' },
  { key: 'red', value: '#e74c3c', label: '中国红' },
  { key: 'gold', value: '#f39c12', label: '金色' },
  { key: 'purple', value: '#9b59b6', label: '梦幻紫' },
  { key: 'blue', value: '#3498db', label: '天空蓝' },
  { key: 'green', value: '#27ae60', label: '森绿' },
  { key: 'black', value: '#2c3e50', label: '曜石黑' },
];

const EditorPage: React.FC = () => {
  const { invitationData, updateField, addSchedule, removeSchedule, updateSchedule } = useEditorStore();
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!invitationData.countdownEnabled) return;

    const targetDate = `${invitationData.date} ${invitationData.time}`;
    const timer = setInterval(() => {
      setCountdown(getCountdown(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [invitationData.date, invitationData.time, invitationData.countdownEnabled]);

  const openPanel = (panel: PanelType) => {
    console.log('[Editor] Open panel:', panel);
    setActivePanel(panel);
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const handlePreview = () => {
    console.log('[Editor] Preview invitation');
    Taro.navigateTo({ url: '/pages/preview/index' });
  };

  const handleAddSchedule = () => {
    addSchedule({ time: '12:00', title: '新日程', description: '日程描述' });
  };

  const scheduleItems = useMemo(() => invitationData.schedule, [invitationData.schedule]);

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.previewArea}>
        <View className={styles.previewCard}>
          <View className={styles.coverSection}>
            <Image
              className={styles.coverImage}
              src={invitationData.coverImage}
              mode="aspectFill"
              onError={(e) => console.error('[Editor] Cover image error:', e)}
            />
            <View className={styles.coverOverlay}>
              <Text className={styles.coverSubtitle}>{invitationData.subtitle}</Text>
              <Text className={styles.coverTitle}>{invitationData.title}</Text>
              <Text className={styles.names}>
                {invitationData.groomName} & {invitationData.brideName}
              </Text>
            </View>
            <View className={styles.dateInfo}>
              <Text className={styles.dateText}>
                {invitationData.date} {invitationData.time}
              </Text>
              <Text className={styles.locationText}>{invitationData.location}</Text>
            </View>
          </View>

          <View className={styles.contentSection}>
            {invitationData.countdownEnabled && (
              <View className={styles.countdownSection}>
                <Text className={styles.countdownTitle}>距离婚礼还有</Text>
                <View className={styles.countdownItems}>
                  <View className={styles.countdownItem}>
                    <Text className={styles.countdownNum}>{countdown.days}</Text>
                    <Text className={styles.countdownLabel}>天</Text>
                  </View>
                  <View className={styles.countdownItem}>
                    <Text className={styles.countdownNum}>{countdown.hours}</Text>
                    <Text className={styles.countdownLabel}>时</Text>
                  </View>
                  <View className={styles.countdownItem}>
                    <Text className={styles.countdownNum}>{countdown.minutes}</Text>
                    <Text className={styles.countdownLabel}>分</Text>
                  </View>
                  <View className={styles.countdownItem}>
                    <Text className={styles.countdownNum}>{countdown.seconds}</Text>
                    <Text className={styles.countdownLabel}>秒</Text>
                  </View>
                </View>
              </View>
            )}

            <Text className={styles.sectionTitle}>婚礼流程</Text>
            <View className={styles.scheduleList}>
              {scheduleItems.map((item, index) => (
                <View key={index} className={styles.scheduleItem}>
                  <Text className={styles.scheduleTime}>{item.time}</Text>
                  <Text className={styles.scheduleTitle}>{item.title}</Text>
                  <Text className={styles.scheduleDesc}>{item.description}</Text>
                </View>
              ))}
            </View>

            <Text className={styles.sectionTitle}>甜蜜时刻</Text>
            <View className={styles.photoSection}>
              <View className={styles.photoGrid}>
                {invitationData.photos.map((photo, index) => (
                  <View key={index} className={styles.photoItem}>
                    <Image
                      className={styles.photo}
                      src={photo}
                      mode="aspectFill"
                      onError={(e) => console.error('[Editor] Photo error:', e, index)}
                    />
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.locationSection}>
              <View className={styles.locationIcon}>📍</View>
              <View className={styles.locationInfo}>
                <Text className={styles.locationName}>{invitationData.location}</Text>
                <Text className={styles.locationAddress}>{invitationData.address}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.toolBtn} onClick={() => openPanel('text')}>
          <Text className={styles.toolIcon}>📝</Text>
          <Text>文字</Text>
        </View>
        <View className={styles.toolBtn} onClick={() => openPanel('photo')}>
          <Text className={styles.toolIcon}>🖼️</Text>
          <Text>照片</Text>
        </View>
        <View className={styles.toolBtn} onClick={() => openPanel('color')}>
          <Text className={styles.toolIcon}>🎨</Text>
          <Text>配色</Text>
        </View>
        <View className={styles.toolBtn} onClick={() => openPanel('schedule')}>
          <Text className={styles.toolIcon}>📋</Text>
          <Text>日程</Text>
        </View>
        <View className={styles.previewBtn} onClick={handlePreview}>
          <Text>预览</Text>
        </View>
      </View>

      <View className={classnames(styles.editPanel, activePanel && styles.show)} onClick={closePanel}>
        <View onClick={(e) => e.stopPropagation()}>
          <View className={styles.panelHeader}>
            <Text className={styles.panelTitle}>
              {activePanel === 'text' && '文字编辑'}
              {activePanel === 'photo' && '照片设置'}
              {activePanel === 'color' && '配色方案'}
              {activePanel === 'music' && '背景音乐'}
              {activePanel === 'map' && '地图位置'}
              {activePanel === 'countdown' && '倒计时设置'}
              {activePanel === 'schedule' && '日程安排'}
            </Text>
            <Text className={styles.panelClose} onClick={closePanel}>
              ✕
            </Text>
          </View>

          {activePanel === 'text' && (
            <View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>主标题</Text>
                <Input
                  className={styles.formInput}
                  value={invitationData.title}
                  onInput={(e) => updateField('title', e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>副标题</Text>
                <Input
                  className={styles.formInput}
                  value={invitationData.subtitle}
                  onInput={(e) => updateField('subtitle', e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>新郎姓名</Text>
                <Input
                  className={styles.formInput}
                  value={invitationData.groomName}
                  onInput={(e) => updateField('groomName', e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>新娘姓名</Text>
                <Input
                  className={styles.formInput}
                  value={invitationData.brideName}
                  onInput={(e) => updateField('brideName', e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>日期</Text>
                <Input
                  className={styles.formInput}
                  value={invitationData.date}
                  placeholder="例如：2026-10-01"
                  onInput={(e) => updateField('date', e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>时间</Text>
                <Input
                  className={styles.formInput}
                  value={invitationData.time}
                  placeholder="例如：12:00"
                  onInput={(e) => updateField('time', e.detail.value)}
                />
              </View>
            </View>
          )}

          {activePanel === 'color' && (
            <View>
              <Text className={styles.formLabel}>选择主题色</Text>
              <View className={styles.colorList}>
                {colorThemes.map((theme) => (
                  <View
                    key={theme.key}
                    className={classnames(styles.colorItem, invitationData.colorTheme === theme.value && styles.active)}
                    style={{ background: theme.value }}
                    onClick={() => updateField('colorTheme', theme.value)}
                  />
                ))}
              </View>
            </View>
          )}

          {activePanel === 'photo' && (
            <View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>封面图片链接</Text>
                <Input
                  className={styles.formInput}
                  value={invitationData.coverImage}
                  onInput={(e) => updateField('coverImage', e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>相册图片 ({invitationData.photos.length}张)</Text>
                {invitationData.photos.map((photo, index) => (
                  <Input
                    key={index}
                    className={styles.formInput}
                    value={photo}
                    style={{ marginBottom: '16rpx' }}
                    onInput={(e) => {
                      const newPhotos = [...invitationData.photos];
                      newPhotos[index] = e.detail.value;
                      updateField('photos', newPhotos);
                    }}
                  />
                ))}
                <View
                  className={styles.addBtn}
                  onClick={() => {
                    const newPhotos = [...invitationData.photos, 'https://picsum.photos/id/292/600/400'];
                    updateField('photos', newPhotos);
                  }}
                >
                  <Text>+ 添加照片</Text>
                </View>
              </View>
            </View>
          )}

          {activePanel === 'schedule' && (
            <View>
              <View className={styles.switchRow}>
                <Text className={styles.switchLabel}>显示倒计时</Text>
                <Switch
                  checked={invitationData.countdownEnabled}
                  onChange={(e) => updateField('countdownEnabled', e.detail.value)}
                  color="#ff6b8b"
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>日程列表</Text>
                {scheduleItems.map((item, index) => (
                  <View key={index} className={styles.scheduleEditItem}>
                    <Input
                      className={styles.scheduleEditTime}
                      value={item.time}
                      onInput={(e) => updateSchedule(index, { time: e.detail.value })}
                    />
                    <View className={styles.scheduleEditInfo}>
                      <Input
                        className={styles.scheduleEditTitle}
                        value={item.title}
                        onInput={(e) => updateSchedule(index, { title: e.detail.value })}
                      />
                      <Input
                        className={styles.scheduleEditDesc}
                        value={item.description}
                        onInput={(e) => updateSchedule(index, { description: e.detail.value })}
                      />
                    </View>
                    <Text onClick={() => removeSchedule(index)}>🗑️</Text>
                  </View>
                ))}
                <View className={styles.addBtn} onClick={handleAddSchedule}>
                  <Text>+ 添加日程</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default EditorPage;
