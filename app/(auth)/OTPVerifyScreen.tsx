import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../src/AuthContext'; // 👈 Sử dụng context
import axios from 'axios';
import { AxiosError } from 'axios';
import { BASE_URL } from '../src/config';

export default function OTPVerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const { pendingRegister, setPendingRegister } = useAuth(); // 👈 Lấy từ context

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      return Alert.alert("Lỗi", "OTP phải đủ 6 chữ số");
    }

    if (!pendingRegister || pendingRegister.email !== email) {
      return Alert.alert("Lỗi", "Thông tin đăng ký không hợp lệ");
    }

    try {
      setLoading(true);

      await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        email,
        otp,
        full_name: pendingRegister.name,
        password: pendingRegister.password,
      });

      setPendingRegister(null); // 👈 Xoá pendingRegister sau khi xong

      Alert.alert("Thành công", "Xác minh thành công. Vui lòng đăng nhập.");
      router.replace('/(auth)/LoginScreen');

    } catch (err) {
      const error = err as AxiosError<any>;
      const msg = error.response?.data?.message || 'Xác minh thất bại';
      Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác minh OTP</Text>
      <Text style={styles.subTitle}>
        Nhập mã xác minh đã gửi đến email: {email}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Mã OTP (6 chữ số)"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: otp.length === 6 ? '#2e5ae1' : '#ccc' }]}
        onPress={handleVerify}
        disabled={loading || otp.length !== 6}
      >
        <Text style={styles.buttonText}>
          {loading ? "Đang xác minh..." : "Xác minh"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subTitle: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 13,
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
