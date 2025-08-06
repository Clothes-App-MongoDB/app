import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { BASE_URL } from '../src/config';
import { useAuth } from '../src/AuthContext';
import { Ionicons } from '@expo/vector-icons';


export default function EditAddressScreen() {
  const { id: addressId } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    province: '',
    district: '',
    ward: '',
    street: '',
    delivery_time: '',
    address_type: 'home', // 'home' | 'company'
    is_default: false,
    is_pickup: false,
    is_return: false,
  });

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/addresses/${addressId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(res.data);
      } catch (err) {
        console.error('Lỗi khi tải địa chỉ:', err);
        Alert.alert('Lỗi', 'Không thể tải địa chỉ');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (addressId && token) {
      fetchAddress();
    }
  }, [addressId, token]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axios.put(`${BASE_URL}/api/addresses/${addressId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Thành công', 'Cập nhật địa chỉ thành công');
      router.back();
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật địa chỉ');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = () => {
    Alert.alert(
      'Xác nhận xoá',
      'Bạn có chắc muốn xoá địa chỉ này không?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/api/addresses/${addressId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert('Đã xoá địa chỉ');
              router.back();
            } catch (error) {
              console.error('Lỗi xoá địa chỉ:', error);
              Alert.alert('Lỗi', 'Không thể xoá địa chỉ. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={{ height: '100%' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={'#fff'} />
        </TouchableOpacity>
        <Text style={styles.title}>Sửa địa chỉ</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 450, }}>


        <Field label="Họ và tên">
          <TextInput
            style={styles.input}
            value={formData.full_name}
            onChangeText={(text) => handleChange('full_name', text)}
          />
        </Field>

        <Field label="Số điện thoại">
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={formData.phone_number}
            onChangeText={(text) => handleChange('phone_number', text)}
          />
        </Field>

        <Field label="Tỉnh/Thành phố">
          <TextInput
            style={styles.input}
            value={formData.province}
            onChangeText={(text) => handleChange('province', text)}
          />
        </Field>

        <Field label="Quận/Huyện">
          <TextInput
            style={styles.input}
            value={formData.district}
            onChangeText={(text) => handleChange('district', text)}
          />
        </Field>

        <Field label="Phường/Xã">
          <TextInput
            style={styles.input}
            value={formData.ward}
            onChangeText={(text) => handleChange('ward', text)}
          />
        </Field>

        <Field label="Địa chỉ cụ thể">
          <TextInput
            style={styles.input}
            placeholder="Số nhà, tên đường, khu vực..."
            value={formData.street}
            onChangeText={(text) => handleChange('street', text)}
          />
        </Field>




        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={saving}>
          <Text style={styles.saveButtonText}>
            {saving ? 'Đang lưu...' : 'Cập nhật địa chỉ'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAddress}>
          <Text style={styles.deleteButtonText}>Xoá địa chỉ</Text>
        </TouchableOpacity>
      </ScrollView></View>
  );
}

// ========== Subcomponents ==========

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);



// ========== Styles ==========

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '6%',
    paddingVertical: '9%',
    backgroundColor: '#f66060ff',
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,

  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: '1%',
    color: 'white'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#e91e63',
    backgroundColor: '#fce4ec',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#000',
  },
  typeButtonTextActive: {
    color: '#e91e63',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#e91e63',
    fontSize: 14,
    fontWeight: '600',
  },
});
