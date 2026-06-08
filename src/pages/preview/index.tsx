import React, { useState, useEffect } from 'react';
import { View, Text, Image, Input, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useEditorStore } from '@/store/editorStore';
import { getCountdown } from '@/utils';

type PhoneType = 'small' | 'normal' | 'large';

const phoneOptions: { key: PhoneType; label: string }[] = [
  { key: 'small', label: '小屏' },
  { key: 'normal', label: '标准' },
  { key: 'large', label: '大屏' },
];

const PreviewPage: React.FC = () => {
  const { invitationData } = useEditorStore();
  const [phoneType, setPhoneType] = useState<PhoneType>('normal');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!invitationData.countdownEnabled) return;
    const targetDate = `${invitationData.date} ${invitationData.time}`;
    const timer = setInterval(() => {
      setCountdown(getCountdown(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [invitationData.date, invitationData.time, invitationData.countdownEnabled]);

  const handleShare = () => {
    console.log('[Preview] Share invitation');
    Taro.showShareMenu({
      withShareTicket: true,
    });
    Taro.showToast({ title: '请点击右上角分享', icon: 'none' });
  };

  const handleExportImage = () => {
    console.log('[Preview] Export long image');
    Taro.showLoading({ title: '生成中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '长图已保存到相册', icon: 'success' });
    }, 1500);
  };

  const handlePrint = () => {
    console.log('[Preview] Print invitation');
    Taro.showModal({
      title: '打印小卡',
      content: '精美打印服务，支持多种材质和工艺',
      confirmText: '去下单',
      success: (res) => {
        if (res.confirm) {
          Taro.switchTab({ url: '/pages/orders/index' });
        }
      },
    });
  };

  const handlePasswordToggle = (enabled: boolean) => {
    setPasswordEnabled(enabled);
    if (enabled) {
      setShowPasswordModal(true);
    }
  };

  const handlePasswordConfirm = () => {
    if (!password) {
      Taro.showToast({ title: '请输入口令', icon: 'none' });
      return;
    }
    console.log('[Preview] Password set:', password);
    setShowPasswordModal(false);
    Taro.showToast({ title: '口令已设置', icon: 'success' });
  };

  const phoneScale = phoneType === 'small' ? 0.85 : phoneType === 'large' ? 1.15 : 1;

  return (
    <View className={styles.page}>
      <View className={styles.phoneFrame}>
        <View className={styles.phone} style={{ transform: `scale(${phoneScale})` }}>
          <View className={styles.phoneHeader} />
          <View className={styles.phoneContent}>
            <View className={styles.coverSection}>
              <Image
                className={styles.coverImage}
                src={invitationData.coverImage}
                mode="aspectFill"
                onError={(e) => console.error('[Preview] Cover error:', e)}
              />
              <View className={styles.coverOverlay}>
                <Text className={styles.coverTitle}>{invitationData.title}</Text>
                <Text className={styles.names}>
                  {invitationData.groomName} & {invitationData.brideName}
                </Text>
              </View>
              <View className={styles.dateInfo}>
                <Text>
                  {invitationData.date} {invitationData.time}
                </Text>
              </View>
            </View>
            <View className={styles.phoneBody}>
              <Text className={styles.sectionTitle}>婚礼流程</Text>
              <View className={styles.scheduleList}>
                {invitationData.schedule.slice(0, 3).map((item, index) => (
                  <View key={index} className={styles.scheduleItem}>
                    <Text className={styles.scheduleTime}>{item.time}</Text>
                    <Text className={styles.scheduleTitle}>{item.title}</Text>
                  </View>
                ))}
              </View>
              {invitationData.countdownEnabled && (
                <View style={{ marginTop: '24rpx', textAlign: 'center' }}>
                  <Text style={{ fontSize: '24rpx', color: '#86909c' }}>
                    倒计时 {countdown.days}天{countdown.hours}时{countdown.minutes}分
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.phoneSelector}>
        {phoneOptions.map((opt) => (
          <View
            key={opt.key}
            className={classnames(styles.phoneOption, phoneType === opt.key && styles.active)}
            onClick={() => setPhoneType(opt.key)}
          >
            <View className={classnames(styles.phoneIcon, styles[opt.key])} />
            <Text className={styles.phoneName}>{opt.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.actionBar}>
        <View className={styles.actionBtn} onClick={() => handlePasswordToggle(!passwordEnabled)}>
          <Text className={styles.actionIcon}>🔒</Text>
          <Text className={styles.actionText}>访问口令</Text>
        </View>
        <View className={styles.actionBtn} onClick={handleExportImage}>
          <Text className={styles.actionIcon}>🖼️</Text>
          <Text className={styles.actionText}>导出长图</Text>
        </View>
        <View className={styles.actionBtn} onClick={handlePrint}>
          <Text className={styles.actionIcon}>🖨️</Text>
          <Text className={styles.actionText}>打印小卡</Text>
        </View>
        <View className={styles.shareBtn} onClick={handleShare}>
          <Text>分享给好友</Text>
        </View>
      </View>

      {showPasswordModal && (
        <View className={styles.passwordModal} onClick={() => setShowPasswordModal(false)}>
          <View className={styles.passwordContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.passwordTitle}>设置访问口令</Text>
            <Input
              className={styles.passwordInput}
              placeholder="请输入访问口令"
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
              maxLength={20}
            />
            <View className={styles.passwordBtns}>
              <View
                className={classnames(styles.passwordBtn, styles.cancel)}
                onClick={() => setShowPasswordModal(false)}
              >
                <Text>取消</Text>
              </View>
              <View
                className={classnames(styles.passwordBtn, styles.confirm)}
                onClick={handlePasswordConfirm}
              >
                <Text>确定</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PreviewPage;
