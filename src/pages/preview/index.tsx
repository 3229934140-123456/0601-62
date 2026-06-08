import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useEditorStore } from '@/store/editorStore';
import { useGuestStore } from '@/store/guestStore';
import { getCountdown, lightenColor } from '@/utils';
import { wishList } from '@/data/wishes';

type PhoneType = 'small' | 'normal' | 'large';
type ViewMode = 'admin' | 'visitor';

const phoneOptions: { key: PhoneType; label: string }[] = [
  { key: 'small', label: '小屏' },
  { key: 'normal', label: '标准' },
  { key: 'large', label: '大屏' },
];

const PreviewPage: React.FC = () => {
  const { invitationData, updateField, hydrate, verifyPassword, passwordVerified } = useEditorStore();
  const guests = useGuestStore((state) => state.guests);
  const guestHydrate = useGuestStore((state) => state.hydrate);
  const getDisplayTitle = useGuestStore((state) => state.getDisplayTitle);
  const updateRsvp = useGuestStore((state) => state.updateRsvp);
  const incrementViewCount = useGuestStore((state) => state.incrementViewCount);
  const generateInviteLink = useGuestStore((state) => state.generateInviteLink);
  const router = Taro.useRouter();
  const guestId = router.params.guestId;
  const modeParam = router.params.mode as ViewMode | undefined;

  const [phoneType, setPhoneType] = useState<PhoneType>('normal');
  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPasswordVerify, setShowPasswordVerify] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showLongImage, setShowLongImage] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hydrated, setHydrated] = useState(false);
  const [wishInput, setWishInput] = useState('');
  const [wishes, setWishes] = useState(wishList.slice(0, 4));
  const [rsvpStatus, setRsvpStatus] = useState<'confirmed' | 'declined' | 'pending' | null>(null);
  const [guestCount, setGuestCount] = useState(1);

  useEffect(() => {
    hydrate();
    guestHydrate();
    setHydrated(true);
    if (modeParam === 'visitor') {
      setViewMode('visitor');
    }
  }, [hydrate, guestHydrate, modeParam]);

  const colorTheme = invitationData.colorTheme;
  const lightThemeColor = lightenColor(colorTheme, 40);

  const currentGuest = useMemo(() => {
    if (!guestId) return null;
    return guests.find((g) => g.id === guestId) || null;
  }, [guestId, guests]);

  const greetingText = useMemo(() => {
    if (currentGuest) {
      return `尊敬的 ${getDisplayTitle(currentGuest)}`;
    }
    return '';
  }, [currentGuest, getDisplayTitle]);

  useEffect(() => {
    if (currentGuest && viewMode === 'visitor' && hydrated && passwordVerified) {
      incrementViewCount(currentGuest.id);
    }
  }, [currentGuest, viewMode, hydrated, passwordVerified, incrementViewCount]);

  useEffect(() => {
    if (currentGuest) {
      setRsvpStatus(currentGuest.rsvpStatus);
      setGuestCount(currentGuest.guestsCount || 1);
    }
  }, [currentGuest]);

  useEffect(() => {
    if (invitationData.passwordEnabled && !passwordVerified && viewMode === 'visitor') {
      setShowPasswordVerify(true);
    } else {
      setShowPasswordVerify(false);
    }
  }, [invitationData.passwordEnabled, passwordVerified, viewMode]);

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

  const handleCopyLink = () => {
    if (!currentGuest) {
      Taro.showToast({ title: '请选择宾客', icon: 'none' });
      return;
    }
    const link = generateInviteLink(currentGuest.id);
    Taro.setClipboardData({
      data: link,
      success: () => {
        Taro.showToast({ title: '链接已复制', icon: 'success' });
      },
    });
  };

  const handlePasswordToggle = () => {
    if (!invitationData.passwordEnabled) {
      setPasswordInput('');
      setPasswordError('');
      setShowPasswordModal(true);
    } else if (passwordVerified) {
      Taro.showModal({
        title: '关闭访问口令',
        content: '确定要关闭访问口令吗？关闭后任何人都可以直接查看邀请函',
        success: (res) => {
          if (res.confirm) {
            updateField('passwordEnabled', false);
            updateField('password', '');
            Taro.showToast({ title: '已关闭访问口令', icon: 'success' });
          }
        },
      });
    } else {
      setPasswordInput('');
      setPasswordError('');
      setShowPasswordVerify(true);
    }
  };

  const handlePasswordSet = () => {
    if (!passwordInput.trim()) {
      Taro.showToast({ title: '请输入口令', icon: 'none' });
      return;
    }
    updateField('passwordEnabled', true);
    updateField('password', passwordInput.trim());
    verifyPassword();
    setShowPasswordModal(false);
    setPasswordInput('');
    Taro.showToast({ title: '口令已设置', icon: 'success' });
  };

  const handlePasswordVerify = () => {
    if (passwordInput === invitationData.password) {
      verifyPassword();
      setShowPasswordVerify(false);
      setPasswordInput('');
      setPasswordError('');
    } else {
      setPasswordError('口令错误，请重新输入');
    }
  };

  const handleRsvp = (status: 'confirmed' | 'declined') => {
    if (currentGuest) {
      updateRsvp(currentGuest.id, status);
      setRsvpStatus(status);
      const text = status === 'confirmed' ? '已确认参加' : '已婉拒';
      Taro.showToast({ title: text, icon: 'success' });
    } else {
      setRsvpStatus(status);
      const text = status === 'confirmed' ? '已确认参加' : '已婉拒';
      Taro.showToast({ title: text, icon: 'success' });
    }
  };

  const handleGuestCountChange = (delta: number) => {
    const newCount = Math.max(1, guestCount + delta);
    setGuestCount(newCount);
  };

  const handleSubmitWish = () => {
    if (!wishInput.trim()) {
      Taro.showToast({ title: '请输入祝福内容', icon: 'none' });
      return;
    }
    const newWish = {
      id: Date.now().toString(),
      name: currentGuest ? currentGuest.name : '匿名好友',
      avatar: 'https://picsum.photos/seed/avatar/100/100',
      content: wishInput,
      createdAt: '刚刚',
    };
    setWishes([newWish, ...wishes]);
    setWishInput('');
    Taro.showToast({ title: '祝福已发送', icon: 'success' });
  };

  const handleMapNav = () => {
    if (invitationData.mapLat && invitationData.mapLng) {
      Taro.openLocation({
        latitude: invitationData.mapLat,
        longitude: invitationData.mapLng,
        name: invitationData.location,
        address: invitationData.address,
        scale: 16,
      });
    } else {
      Taro.showToast({ title: '暂未设置地点', icon: 'none' });
    }
  };

  const phoneScale = phoneType === 'small' ? 0.85 : phoneType === 'large' ? 1.15 : 1;

  const canViewContent = viewMode === 'admin' || !invitationData.passwordEnabled || passwordVerified;

  const InvitationContent = () => (
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
          {greetingText && (
            <Text style={{ fontSize: 24, marginBottom: 12, opacity: 0.9 }}>
              {greetingText}
            </Text>
          )}
          <Text className={styles.coverTitle} style={{ color: colorTheme }}>
            {invitationData.title}
          </Text>
          <Text className={styles.names}>
            {invitationData.groomName} &amp; {invitationData.brideName}
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
              {[
                { num: countdown.days, label: '天' },
                { num: countdown.hours, label: '时' },
                { num: countdown.minutes, label: '分' },
                { num: countdown.seconds, label: '秒' },
              ].map((item, i) => (
                <View
                  key={i}
                  className={styles.countdownItem}
                  style={{ background: `linear-gradient(135deg, ${colorTheme} 0%, ${lightThemeColor} 100%)` }}
                >
                  <Text className={styles.countdownNum}>{item.num}</Text>
                  <Text className={styles.countdownUnit}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text className={styles.sectionTitle} style={{ color: colorTheme }}>婚礼流程</Text>
        <View className={styles.scheduleList}>
          {invitationData.schedule.slice(0, 3).map((item, index) => (
            <View key={index} className={styles.scheduleItem}>
              <View
                style={{
                  position: 'absolute',
                  left: -34,
                  top: 6,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: colorTheme,
                }}
              />
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

        {viewMode === 'visitor' && (
          <>
            <View className={styles.rsvpSection}>
              <Text className={styles.sectionTitle} style={{ color: colorTheme }}>
                出席确认
              </Text>
              {rsvpStatus && rsvpStatus !== 'pending' ? (
                <View className={styles.rsvpResult}>
                  <Text style={{ fontSize: 28, color: rsvpStatus === 'confirmed' ? '#00b42a' : '#ff4d4f' }}>
                    {rsvpStatus === 'confirmed' ? '✅ 您已确认参加' : '❌ 您已婉拒'}
                  </Text>
                  {rsvpStatus === 'confirmed' && (
                    <View style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                      <Text style={{ fontSize: 24, color: '#86909c' }}>出席人数：</Text>
                      <View className={styles.countSelector}>
                        <View className={styles.countBtn} onClick={() => handleGuestCountChange(-1)}>
                          <Text>-</Text>
                        </View>
                        <Text className={styles.countNum}>{guestCount}</Text>
                        <View className={styles.countBtn} onClick={() => handleGuestCountChange(1)}>
                          <Text>+</Text>
                        </View>
                      </View>
                    </View>
                  )}
                  <View className={styles.rsvpReselect} onClick={() => setRsvpStatus('pending')}>
                    <Text>重新选择</Text>
                  </View>
                </View>
              ) : (
                <View className={styles.rsvpButtons}>
                  <View
                    className={classnames(styles.rsvpBtn, styles.confirm)}
                    style={{ borderColor: colorTheme, color: colorTheme }}
                    onClick={() => handleRsvp('confirmed')}
                  >
                    <Text>确认参加</Text>
                  </View>
                  <View className={classnames(styles.rsvpBtn, styles.decline)} onClick={() => handleRsvp('declined')}>
                    <Text>婉拒</Text>
                  </View>
                </View>
              )}
            </View>

            <View className={styles.wishSection}>
              <Text className={styles.sectionTitle} style={{ color: colorTheme }}>
                祝福留言
              </Text>
              <View className={styles.wishInputBox}>
                <Input
                  className={styles.wishInput}
                  placeholder="写下您的祝福..."
                  value={wishInput}
                  onInput={(e) => setWishInput(e.detail.value)}
                  maxLength={200}
                />
                <View className={styles.wishSendBtn} style={{ background: colorTheme }} onClick={handleSubmitWish}>
                  <Text>发送</Text>
                </View>
              </View>
              <ScrollView scrollY className={styles.wishList}>
                {wishes.map((wish) => (
                  <View key={wish.id} className={styles.wishItem}>
                    <Image className={styles.wishAvatar} src={wish.avatar} mode="aspectFill" />
                    <View className={styles.wishContent}>
                      <View className={styles.wishHeader}>
                        <Text className={styles.wishName}>{wish.name}</Text>
                        <Text className={styles.wishTime}>{wish.createdAt}</Text>
                      </View>
                      <Text className={styles.wishText}>{wish.content}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View className={styles.mapNavSection} onClick={handleMapNav}>
              <View className={styles.mapNavIcon}>📍</View>
              <View style={{ flex: 1 }}>
                <Text className={styles.mapNavTitle} style={{ color: colorTheme }}>
                  {invitationData.location}
                </Text>
                <Text className={styles.mapNavAddr}>{invitationData.address}</Text>
              </View>
              <Text className={styles.mapNavArrow}>→</Text>
            </View>
          </>
        )}
      </View>
    </>
  );

  return (
    <View className={styles.page}>
      {viewMode === 'visitor' && (
        <View className={styles.modeBanner}>
          <Text className={styles.modeBannerText}>访客模式</Text>
        </View>
      )}

      <View className={styles.phoneFrame}>
        <View className={styles.phone} style={{ transform: `scale(${phoneScale})` }}>
          <View className={styles.phoneHeader} />
          <View className={styles.phoneContent}>
            {canViewContent ? (
              <InvitationContent />
            ) : (
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 600 }}>
                <Text style={{ color: '#c9cdd4', fontSize: 28 }}>请输入访问口令查看内容</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {viewMode === 'admin' && canViewContent && (
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
      )}

      {viewMode === 'admin' && canViewContent && (
        <View className={styles.actionBar}>
          <View className={styles.actionBtn} onClick={handlePasswordToggle}>
            <Text className={styles.actionIcon}>{invitationData.passwordEnabled ? '🔒' : '🔓'}</Text>
            <Text className={styles.actionText}>
              {invitationData.passwordEnabled ? '修改口令' : '访问口令'}
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
          <View className={styles.actionBtn} onClick={handleCopyLink}>
            <Text className={styles.actionIcon}>🔗</Text>
            <Text className={styles.actionText}>复制链接</Text>
          </View>
        </View>
      )}

      {viewMode === 'admin' && (
        <View className={styles.modeToggle}>
          <View
            className={classnames(styles.modeTab, viewMode === 'admin' && styles.active)}
            onClick={() => setViewMode('admin')}
          >
            <Text>管理视角</Text>
          </View>
          <View
            className={classnames(styles.modeTab, viewMode === 'visitor' && styles.active)}
            onClick={() => setViewMode('visitor')}
          >
            <Text>访客视角</Text>
          </View>
        </View>
      )}

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
          <ScrollView scrollY className={styles.longImageContent}>
            <View className={styles.longImageCard}>
              <View className={styles.longImageCover}>
                <Image
                  className={styles.longImageCoverImg}
                  src={invitationData.coverImage}
                  mode="aspectFill"
                />
                <View className={styles.longImageCoverOverlay}>
                  {greetingText && (
                    <Text style={{ fontSize: 26, marginBottom: 12, opacity: 0.9 }}>
                      {greetingText}
                    </Text>
                  )}
                  <Text className={styles.longImageTitleText} style={{ color: colorTheme }}>
                    {invitationData.title}
                  </Text>
                  <Text className={styles.longImageSubtitle}>{invitationData.subtitle}</Text>
                  <Text className={styles.longImageNames}>
                    {invitationData.groomName} &amp; {invitationData.brideName}
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
          </ScrollView>
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
