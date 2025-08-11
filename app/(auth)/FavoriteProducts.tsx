import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { BASE_URL } from '../src/config';
import { useAuth } from '../src/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type Product = {
  _id: string;
  name: string;
  image: string;
  price: number;
  brand?: string;
};

export default function FavoriteProducts() {
  const { token } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    if (!token) {
      Alert.alert('Bạn cần đăng nhập', 'Vui lòng đăng nhập để xem danh sách yêu thích');
      router.push('/(auth)/LoginScreen');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/wishlists/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data?.products || [];
      setProducts(list);
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message || 'Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [token]);

  const removeItem = async (productId: string) => {
    try {
      await axios.delete(`${BASE_URL}/api/wishlists/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message || 'Không thể xoá');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}> 
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header giống trang Đơn hàng */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Yêu thích</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#777', marginTop: 20 }}>Chưa có sản phẩm yêu thích</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/ProductDetail?id=${item._id}`)}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.price}>{item.price?.toLocaleString()}đ</Text>
            </View>
            <TouchableOpacity onPress={() => removeItem(item._id)} style={styles.removeBtn}>
              <Text style={{ color: '#e00' }}>Xoá</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: '10%',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
    gap: 10,
  },
  image: { width: 70, height: 70, borderRadius: 6, backgroundColor: '#f3f3f3' },
  name: { fontWeight: '600', marginBottom: 4 },
  price: { color: 'red' },
  removeBtn: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#f2caca', borderRadius: 6 },
});


