import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function SelectPaymentMethodScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'vnpay'>('cash');

 const {
  returnTo,
  full_name,
  phone_number,
  street,
  ward,
  district,
  province,
  items,
} = useLocalSearchParams<{
  returnTo?: string;
  full_name?: string;
  phone_number?: string;
  street?: string;
  ward?: string;
  district?: string;
  province?: string;
  items?: string;
}>();

const handleConfirm = () => {
  router.push({
    pathname: (returnTo || '/(auth)/PaymentScreen') as any,
    params: {
      paymentMethod: selectedMethod,
      full_name,
      phone_number,
      street,
      ward,
      district,
      province,
      items,
    },
  });
};


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Phương thức thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Chọn phương thức */}
      <Text style={styles.subtitle}>Chọn phương thức thanh toán</Text>

      <TouchableOpacity
        style={styles.option}
        onPress={() => setSelectedMethod('cash')}
      >
        <Ionicons
          name={selectedMethod === 'cash' ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color="#f33"
        />
        <Ionicons name="wallet" size={20} color="#555" style={styles.icon} />
        <Text style={styles.optionText}>Tiền mặt</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => setSelectedMethod('vnpay')}
      >
        <Ionicons
          name={selectedMethod === 'vnpay' ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color="#f33"
        />
        <Ionicons name="logo-card" size={20} color="#0a7cff" style={styles.icon} />
        <Text style={styles.optionText}>VNPay</Text>
      </TouchableOpacity>

      {/* Nút xác nhận */}
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Đồng ý</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginBottom: 20 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  icon: { marginHorizontal: 12 },
  optionText: { fontSize: 16 },
  confirmButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#d62828',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
