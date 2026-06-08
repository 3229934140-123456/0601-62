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

const demoMusicList = [
  { id: 'm1', name: '梦中的婚礼', artist: '理查德·克莱德曼' },
  { id: 'm2', name: '婚礼进行曲', artist: '门德尔松' },
  { id: 'm3', name: 'Canon in D', artist: '帕赫贝尔' },
  { id: 'm4', name: 'A Thousand Years', artist: 'Christina Perri' },
  { id: 'm5', name: 'Marry You', artist: 'Bruno Mars' },
  { id: 'm6', name: '这就是爱', artist: '张杰' },
];

const EditorPage: React.FC = () => {
  const { invitationData, updateField, addSchedule, removeSchedule, updateSchedule, hydrate } = useEditorStore();
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const colorTheme = invitationData.colorTheme;

  const lightenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  };

  const bgColorLight = useMemo(() => lightenColor(colorTheme, 70), [colorTheme]);
  const bgColorLighter = useMemo(() => lightenColor(colorTheme, 90), [colorTheme]);

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

  const handleSelectMusic = (music: { id: string; name: string; artist: string }) => {
    console.log('[Editor] Select music:', music.name);
    updateField('musicName', music.name);
    updateField('musicUrl', `demo://${music.id}`);
  };

  const scheduleItems = useMemo(() => invitationData.schedule, [invitationData.schedule]);

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.previewArea}>
        <View className={styles.previewCard}>
          <View className={styles.coverSection}>
            {invitationData.musicName && (
              <View className={styles.musicBadge}>
                <Text className={styles.musicIcon}>🎵</Text>
                <Text style={{ maxWidth: '200rpx' }} className={styles.musicBadgeText}>
                  {invitationData.musicName}
                </Text>
              </View>
            )}
            <Image
              className={styles.coverImage}
              src={invitationData.coverImage}
              mode="aspectFill"
              onError={(e) => console.error('[Editor] Cover image error:', e)}
            />
            <View className={styles.coverOverlay}>
              <Text className={styles.coverSubtitle}>{invitationData.subtitle}</Text>
              <Text className={styles.coverTitle} style={{ color: colorTheme }}>
                {invitationData.title}
              </Text>
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
              <View className={styles.countdownSection} style={{ background: `linear-gradient(135deg, ${bgColorLighter} 0%, #ffffff 100%)` }}>
                <Text className={styles.countdownTitle}>距离婚礼还有</Text>
                <View className={styles.countdownItems}>
                  <View className={styles.countdownItem}>
                    <Text className={styles.countdownNum} style={{ background: `linear-gradient(135deg, ${colorTheme} 0%, ${lightenColor(colorTheme, 20)} 100%)` }}>
                      {countdown.days}
                    </Text>
                    <Text className={styles.countdownLabel}>天</Text>
                  </View>
                  <View className={styles.countdownItem}>
                    <Text className={styles.countdownNum} style={{ background: `linear-gradient(135deg, ${colorTheme} 0%, ${lightenColor(colorTheme, 20)} 100%)` }}>
                      {countdown.hours}
                    </Text>
                    <Text className={styles.countdownLabel}>时</Text>
                  </View>
                  <View className={styles.countdownItem}>
                    <Text className={styles.countdownNum} style={{ background: `linear-gradient(135deg, ${colorTheme} 0%, ${lightenColor(colorTheme, 20)} 100%)` }}>
                      {countdown.minutes}
                    </Text>
                    <Text className={styles.countdownLabel}>分</Text>
                  </View>
                  <View className={styles.countdownItem}>
                    <Text className={styles.countdownNum} style={{ background: `linear-gradient(135deg, ${colorTheme} 0%, ${lightenColor(colorTheme, 20)} 100%)` }}>
                      {countdown.seconds}
                    </Text>
                    <Text className={styles.countdownLabel}>秒</Text>
                  </View>
                </View>
              </View>
            )}

            <Text className={styles.sectionTitle} style={{ color: colorTheme }}>
              <Text style={{ color: colorTheme }}>婚礼流程</Text>
            </Text>
            <View className={styles.scheduleList} style={{ borderColor: bgColorLight }}>
              <View style={{ position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, background: bgColorLight }} />
              {scheduleItems.map((item, index) => (
                <View key={index} className={styles.scheduleItem}>
                  <Text className={styles.scheduleTime} style={{ color: colorTheme }}>{item.time}</Text>
                  <Text className={styles.scheduleTitle}>{item.title}</Text>
                  <Text className={styles.scheduleDesc}>{item.description}</Text>
                  <View
                    style={{
                      position: 'absolute',
                      left: -42,
                      top: 8,
                      width: 16,
                      height: 16,
                      background: colorTheme,
                      borderRadius: '50%',
                      border: '4rpx solid #fff',
                      boxShadow: `0 0 0 2rpx ${colorTheme}`,
                    }}
                  />
                </View>
              ))}
            </View>

            <Text className={styles.sectionTitle} style={{ color: colorTheme }}>
              甜蜜时刻
            </Text>
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

            <View className={styles.locationSection} style={{ background: bgColorLighter }}>
              <View className={styles.locationIcon} style={{ background: colorTheme }}>📍</View>
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
        <View className={styles.toolBtn} onClick={() => openPanel('music')}>
          <Text className={styles.toolIcon}>🎵</Text>
          <Text>音乐</Text>
        </View>
        <View className={styles.toolBtn} onClick={() => openPanel('map')}>
          <Text className={styles.toolIcon}>📍</Text>
          <Text>地图</Text>
        </View>
        <View className={styles.toolBtn} onClick={() => openPanel('schedule')}>
          <Text className={styles.toolIcon}>📋</Text>
          <Text>日程</Text>
        </View>
        <View className={styles.toolBtn} onClick={() => openPanel('countdown')}>
          <Text className={styles.toolIcon}>⏰</Text>
          <Text>倒计时</Text>
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
              <Text className={styles.demoLabel}>
                当前主题色：{colorThemes.find(t => t.value === colorTheme)?.label || '自定义'}
              </Text>
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

          {activePanel === 'music' && (
            <View>
              <Text className={styles.formLabel}>选择背景音乐</Text>
              <View className={styles.musicList}>
                {demoMusicList.map((music) => (
                  <View
                    key={music.id}
                    className={classnames(styles.musicOption, invitationData.musicName === music.name && styles.active)}
                    onClick={() => handleSelectMusic(music)}
                  >
                    <View className={styles.musicPlayIcon} style={{ background: colorTheme }}>▶</View>
                    <View className={styles.musicInfo}>
                      <Text className={styles.musicName}>{music.name}</Text>
                      <Text className={styles.musicArtist}>{music.artist}</Text>
                    </View>
                    {invitationData.musicName === music.name && (
                      <Text className={styles.musicCheck}>✓</Text>
                    )}
                  </View>
                ))}
              </View>
              <View className={styles.formItem} style={{ marginTop: 32 }}>
                <Text className={styles.formLabel}>自定义音乐链接（可选）</Text>
                <Input
                  className={styles.formInput}
                  placeholder="请输入音乐URL"
                  value={invitationData.musicUrl}
                  onInput={(e) => updateField('musicUrl', e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>音乐名称</Text>
                <Input
                  className={styles.formInput}
                  placeholder="显示在邀请函上的音乐名"
                  value={invitationData.musicName}
                  onInput={(e) => updateField('musicName', e.detail.value)}
                />
              </View>
            </View>
          )}

          {activePanel === 'map' && (
            <View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>地点名称</Text>
                <Input
                  className={styles.formInput}
                  value={invitationData.location}
                  placeholder="例如：某某大酒店"
                  onInput={(e) => updateField('location', e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>详细地址</Text>
                <Input
                  className={styles.formInput}
                  value={invitationData.address}
                  placeholder="例如：北京市朝阳区建国路88号"
                  onInput={(e) => updateField('address', e.detail.value)}
                />
              </View>
              <View className={styles.mapCoordRow}>
                <View className={styles.mapCoordItem}>
                  <Text className={styles.formLabel}>纬度</Text>
                  <Input
                    className={styles.formInput}
                    type="digit"
                    value={String(invitationData.mapLat || '')}
                    placeholder="39.9042"
                    onInput={(e) => updateField('mapLat', parseFloat(e.detail.value) || 0)}
                  />
                </View>
                <View className={styles.mapCoordItem}>
                  <Text className={styles.formLabel}>经度</Text>
                  <Input
                    className={styles.formInput}
                    type="digit"
                    value={String(invitationData.mapLng || '')}
                    placeholder="116.4074"
                    onInput={(e) => updateField('mapLng', parseFloat(e.detail.value) || 0)}
                  />
                </View>
              </View>
              <View className={styles.selectMapBtn} style={{ background: bgColorLighter, color: colorTheme }}>
                <Text>📍</Text>
                <Text>在地图中选择位置</Text>
              </View>
              <Text className={styles.demoLabel}>
                提示：设置经纬度后，宾客点击地点可跳转到地图导航
              </Text>
            </View>
          )}

          {activePanel === 'countdown' && (
            <View>
              <View className={styles.switchRow}>
                <Text className={styles.switchLabel}>开启倒计时</Text>
                <Switch
                  checked={invitationData.countdownEnabled}
                  onChange={(e) => updateField('countdownEnabled', e.detail.value)}
                  color={colorTheme}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>目标日期</Text>
                <Input
                  className={styles.formInput}
                  value={invitationData.date}
                  placeholder="例如：2026-10-01"
                  onInput={(e) => updateField('date', e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>目标时间</Text>
                <Input
                  className={styles.formInput}
                  value={invitationData.time}
                  placeholder="例如：12:00"
                  onInput={(e) => updateField('time', e.detail.value)}
                />
              </View>
              {invitationData.countdownEnabled && (
                <View style={{ padding: 24, background: bgColorLighter, borderRadius: 12, textAlign: 'center' }}>
                  <Text style={{ fontSize: 24, color: '#86909c', marginBottom: 12 }}>预览效果</Text>
                  <Text style={{ fontSize: 32, fontWeight: 'bold', color: colorTheme }}>
                    {countdown.days}天 {countdown.hours}时 {countdown.minutes}分 {countdown.seconds}秒
                  </Text>
                </View>
              )}
            </View>
          )}

          {activePanel === 'schedule' && (
            <View>
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
