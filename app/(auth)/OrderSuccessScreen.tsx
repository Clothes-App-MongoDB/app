import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Đặt hàng thành công!</Text>
      <Text style={styles.text}>Mã đơn hàng: {orderId}</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/Home')}>
        <Text style={styles.buttonText}>Về trang chủ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 20 },
  button: { backgroundColor: '#f33', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
