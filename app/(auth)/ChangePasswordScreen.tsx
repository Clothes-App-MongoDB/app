import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../src/config';
import { useAuth } from '../src/AuthContext';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { token, setToken } = useAuth(); // 👈 Thêm setToken

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert('Thông báo', 'Mật khẩu mới và xác nhận không khớp');
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `${BASE_URL}/api/users/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newToken = res.data.token;
      if (newToken) {
        setToken(newToken); // 👈 Cập nhật token mới vào context
      }

      Alert.alert('Thành công', res.data.message || 'Đổi mật khẩu thành công');
      router.back();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Đổi mật khẩu thất bại';
      Alert.alert('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerText}>ĐỔI MẬT KHẨU</Text>
      </View>

      <View style={styles.container1}>
        <Text style={styles.title}>NHẬP THÔNG TIN CỦA BẠN</Text>
        <Text style={styles.subtitle}>Vui lòng nhập mật khẩu để xác nhận</Text>

        <TextInput
          placeholder="Mật khẩu cũ"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
          style={styles.input}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Mật khẩu mới"
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.inputInner}
          />
          <TouchableOpacity onPress={() => setShowNew(!showNew)}>
            <Ionicons name={showNew ? 'eye-off' : 'eye'} size={22} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Xác nhận mật khẩu mới"
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.inputInner}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={22} color="#888" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { backgroundColor: '#ccc' }]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container1: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
  },
  headerBar: {
    backgroundColor: '#FF4D4D',
    paddingVertical: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 24,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  inputInner: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  button: {
    backgroundColor: '#1877F2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
