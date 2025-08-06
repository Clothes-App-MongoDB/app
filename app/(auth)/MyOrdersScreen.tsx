import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../src/config';
import { useAuth } from '../src/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { socket } from '../src/socket';

interface OrderItem {
  product_id: string;
  name: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  createdAt: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
}

const tabs = [
  { label: 'Chờ xác nhận', value: 'pending' },
  { label: 'Đã xác nhận', value: 'confirmed' },
  { label: 'Đang lấy hàng', value: 'processing' },
  { label: 'Đang giao hàng', value: 'shipping' },
  { label: 'Đã giao', value: 'delivered' },
  { label: 'Đã hủy', value: 'cancelled' },
];


export default function MyOrdersScreen() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
      socket.connect();

      socket.on('order_status_updated', (data) => {
        console.log('🔁 Đơn hàng cập nhật qua socket:', data);
        setLoading(true); 
        fetchOrders(); // Gọi lại API để cập nhật UI
      });

      return () => {
        socket.off('order_status_updated');
        socket.disconnect();
      };
    }
  }, [token]);


  const filteredOrders = orders.filter((order) => order.status === selectedTab);

  if (loading)
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#000" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Đơn Hàng</Text>
        <View style={{ width: 24 }} />
      </View>
      {/* Tabs */}
      <View style={styles.tabs}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            width: '150%',

          }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              style={[
                styles.tabItem,
                selectedTab === tab.value && styles.activeTabItem,
              ]}
              onPress={() => setSelectedTab(tab.value)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.value && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}</ScrollView>
      </View>

      {filteredOrders.length === 0 ? (
        <Text style={{ margin: 20 }}>Không có đơn hàng nào.</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const firstItem = item.items[0];
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: '/(auth)/OrderDetailScreen',
                    params: { orderId: item._id },
                  })
                }
              >
                <View style={styles.row}>
                  <Image source={{ uri: firstItem.image }} style={styles.image} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text numberOfLines={1} style={styles.name}>
                      {firstItem.name}
                    </Text>
                    <Text style={styles.variant}>
                      Phân loại: {firstItem.color} {firstItem.size}
                    </Text>
                    <Text style={styles.price}>
                      {(firstItem.price).toLocaleString()}₫ x{firstItem.quantity}
                    </Text>
                  </View>
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.date}>
                    Sản phẩm sẽ được chuyển đi trước{' '}
                    {new Date(new Date(item.createdAt).getTime() + 3 * 86400000)
                      .toLocaleDateString('vi-VN')}
                  </Text>
                  <Text style={[styles.status, getStatusStyle(item.status)]}>
                    {getStatusLabel(item.status)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Chờ xác nhận';
    case 'confirmed': return 'Đã xác nhận';
    case 'processing': return 'Đang lấy hàng';
    case 'shipping': return 'Đang giao hàng';
    case 'delivered': return 'Đã giao';
    case 'cancelled': return 'Đã hủy đơn';
    default: return status;
  }
};


const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending': return { color: '#e2e90c' };     // đỏ
    case 'confirmed': return { color: '#e90c9f' };   // cam
    case 'processing': return { color: '#3b82f6' };  // cam đậm
    case 'shipping': return { color: '#0ea5e9' };     // xanh dương
    case 'delivered': return { color: '#10b981' };    // xanh lá
    case 'cancelled': return { color: '#ef4444' };    // xám
    default: return { color: '#444' };
  }
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 10,


  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: '1%',
    marginRight: '1%',

  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabText: { color: '#666', fontSize: 14 },
  activeTabText: { color: '#000', fontWeight: 'bold' },
  card: {
    marginHorizontal: 10,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  image: { width: 70, height: 70, borderRadius: 6, backgroundColor: '#f2f2f2' },
  name: { fontWeight: '500', fontSize: 15, marginBottom: 2 },
  variant: { fontSize: 13, color: '#777' },
  price: { marginTop: 4, fontSize: 14, fontWeight: 'bold' },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  date: { fontSize: 10, color: '#888' },
  status: { fontSize: 13, fontWeight: 'bold' },
});
