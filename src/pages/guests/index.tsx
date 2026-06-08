import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import GuestItem from '@/components/GuestItem';
import { useGuestStore, selectGuestStats, selectGroupStats } from '@/store/guestStore';
import type { Guest } from '@/types/guest';

const defaultGroups = ['亲戚', '朋友', '同事', '同学', '其他'];

const GuestsPage: React.FC = () => {
  const guests = useGuestStore((state) => state.guests);
  const addGuest = useGuestStore((state) => state.addGuest);
  const addGuests = useGuestStore((state) => state.addGuests);
  const updateGuest = useGuestStore((state) => state.updateGuest);
  const deleteGuest = useGuestStore((state) => state.deleteGuest);
  const updateRsvp = useGuestStore((state) => state.updateRsvp);
  const updateGuestsCount = useGuestStore((state) => state.updateGuestsCount);
  const generateTitle = useGuestStore((state) => state.generateTitle);
  const hydrate = useGuestStore((state) => state.hydrate);
  const stats = useGuestStore(selectGuestStats);
  const groupStats = useGuestStore(selectGroupStats);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const [activeGroup, setActiveGroup] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [importText, setImportText] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    group: '朋友',
    title: '',
    guestsCount: 1,
    gender: 'male' as 'male' | 'female',
  });

  const guestGroups = useMemo(() => {
    const groupList = [
      { key: 'all', label: '全部', count: guests.length },
    ];
    defaultGroups.forEach((g) => {
      if (groupStats[g]) {
        groupList.push({ key: g, label: g, count: groupStats[g].count });
      }
    });
    Object.keys(groupStats).forEach((g) => {
      if (!defaultGroups.includes(g)) {
        groupList.push({ key: g, label: g, count: groupStats[g].count });
      }
    });
    return groupList;
  }, [guests, groupStats]);

  const filteredGuests = useMemo(() => {
    if (activeGroup === 'all') return guests;
    return guests.filter((g) => g.group === activeGroup);
  }, [guests, activeGroup]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      phone: '',
      group: '朋友',
      title: '',
      guestsCount: 1,
      gender: 'male',
    });
  }, []);

  const handleAddGuest = () => {
    resetForm();
    setShowActionSheet(false);
    setShowAddModal(true);
  };

  const handleImportGuest = () => {
    setImportText('');
    setShowActionSheet(false);
    setShowImportModal(true);
  };

  const handleGenerateTitle = () => {
    if (!formData.name.trim()) {
      Taro.showToast({ title: '请先输入姓名', icon: 'none' });
      return;
    }
    const title = generateTitle(formData.name, formData.gender);
    setFormData({ ...formData, title });
    Taro.showToast({ title: '称呼已生成', icon: 'success' });
  };

  const handleSubmitAdd = () => {
    if (!formData.name.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    addGuest({
      name: formData.name.trim(),
      phone: formData.phone,
      group: formData.group,
      title: formData.title || generateTitle(formData.name, formData.gender),
      guestsCount: formData.guestsCount,
      rsvpStatus: 'pending',
    });
    setShowAddModal(false);
    Taro.showToast({ title: '添加成功', icon: 'success' });
  };

  const parseImportText = (text: string): Omit<Guest, 'id' | 'createdAt'>[] => {
    const lines = text.trim().split('\n').filter((line) => line.trim());
    const result: Omit<Guest, 'id' | 'createdAt'>[] = [];

    lines.forEach((line) => {
      const parts = line.split(/[,，\t]+/).map((s) => s.trim()).filter(Boolean);
      if (parts.length === 0) return;

      let name = '';
      let phone = '';
      let group = '朋友';
      let count = 1;

      const phoneRegex = /^1[3-9]\d{9}$/;
      const numberRegex = /^\d+$/;
      const commonGroups = [...defaultGroups, '男方亲友', '女方亲友', '家人', '领导'];

      let nonPhoneNonNumber: string[] = [];
      let foundPhone = false;
      let foundNumber = false;
      let foundGroup = false;

      parts.forEach((part) => {
        if (!foundPhone && phoneRegex.test(part)) {
          phone = part;
          foundPhone = true;
        } else if (!foundNumber && numberRegex.test(part) && parseInt(part) <= 10) {
          count = parseInt(part);
          foundNumber = true;
        } else if (!foundGroup && commonGroups.includes(part)) {
          group = part;
          foundGroup = true;
        } else if (!name) {
          name = part;
        } else {
          nonPhoneNonNumber.push(part);
        }
      });

      if (!name && nonPhoneNonNumber.length > 0) {
        name = nonPhoneNonNumber[0];
      }

      if (name) {
        result.push({
          name,
          phone,
          group,
          guestsCount: count,
          rsvpStatus: 'pending',
          title: `${name}先生/女士`,
        });
      }
    });

    return result;
  };

  const handleParseImport = () => {
    if (!importText.trim()) {
      Taro.showToast({ title: '请粘贴宾客信息', icon: 'none' });
      return;
    }

    const parsedGuests = parseImportText(importText);

    if (parsedGuests.length === 0) {
      Taro.showToast({ title: '未解析到有效数据', icon: 'none' });
      return;
    }

    addGuests(parsedGuests);
    setShowImportModal(false);
    Taro.showToast({ title: `成功导入${parsedGuests.length}人`, icon: 'success' });
  };

  const handleGuestClick = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowDetailModal(true);
  };

  const handleUpdateRsvp = (status: 'confirmed' | 'declined' | 'pending') => {
    if (!selectedGuest) return;
    updateRsvp(selectedGuest.id, status);
    const updatedGuest = guests.find((g) => g.id === selectedGuest.id);
    if (updatedGuest) {
      setSelectedGuest(updatedGuest);
    }
    const statusText = status === 'confirmed' ? '已确认参加' : status === 'declined' ? '已婉拒' : '待回复';
    Taro.showToast({ title: statusText, icon: 'success' });
  };

  const handleUpdateCount = (delta: number) => {
    if (!selectedGuest) return;
    const newCount = Math.max(1, selectedGuest.guestsCount + delta);
    updateGuestsCount(selectedGuest.id, newCount);
    const updatedGuest = guests.find((g) => g.id === selectedGuest.id);
    if (updatedGuest) {
      setSelectedGuest(updatedGuest);
    }
  };

  const handleDeleteGuest = () => {
    if (!selectedGuest) return;
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除宾客「${selectedGuest.name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          deleteGuest(selectedGuest.id);
          setShowDetailModal(false);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      },
    });
  };

  const handlePreviewWithGuest = () => {
    if (!selectedGuest) return;
    setShowDetailModal(false);
    Taro.navigateTo({
      url: `/pages/preview/index?guestId=${selectedGuest.id}`,
    });
  };

  const handleExport = () => {
    console.log('[Guests] Export guests');
    Taro.showToast({ title: '导出成功', icon: 'success' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <View className={styles.page}>
      <View className={styles.statsBar}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{stats.total}</Text>
          <Text className={styles.statLabel}>总人数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statNum, styles.statConfirmed)}>{stats.confirmed}</Text>
          <Text className={styles.statLabel}>已确认</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statNum, styles.statPending)}>{stats.pending}</Text>
          <Text className={styles.statLabel}>待回复</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={classnames(styles.statNum, styles.statDeclined)}>{stats.totalPeople}</Text>
          <Text className={styles.statLabel}>出席人数</Text>
        </View>
      </View>

      <ScrollView scrollX className={styles.groupTabs} enhanced showScrollbar={false}>
        {guestGroups.map((group) => (
          <View
            key={group.key}
            className={classnames(styles.groupTab, activeGroup === group.key && styles.active)}
            onClick={() => setActiveGroup(group.key)}
          >
            <Text>{group.label} ({group.count})</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY className={styles.listContent}>
        <View className={styles.guestList}>
          {filteredGuests.map((guest) => (
            <GuestItem key={guest.id} guest={guest} onClick={() => handleGuestClick(guest)} />
          ))}
          {filteredGuests.length === 0 && (
            <View style={{ padding: 80, textAlign: 'center', color: '#c9cdd4' }}>
              <Text style={{ fontSize: 60 }}>📭</Text>
              <Text style={{ marginTop: 16, display: 'block', fontSize: 26 }}>暂无宾客</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={classnames(styles.btn, styles.secondary)} onClick={handleExport}>
          <Text>导出名单</Text>
        </View>
        <View className={classnames(styles.btn, styles.primary)} onClick={() => setShowActionSheet(true)}>
          <Text>添加宾客</Text>
        </View>
      </View>

      {showActionSheet && (
        <View className={styles.actionSheet} onClick={() => setShowActionSheet(false)}>
          <View className={styles.actionSheetContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.actionItem} onClick={handleAddGuest}>
              <Text>手动添加</Text>
            </View>
            <View className={styles.actionItem} onClick={handleImportGuest}>
              <Text>批量导入（粘贴）</Text>
            </View>
            <View className={classnames(styles.actionItem, styles.actionCancel)} onClick={() => setShowActionSheet(false)}>
              <Text>取消</Text>
            </View>
          </View>
        </View>
      )}

      {showAddModal && (
        <View className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>添加宾客</Text>
              <Text className={styles.modalClose} onClick={() => setShowAddModal(false)}>×</Text>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>姓名 *</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入姓名"
                value={formData.name}
                onInput={(e) => handleInputChange('name', e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>称呼</Text>
              <View className={styles.selectRow}>
                {['male', 'female'].map((g) => (
                  <View
                    key={g}
                    className={classnames(styles.selectOption, formData.gender === g && styles.active)}
                    onClick={() => setFormData({ ...formData, gender: g as 'male' | 'female' })}
                  >
                    <Text>{g === 'male' ? '先生' : '女士'}</Text>
                  </View>
                ))}
                <View className={styles.selectOption} onClick={handleGenerateTitle}>
                  <Text>生成称呼</Text>
                </View>
              </View>
              <Input
                className={styles.formInput}
                placeholder="自动生成或手动输入"
                value={formData.title}
                style={{ marginTop: 16 }}
                onInput={(e) => handleInputChange('title', e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>手机号</Text>
              <Input
                className={styles.formInput}
                type="number"
                placeholder="请输入手机号（选填）"
                value={formData.phone}
                onInput={(e) => handleInputChange('phone', e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>分组</Text>
              <View className={styles.selectRow}>
                {defaultGroups.map((g) => (
                  <View
                    key={g}
                    className={classnames(styles.selectOption, formData.group === g && styles.active)}
                    onClick={() => setFormData({ ...formData, group: g })}
                  >
                    <Text>{g}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>出席人数</Text>
              <View className={styles.countControl}>
                <View
                  className={styles.countBtn}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      guestsCount: Math.max(1, formData.guestsCount - 1),
                    })
                  }
                >
                  <Text>-</Text>
                </View>
                <Text className={styles.countNum}>{formData.guestsCount}</Text>
                <View
                  className={styles.countBtn}
                  onClick={() =>
                    setFormData({ ...formData, guestsCount: formData.guestsCount + 1 })
                  }
                >
                  <Text>+</Text>
                </View>
              </View>
              <Text className={styles.countLabel}>含本人</Text>
            </View>

            <View className={styles.modalBtn} onClick={handleSubmitAdd}>
              <Text>确认添加</Text>
            </View>
          </View>
        </View>
      )}

      {showImportModal && (
        <View className={styles.modalOverlay} onClick={() => setShowImportModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>批量导入</Text>
              <Text className={styles.modalClose} onClick={() => setShowImportModal(false)}>×</Text>
            </View>

            <View className={styles.importHint}>
              <Text className={styles.importHintTitle}>格式说明</Text>
              <Text className={styles.importHintText}>
                每行一位宾客，用逗号或制表符分隔，顺序随意
              </Text>
              <Text className={styles.importHintCode}>
                张三,13800138000,朋友,2
              </Text>
              <Text className={styles.importHintCode}>
                李四,同事,1
              </Text>
              <Text className={styles.importHintCode}>
                王五,亲戚,3
              </Text>
              <Text className={styles.importHintText} style={{ marginTop: 8 }}>
                手机号、分组、人数为选填，系统会自动识别
              </Text>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>粘贴宾客信息</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="张三,13800138000,朋友,2
李四,同事,1
王五,亲戚,3
赵六"
                value={importText}
                onInput={(e) => setImportText(e.detail.value)}
                autoHeight
                maxlength={2000}
              />
            </View>

            <View className={styles.modalBtn} onClick={handleParseImport}>
              <Text>开始导入</Text>
            </View>
          </View>
        </View>
      )}

      {showDetailModal && selectedGuest && (
        <View className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>宾客详情</Text>
              <Text className={styles.modalClose} onClick={() => setShowDetailModal(false)}>×</Text>
            </View>

            <View className={styles.detailSection}>
              <Text className={styles.detailLabel}>姓名</Text>
              <Text className={styles.detailValue}>{selectedGuest.name}</Text>
            </View>

            <View className={styles.detailSection}>
              <Text className={styles.detailLabel}>称呼</Text>
              <Text className={styles.detailValue}>{selectedGuest.title}</Text>
            </View>

            <View className={styles.detailSection}>
              <Text className={styles.detailLabel}>手机号</Text>
              <Text className={styles.detailValue}>{selectedGuest.phone || '未填写'}</Text>
            </View>

            <View className={styles.detailSection}>
              <Text className={styles.detailLabel}>分组</Text>
              <Text className={styles.detailValue}>{selectedGuest.group}</Text>
            </View>

            <View className={styles.detailSection}>
              <Text className={styles.detailLabel}>出席人数</Text>
              <View className={styles.countControl}>
                <View className={styles.countBtn} onClick={() => handleUpdateCount(-1)}>
                  <Text>-</Text>
                </View>
                <Text className={styles.countNum}>{selectedGuest.guestsCount}</Text>
                <View className={styles.countBtn} onClick={() => handleUpdateCount(1)}>
                  <Text>+</Text>
                </View>
              </View>
            </View>

            <View className={styles.rsvpActions}>
              <View
                className={classnames(styles.rsvpBtn, styles.confirm)}
                onClick={() => handleUpdateRsvp('confirmed')}
              >
                <Text>确认参加</Text>
              </View>
              <View
                className={classnames(styles.rsvpBtn, styles.decline)}
                onClick={() => handleUpdateRsvp('declined')}
              >
                <Text>婉拒</Text>
              </View>
              <View
                className={classnames(styles.rsvpBtn, styles.pending)}
                onClick={() => handleUpdateRsvp('pending')}
              >
                <Text>待回复</Text>
              </View>
            </View>

            <View
              className={styles.modalBtn}
              style={{ marginTop: 24 }}
              onClick={handlePreviewWithGuest}
            >
              <Text>预览专属邀请函</Text>
            </View>

            <View
              className={classnames(styles.modalBtn)}
              style={{
                marginTop: 16,
                background: '#fff',
                color: '#ff4d6d',
                border: '2rpx solid #ff4d6d',
              }}
              onClick={handleDeleteGuest}
            >
              <Text>删除宾客</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default GuestsPage;
