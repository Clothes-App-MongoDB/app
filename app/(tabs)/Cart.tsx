import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,

} from 'react-native';
import { useCart } from '../src/CartContext';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';

export default function Cart() {
  const { cart, setCart } = useCart();
  const [selectedItems, setSelectedItems] = useState<boolean[]>(cart.map(() => false));
  const [selectAll, setSelectAll] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const toggleSelectAll = () => {
    const newState = !selectAll;
    setSelectAll(newState);
    setSelectedItems(cart.map(() => newState));
  };
  const hasSelected = selectedItems.some(selected => selected);
  const toggleSelectItem = (index: number) => {
    const updated = [...selectedItems];
    updated[index] = !updated[index];
    setSelectedItems(updated);
    setSelectAll(updated.every((v) => v));
  };

  const deleteSelected = () => {
    Alert.alert(
      "Xác nhận xoá",
      "Bạn có chắc chắn muốn xoá những sản phẩm đã chọn?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: () => {
            const filtered = cart.filter((_, index) => !selectedItems[index]);
            setCart(filtered);
            setSelectedItems(filtered.map(() => false));
            setSelectAll(false);
          }
        }
      ]
    );
  };

  const deleteAll = () => {
    Alert.alert(
      "Xác nhận xoá tất cả",
      "Bạn có chắc chắn muốn xoá toàn bộ giỏ hàng?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xoá hết",
          style: "destructive",
          onPress: () => {
            setCart([]);
            setSelectedItems([]);
            setSelectAll(false);
          }
        }
      ]
    );
  };
  const increaseQuantity = (index: number) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity += 1;
    setCart(updatedCart);
  };


  const decreaseQuantity = (index: number) => {
    const updatedCart = [...cart];
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
      setCart(updatedCart);
    } else {
      // Optionally: xóa sản phẩm luôn nếu về 0
      Alert.alert(
        'Xóa sản phẩm',
        'Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: () => {
              const newCart = updatedCart.filter((_, i) => i !== index);
              setCart(newCart);
              setSelectedItems(newCart.map(() => false));
              setSelectAll(false);
            },
          },
        ]
      );
    }
  };
  const handleCheckout = () => {
    const selected = cart.filter((_, index) => selectedItems[index]);

    if (selected.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
      return;
    }

    setLoading(true);

    // Điều hướng, rồi tắt loading sau một khoảng delay nhỏ (an toàn UX)
    router.push({
      pathname: '/(auth)/PaymentScreen',
      params: {
        items: JSON.stringify(selected),
      },
    });

    // Tắt loading sau khi điều hướng (đợi 300ms để tránh nhấp nháy)
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };


  const total = cart.reduce((sum, item, index) => {
    return selectedItems[index] ? sum + item.price * item.quantity : sum;
  }, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24}  />
        </TouchableOpacity>
        <Text style={styles.title}>Giỏ Hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Select All Bar */}
      <View style={styles.selectBar}>
        <Checkbox value={selectAll} onValueChange={toggleSelectAll} />
        <Text style={{ marginLeft: 8 }}>Chọn Tất Cả ({selectedItems.filter(x => x).length}/{cart.length})</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={deleteAll}>
          <Text disabled={!hasSelected} style={styles.deleteText}>Xóa Tất Cả</Text>
        </TouchableOpacity>
        <Text style={styles.separator}> | </Text>
        <TouchableOpacity onPress={deleteSelected}>
          <Text disabled={!hasSelected} style={styles.deleteText}>Xóa Mục Đã Chọn</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      {cart.length === 0 ? (
        <View style={{ padding: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#888' }}>Giỏ hàng của bạn đang trống.</Text>
        </View>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item, index) => item.productId + index}
          renderItem={({ item, index }) => (
            <View style={styles.item}>
              <Checkbox
                value={selectedItems[index]}
                onValueChange={() => toggleSelectItem(index)}
                style={{ marginRight: 10 }}
              />
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.itemInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text>{`${item.color} | Size: ${item.size}`}</Text>
                <Text style={styles.price}>{item.price.toLocaleString()}₫</Text>

                {/* Quantity */}
                <View style={styles.quantityContainer}>
                  <TouchableOpacity style={styles.qButton} onPress={() => decreaseQuantity(index)}>
                    <Text>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qButton} onPress={() => increaseQuantity(index)}>
                    <Text>+</Text>
                  </TouchableOpacity>
                </View>


              </View>
            </View>
          )}
        />)}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.totalText}>Tổng: {total.toLocaleString()}₫</Text>
        <TouchableOpacity
          style={[styles.checkoutButton, loading && { opacity: 0.5 }]}
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkoutText}>Thanh toán</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
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

  selectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  deleteText: { color: '#ff4d4f', fontSize: 13 },
  separator: { color: '#aaa', marginHorizontal: 6 },

  item: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  price: { color: '#e53935', fontWeight: 'bold', marginTop: 4 },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  qButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#eee',
    borderRadius: 4,
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
  },

  footer: {
    padding: 16,
    paddingBottom: '25%',
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'right',
  },
  checkoutButton: {
    backgroundColor: '#ff4081',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
