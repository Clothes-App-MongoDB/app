
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logoManzone.png')} style={styles.logo} />
      <Text style={styles.title}>Khám phá phong cách của bạn một cách dễ dàng.</Text>
      <Text style={styles.title2}>Thời trang nam cung cấp vô số lựa chọn—từ giản dị đến sang trọng. Luôn tự tin, luôn phong cách.</Text>
      <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/LoginScreen')}>
        <Text style={styles.btnText}>Đăng Nhập</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnOutline} onPress={() => router.push('/RegisterScreen')}>
        <Text style={styles.btnOutlineText}>Đăng Ký</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logo: { width: 320, height: 220, marginBottom: 0 },
  title: { fontSize: 18, textAlign: 'center', marginBottom: 30, fontWeight:'bold' },
  title2: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  btnPrimary: {
    backgroundColor: '#0039e6', paddingVertical: 12,
    paddingHorizontal: 40, borderRadius: 30, marginBottom: 10,
  },
  btnText: { color: '#fff', fontSize: 16 },
  btnOutline: {
    borderWidth: 1, borderColor: '#0039e6',
    paddingVertical: 12, paddingHorizontal: 40, borderRadius: 30,
  },
  btnOutlineText: { color: '#0039e6', paddingHorizontal: 8, fontSize: 16 },
});
