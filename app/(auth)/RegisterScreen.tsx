import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/AuthContext'; // sử dụng AuthContext thay vì axios trực tiếp

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth(); // Lấy hàm register từ context

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Lỗi', 'Mật khẩu nhập lại không khớp');
    }

    try {
      await register(fullName, email, password); // Gọi API từ context
      Alert.alert('Thành công', 'Đã gửi mã OTP đến email');

      router.push({
        pathname: '/(auth)/OTPVerifyScreen',
        params: { email },
      });
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Đăng ký thất bại');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace('/(auth)/Register_LoginScreen')}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ĐĂNG KÝ</Text>
      </View>

      {/* Nội dung */}
      <View style={styles.content}>
        <Text style={styles.label}>Họ tên</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập họ tên"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Mật khẩu</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Nhập mật khẩu"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nhập lại mật khẩu</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                fullName && email && password && confirmPassword
                  ? '#2e5ae1'
                  : '#ccc',
            },
          ]}
          onPress={handleRegister}
          disabled={!fullName || !email || !password || !confirmPassword}
        >
          <Text style={styles.buttonText}>Gửi mã OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ================= STYLES ================= //
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#f66',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: { padding: 20 },
  label: {
    marginTop: 15,
    color: '#555',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 13,
    marginTop: 5,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    marginTop: 5,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  passwordInput: {
    flex: 1,
  },
  button: {
    padding: 15,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
