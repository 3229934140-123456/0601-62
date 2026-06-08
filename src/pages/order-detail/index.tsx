import React, { useState } from 'react';
import { View, Text, Image, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

const printOptions = [
  { key: 'standard', label: '标准款', desc: '250g铜版纸', price: 2.5 },
  { key: 'premium', label: '高档款', desc: '300g特种纸', price: 5 },
  { key: 'luxury', label: '奢华款', desc: '珠光纸+烫金', price: 8 },
];

const OrderDetailPage: React.FC = () => {
  const params = Taro.useRouter().params;
  const title = decodeURIComponent(params.title || '婚礼邀请函');
  const cover = decodeURIComponent(params.cover || '');
  const type = params.type || 'print';

  const [selectedSpec, setSelectedSpec] = useState('premium');
  const [quantity, setQuantity] = useState(50);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [address, setAddress] = useState('');

  const currentSpec = printOptions.find((o) => o.key === selectedSpec);
  const totalPrice = (currentSpec?.price || 0) * quantity;

  const handleQuantityChange = (delta: number) => {
    const newQty = Math.max(10, quantity + delta);
    setQuantity(newQty);
  };

  const handleSubmitOrder = () => {
    if (!buyerName.trim()) {
      Taro.showToast({ title: '请输入收货人姓名', icon: 'none' });
      return;
    }
    if (!buyerPhone.trim()) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }
    if (!address.trim()) {
      Taro.showToast({ title: '请输入收货地址', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showModal({
        title: '下单成功',
        content: `您的订单已提交成功！\n共${quantity}张，合计￥${totalPrice.toFixed(2)}`,
        showCancel: false,
        confirmText: '去订单列表',
        success: (res) => {
          if (res.confirm) {
            Taro.switchTab({ url: '/pages/orders/index' });
          }
        },
      });
    }, 1000);
  };

  return (
    <View className={styles.page}>
      <View className={styles.productCard}>
        <Image className={styles.productImg} src={cover} mode="aspectFill" />
        <View className={styles.productInfo}>
          <Text className={styles.productTitle}>{title}</Text>
          <Text className={styles.productSubtitle}>打印小卡 · {currentSpec?.label}</Text>
          <Text className={styles.productPrice}>
            ￥{(currentSpec?.price || 0).toFixed(2)}
            <Text className={styles.priceUnit}> /张</Text>
          </Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择规格</Text>
        <View className={styles.specList}>
          {printOptions.map((opt) => (
            <View
              key={opt.key}
              className={classnames(styles.specItem, selectedSpec === opt.key && styles.active)}
              onClick={() => setSelectedSpec(opt.key)}
            >
              <Text className={styles.specName}>{opt.label}</Text>
              <Text className={styles.specDesc}>{opt.desc}</Text>
              <Text className={styles.specPrice}>￥{opt.price.toFixed(2)}/张</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>购买数量</Text>
        <View className={styles.quantityRow}>
          <Text className={styles.quantityLabel}>数量</Text>
          <View className={styles.quantityControl}>
            <View className={styles.quantityBtn} onClick={() => handleQuantityChange(-10)}>
              <Text>-</Text>
            </View>
            <Text className={styles.quantityNum}>{quantity}</Text>
            <View className={styles.quantityBtn} onClick={() => handleQuantityChange(10)}>
              <Text>+</Text>
            </View>
          </View>
        </View>
        <Text className={styles.quantityHint}>起订量 10 张，每次增减 10 张</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>收货信息</Text>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>收货人</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入姓名"
            value={buyerName}
            onInput={(e) => setBuyerName(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>手机号</Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder="请输入手机号"
            value={buyerPhone}
            onInput={(e) => setBuyerPhone(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>收货地址</Text>
          <Input
            className={styles.formInput}
            placeholder="请输入详细地址"
            value={address}
            onInput={(e) => setAddress(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>费用明细</Text>
        <View className={styles.feeRow}>
          <Text className={styles.feeLabel}>商品金额</Text>
          <Text className={styles.feeValue}>￥{totalPrice.toFixed(2)}</Text>
        </View>
        <View className={styles.feeRow}>
          <Text className={styles.feeLabel}>运费</Text>
          <Text className={styles.feeValue}>￥0.00</Text>
        </View>
        <View className={classnames(styles.feeRow, styles.totalRow)}>
          <Text className={styles.feeLabel}>合计</Text>
          <Text className={styles.totalPrice}>￥{totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.totalBox}>
          <Text className={styles.totalLabel}>合计：</Text>
          <Text className={styles.totalAmount}>￥{totalPrice.toFixed(2)}</Text>
        </View>
        <View className={styles.submitBtn} onClick={handleSubmitOrder}>
          <Text>提交订单</Text>
        </View>
      </View>
    </View>
  );
};

export default OrderDetailPage;
