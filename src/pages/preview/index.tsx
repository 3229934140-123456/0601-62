import React, { useState, useEffect } from 'react';
import { View, Text, Image, Input, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useEditorStore } from '@/store/editorStore';
import { getCountdown, lightenColor } from '@/utils';

type PhoneType = 'small' | 'normal' | 'large';

const phoneOptions: { key: PhoneType; label: string }[] = [
  { key: 'small', label: '小屏' },
  { key: 'normal', label: '标准' },
  { key: 'large', label: '大屏' },
];

const PreviewPage: React.FC = () => {
  const { invitationData, updateInvitation } = useEditorStore();
  const [phoneType, setPhoneType] = useState<PhoneType>('normal');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPasswordVerify, setShowPasswordVerify] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showLongImage, setShowLongImage] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const colorTheme = invitationData.colorTheme;
  const lightThemeColor = lightenColor(colorTheme, 40);

  useEffect(() => {
    if (invitationData.passwordEnabled && !passwordVerified) {
      setShowPasswordVerify(true);
    }
  }, []);

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
      setShowLongImage(true);
    }, 800);
  };

  const handleSaveLongImage = () => {
    Taro.showToast({ title: '长图已保存到相册', icon: 'success' });
  };

  const handlePrint = () => {
    console.log('[Preview] Print invitation');
    Taro.navigateTo({
      url: `/pages/order-detail/index?title=${encodeURIComponent(invitationData.title)}&cover=${encodeURIComponent(invitationData.coverImage)}&type=print`,
    });
  };

  const handlePasswordToggle = (enabled: boolean) => {
    if (enabled) {
      setShowPasswordModal(true);
    } else {
      updateInvitation({ passwordEnabled: false, password: '' });
      Taro.showToast({ title: '已关闭访问口令', icon: 'success' });
    }
  };

  const handlePasswordSet = () => {
    if (!passwordInput) {
      Taro.showToast({ title: '请输入口令', icon: 'none' });
      return;
    }
    updateInvitation({ passwordEnabled: true, password: passwordInput });
    setShowPasswordModal(false);
    setPasswordInput('');
    Taro.showToast({ title: '口令已设置', icon: 'success' });
  };

  const handlePasswordVerify = () => {
    if (passwordInput === invitationData.password) {
      setShowPasswordVerify(false);
      setPasswordVerified(true);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('口令错误，请重新输入');
    }
  };

  const phoneScale = phoneType === 'small' ? 0.85 : phoneType === 'large' ? 1.15 : 1;

  const canViewContent = !invitationData.passwordEnabled || passwordVerified;

  return (
    <View className={styles.page}>
      <View className={styles.phoneFrame}>
        <View className={styles.phone} style={{ transform: `scale(${phoneScale})` }}>
          <View className={styles.phoneHeader} />
          <View className={styles.phoneContent}>
            {canViewContent ? (
              <>
                <View className={styles.coverSection}>
                  {invitationData.musicName && (
                    <View className={styles.musicBadge}>
                      <Text>🎵</Text>
                      <Text>{invitationData.musicName}</Text>
                    </View>
                  )}
                  <Image
                    className={styles.coverImage}
                    src={invitationData.coverImage}
                    mode="aspectFill"
                    onError={(e) => console.error('[Preview] Cover error:', e)}
                  />
                  <View className={styles.coverOverlay}>
                    <Text className={styles.coverTitle} style={{ color: colorTheme }}>
                      {invitationData.title}
                    </Text>
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
                  {invitationData.countdownEnabled && (
                    <View className={styles.countdownBox}>
                      <Text className={styles.countdownLabel}>距离婚礼还有</Text>
                      <View className={styles.countdownNumbers}>
                        <View
                          className={styles.countdownItem}
                          style={{ background: `linear-gradient(135deg, ${colorTheme} 0%, ${lightThemeColor} 100%)` }}
                        >
                          <Text className={styles.countdownNum}>{countdown.days}</Text>
                          <Text className={styles.countdownUnit}>天</Text>
                        </View>
                        <View
                          className={styles.countdownItem}
                          style={{ background: `linear-gradient(135deg, ${colorTheme} 0%, ${lightThemeColor} 100%)` }}
                        >
                          <Text className={styles.countdownNum}>{countdown.hours}</Text>
                          <Text className={styles.countdownUnit}>时</Text>
                        </View>
                        <View
                          className={styles.countdownItem}
                          style={{ background: `linear-gradient(135deg, ${colorTheme} 0%, ${lightThemeColor} 100%)` }}
                        >
                          <Text className={styles.countdownNum}>{countdown.minutes}</Text>
                          <Text className={styles.countdownUnit}>分</Text>
                        </View>
                        <View
                          className={styles.countdownItem}
                          style={{ background: `linear-gradient(135deg, ${colorTheme} 0%, ${lightThemeColor} 100%)` }}
                        >
                          <Text className={styles.countdownNum}>{countdown.seconds}</Text>
                          <Text className={styles.countdownUnit}>秒</Text>
                        </View>
                      </View>
                    </View>
                  )}

                  <Text className={styles.sectionTitle} style={{ color: colorTheme }}>婚礼流程</Text>
                  <View className={styles.scheduleList} style={{ borderLeftColor: lightThemeColor }}>
                    {invitationData.schedule.slice(0, 3).map((item, index) => (
                      <View key={index} className={styles.scheduleItem}>
                        <Text
                          className={styles.scheduleTime}
                          style={{ color: colorTheme }}
                        >
                          {item.time}
                        </Text>
                        <Text className={styles.scheduleTitle}>{item.title}</Text>
                      </View>
                    ))}
                  </View>

                  <View
                    style={{
                      marginTop: 24,
                      padding: 16,
                      background: lightenColor(colorTheme, 85),
                      borderRadius: 12,
                      textAlign: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 28, fontWeight: 600, color: colorTheme }}>
                      {invitationData.location}
                    </Text>
                    <Text style={{ fontSize: 24, color: '#86909c', marginTop: 8 }}>
                      {invitationData.address}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 600 }}>
                <Text style={{ color: '#c9cdd4', fontSize: 28 }}>请输入访问口令查看内容</Text>
              </View>
            )}
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
        <View className={styles.actionBtn} onClick={() => handlePasswordToggle(!invitationData.passwordEnabled)}>
          <Text className={styles.actionIcon}>🔒</Text>
          <Text className={styles.actionText}>
            {invitationData.passwordEnabled ? '已加密' : '访问口令'}
          </Text>
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
            <Text className={styles.passwordDesc}>设置后访客需要输入口令才能查看邀请函</Text>
            <Input
              className={styles.passwordInput}
              placeholder="请输入访问口令"
              value={passwordInput}
              onInput={(e) => {
                setPasswordInput(e.detail.value);
                setPasswordError('');
              }}
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
                onClick={handlePasswordSet}
              >
                <Text>确定</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showPasswordVerify && (
        <View className={styles.passwordModal}>
          <View className={styles.passwordContent}>
            <Text className={styles.passwordTitle}>请输入访问口令</Text>
            <Text className={styles.passwordDesc}>该邀请函已设置访问口令</Text>
            {passwordError && <Text className={styles.passwordError}>{passwordError}</Text>}
            <Input
              className={styles.passwordInput}
              placeholder="请输入访问口令"
              value={passwordInput}
              onInput={(e) => {
                setPasswordInput(e.detail.value);
                setPasswordError('');
              }}
              maxLength={20}
              password
            />
            <View className={styles.passwordBtns}>
              <View
                className={classnames(styles.passwordBtn, styles.cancel)}
                onClick={() => Taro.navigateBack()}
              >
                <Text>返回</Text>
              </View>
              <View
                className={classnames(styles.passwordBtn, styles.confirm)}
                onClick={handlePasswordVerify}
              >
                <Text>确定</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showLongImage && (
        <View className={styles.longImageModal}>
          <View className={styles.longImageHeader}>
            <Text className={styles.longImageTitle}>长图预览</Text>
            <Text className={styles.longImageClose} onClick={() => setShowLongImage(false)}>×</Text>
          </View>
          <View className={styles.longImageContent}>
            <View className={styles.longImageCard}>
              <View className={styles.longImageCover}>
                <Image
                  className={styles.longImageCoverImg}
                  src={invitationData.coverImage}
                  mode="aspectFill"
                />
                <View className={styles.longImageCoverOverlay}>
                  <Text className={styles.longImageTitleText} style={{ color: colorTheme }}>
                    {invitationData.title}
                  </Text>
                  <Text className={styles.longImageSubtitle}>{invitationData.subtitle}</Text>
                  <Text className={styles.longImageNames}>
                    {invitationData.groomName} & {invitationData.brideName}
                  </Text>
                </View>
              </View>

              <View className={styles.longImageBody}>
                {invitationData.countdownEnabled && (
                  <View className={styles.longImageSection}>
                    <Text className={styles.longImageSectionTitle} style={{ color: colorTheme }}>
                      倒计时
                    </Text>
                    <View style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                      {[
                        { num: countdown.days, label: '天' },
                        { num: countdown.hours, label: '时' },
                        { num: countdown.minutes, label: '分' },
                        { num: countdown.seconds, label: '秒' },
                      ].map((item, i) => (
                        <View
                          key={i}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 8,
                            background: `linear-gradient(135deg, ${colorTheme} 0%, ${lightThemeColor} 100%)`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                          }}
                        >
                          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{item.num}</Text>
                          <Text style={{ fontSize: 18 }}>{item.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View className={styles.longImageSection}>
                  <Text className={styles.longImageSectionTitle} style={{ color: colorTheme }}>
                    婚礼流程
                  </Text>
                  <View className={styles.longImageSchedule}>
                    {invitationData.schedule.map((item, index) => (
                      <View key={index} className={styles.longImageScheduleItem}>
                        <View
                          style={{
                            position: 'absolute',
                            left: -36,
                            top: 8,
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: colorTheme,
                          }}
                        />
                        <Text
                          className={styles.longImageScheduleTime}
                          style={{ color: colorTheme }}
                        >
                          {item.time}
                        </Text>
                        <Text className={styles.longImageScheduleTitle}>{item.title}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className={styles.longImageSection}>
                  <Text className={styles.longImageSectionTitle} style={{ color: colorTheme }}>
                    婚礼地点
                  </Text>
                  <View className={styles.longImageLocation}>
                    <Text className={styles.longImageLocationName}>
                      {invitationData.location}
                    </Text>
                    <Text className={styles.longImageLocationAddr}>
                      {invitationData.address}
                    </Text>
                  </View>
                </View>
              </View>

              <View className={styles.longImageFooter}>
                <View className={styles.longImageQrCode}>
                  <Text>📱</Text>
                </View>
                <Text className={styles.longImageScanText}>扫码查看电子邀请函</Text>
              </View>
            </View>
          </View>
          <View className={styles.longImageActionBar}>
            <View
              className={classnames(styles.longImageActionBtn, styles.share)}
              onClick={() => Taro.showToast({ title: '分享功能开发中', icon: 'none' })}
            >
              <Text>分享好友</Text>
            </View>
            <View
              className={classnames(styles.longImageActionBtn, styles.save)}
              onClick={handleSaveLongImage}
            >
              <Text>保存图片</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PreviewPage;
