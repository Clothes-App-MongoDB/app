import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons, AntDesign } from '@expo/vector-icons';
// import axios from 'axios';
// import { AxiosError } from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { BASE_URL } from '../src/config';
import { useAuth } from '../src/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const { login } = useAuth(); // gọi hàm từ context

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu.');
    }

    try {
      await login(email, password); // 👈 dùng context login
      Alert.alert('Thành công', 'Đăng nhập thành công!');
      router.replace('/(tabs)/Home'); // hoặc tab chính
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ĐĂNG NHẬP</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.logo}>MazonePoly</Text>
        <Text style={styles.title}>XIN CHÀO,</Text>
        <Text style={styles.sub}>Vui lòng nhập email và mật khẩu để tiếp tục</Text>

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
            style={{ flex: 1 }}
            placeholder="Nhập mật khẩu"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: email && password ? '#000' : '#ccc' }]}
          disabled={!email || !password}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Tiếp tục</Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>
          Bạn chưa có tài khoản?{' '}
          <Text
            style={styles.registerLink}
            onPress={() => router.push('/(auth)/RegisterScreen')}
          >
            Đăng ký
          </Text>
        </Text>

        <View style={styles.separator}>
          <View style={styles.line} />
          <Text style={styles.or}>Hoặc</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.googleButton}>
          <AntDesign name="google" size={24} color="#EA4335" style={{ marginRight: 8 }} />
          <Text>Tiếp tục với Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#f66',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  content: { padding: 20 },
  logo: { color: '#2e5ae1', fontSize: 18, fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  sub: { color: '#555', marginBottom: 20 },
  label: { marginTop: 20, color: '#555', fontWeight: 'bold' },
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
    padding: 3,
    justifyContent: 'space-between',
  },
  button: {
    padding: 15,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  registerText: { textAlign: 'center', marginTop: 20 },
  registerLink: { color: '#2e5ae1', fontWeight: 'bold' },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  or: {
    marginHorizontal: 10,
    color: '#999',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  }
});
