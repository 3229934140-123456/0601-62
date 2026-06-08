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
  const getDisplayTitle = useGuestStore((state) => state.getDisplayTitle);
  const generateInviteLink = useGuestStore((state) => state.generateInviteLink);
  const generateInviteLinks = useGuestStore((state) => state.generateInviteLinks);
  const markInviteSent = useGuestStore((state) => state.markInviteSent);
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
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const allSelected = useMemo(() => {
    return filteredGuests.length > 0 && filteredGuests.every((g) => selectedIds.includes(g.id));
  }, [filteredGuests, selectedIds]);

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

    const phoneRegex = /^1[3-9]\d{9}$/;
    const numberRegex = /^\d+$/;
    const commonGroups = [...defaultGroups, '男方亲友', '女方亲友', '家人', '领导', '朋友', '同事', '同学', '亲戚', '其他'];

    const parseLine = (line: string) => {
      let parts = line.split(/[,，\t]+/).map((s) => s.trim()).filter(Boolean);

      if (parts.length <= 1) {
        const spaceParts = line.trim().split(/\s+/).filter(Boolean);
        if (spaceParts.length > 1) {
          parts = spaceParts;
        }
      }

      if (parts.length === 0) return null;

      let name = '';
      let phone = '';
      let group = '朋友';
      let count = 1;

      let foundPhone = false;
      let foundNumber = false;
      let foundGroup = false;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!foundPhone && phoneRegex.test(part)) {
          phone = part;
          foundPhone = true;
        } else if (!foundNumber && numberRegex.test(part) && parseInt(part) <= 20) {
          count = parseInt(part);
          foundNumber = true;
        } else if (!foundGroup && commonGroups.includes(part)) {
          group = part;
          foundGroup = true;
        } else if (!name) {
          name = part;
        }
      }

      if (name) {
        return {
          name,
          phone,
          group,
          guestsCount: count,
          rsvpStatus: 'pending',
          title: `${name}先生/女士`,
        };
      }
      return null;
    };

    lines.forEach((line) => {
      const segments = line.split(/[、；;]+/).map((s) => s.trim()).filter(Boolean);
      segments.forEach((seg) => {
        const parsed = parseLine(seg);
        if (parsed) {
          result.push(parsed);
        }
      });
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
    if (selectMode) {
      toggleSelect(guest.id);
    } else {
      setSelectedGuest(guest);
      setShowDetailModal(true);
    }
  };

  const handleUpdateRsvp = (status: 'confirmed' | 'declined' | 'pending') => {
    if (!selectedGuest) return;
    updateRsvp(selectedGuest.id, status);
    setSelectedGuest({ ...selectedGuest, rsvpStatus: status });
    const statusText = status === 'confirmed' ? '已确认参加' : status === 'declined' ? '已婉拒' : '待回复';
    Taro.showToast({ title: statusText, icon: 'success' });
  };

  const handleUpdateCount = (delta: number) => {
    if (!selectedGuest) return;
    const newCount = Math.max(1, selectedGuest.guestsCount + delta);
    updateGuestsCount(selectedGuest.id, newCount);
    setSelectedGuest({ ...selectedGuest, guestsCount: newCount });
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

  const handleCopyLink = (guest: Guest) => {
    const link = generateInviteLink(guest.id);
    Taro.setClipboardData({
      data: link,
      success: () => {
        Taro.showToast({ title: '链接已复制', icon: 'success' });
      },
    });
  };

  const handleBatchGenerate = () => {
    if (selectedIds.length === 0) {
      Taro.showToast({ title: '请先选择宾客', icon: 'none' });
      return;
    }
    generateInviteLinks(selectedIds);
    Taro.showToast({ title: `已生成${selectedIds.length}个邀请链接`, icon: 'success' });
    setSelectMode(false);
    setSelectedIds([]);
  };

  const handleBatchSend = () => {
    if (selectedIds.length === 0) {
      Taro.showToast({ title: '请先选择宾客', icon: 'none' });
      return;
    }
    selectedIds.forEach((id) => markInviteSent(id));
    Taro.showToast({ title: `已标记${selectedIds.length}人为已发送`, icon: 'success' });
    setSelectMode(false);
    setSelectedIds([]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredGuests.map((g) => g.id));
    }
  };

  const handleExitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds([]);
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

      <View className={styles.toolbar}>
        {selectMode ? (
          <>
            <View className={styles.selectAll} onClick={toggleSelectAll}>
              <View className={classnames(styles.checkbox, allSelected && styles.checked)}>
                {allSelected && <Text className={styles.checkIcon}>✓</Text>}
              </View>
              <Text className={styles.selectAllText}>全选</Text>
            </View>
            <View style={{ flex: 1, textAlign: 'center' }}>
              <Text style={{ fontSize: 28, color: '#ff6b8b', fontWeight: 600 }}>
                已选 {selectedIds.length} 人
              </Text>
            </View>
            <View className={styles.cancelSelect} onClick={handleExitSelectMode}>
              <Text>取消</Text>
            </View>
          </>
        ) : (
          <>
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
            <View className={styles.selectModeBtn} onClick={() => setSelectMode(true)}>
              <Text>选择</Text>
            </View>
          </>
        )}
      </View>

      {selectMode && (
        <View className={styles.batchBar}>
          <View className={styles.batchBtn} onClick={handleBatchGenerate}>
            <Text>生成链接</Text>
          </View>
          <View className={styles.batchBtn} onClick={handleBatchSend}>
            <Text>标记已发</Text>
          </View>
        </View>
      )}

      <ScrollView scrollY className={styles.listContent}>
        <View className={styles.guestList}>
          {filteredGuests.map((guest) => (
            <View key={guest.id} className={styles.guestItemWrapper}>
              {selectMode && (
                <View className={styles.itemCheckbox} onClick={() => toggleSelect(guest.id)}>
                  <View className={classnames(styles.checkbox, selectedIds.includes(guest.id) && styles.checked)}>
                    {selectedIds.includes(guest.id) && <Text className={styles.checkIcon}>✓</Text>}
                  </View>
                </View>
              )}
              <View style={{ flex: 1 }} onClick={() => handleGuestClick(guest)}>
                <GuestItem guest={guest} onClick={() => handleGuestClick(guest)} />
              </View>
              {!selectMode && guest.inviteLinkGenerated && (
                <View
                  className={classnames(styles.inviteStatus, guest.inviteSent && styles.sent)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyLink(guest);
                  }}
                >
                  <Text className={styles.inviteStatusText}>
                    {guest.inviteSent ? '已发送' : '已生成'}
                  </Text>
                </View>
              )}
            </View>
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
        {selectMode ? (
          <>
            <View className={classnames(styles.btn, styles.secondary)} onClick={handleBatchGenerate}>
              <Text>批量生成链接</Text>
            </View>
            <View className={classnames(styles.btn, styles.primary)} onClick={handleBatchSend}>
              <Text>标记已发送</Text>
            </View>
          </>
        ) : (
          <>
            <View className={classnames(styles.btn, styles.secondary)} onClick={handleExport}>
              <Text>导出名单</Text>
            </View>
            <View className={classnames(styles.btn, styles.primary)} onClick={() => setShowActionSheet(true)}>
              <Text>添加宾客</Text>
            </View>
          </>
        )}
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
                每行一位宾客，用逗号、空格或制表符分隔，顺序随意
              </Text>
              <Text className={styles.importHintCode}>
                张三,13800138000,朋友,2
              </Text>
              <Text className={styles.importHintCode}>
                李四 同事 1
              </Text>
              <Text className={styles.importHintCode}>
                王五 亲戚 3、赵六 朋友 1
              </Text>
              <Text className={styles.importHintText} style={{ marginTop: 8 }}>
                手机号、分组、人数为选填，系统会自动识别；顿号分隔可一行多人
              </Text>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>粘贴宾客信息</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder="张三,13800138000,朋友,2
李四 同事 1
王五 亲戚 3、赵六 朋友 1"
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
              <Text className={styles.detailValue}>{selectedGuest ? getDisplayTitle(selectedGuest) : ''}</Text>
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

            <View className={styles.detailSection}>
              <Text className={styles.detailLabel}>邀请状态</Text>
              <View style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Text className={styles.detailValue}>
                  {selectedGuest.inviteLinkGenerated ? (selectedGuest.inviteSent ? '已发送' : '已生成') : '未生成'}
                </Text>
                {selectedGuest.inviteLinkGenerated && (
                  <Text
                    style={{ fontSize: 24, color: '#ff6b8b', textDecoration: 'underline' }}
                    onClick={() => handleCopyLink(selectedGuest)}
                  >
                    复制链接
                  </Text>
                )}
              </View>
            </View>

            <View className={styles.detailSection}>
              <Text className={styles.detailLabel}>浏览次数</Text>
              <Text className={styles.detailValue}>{selectedGuest.viewCount || 0} 次</Text>
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
