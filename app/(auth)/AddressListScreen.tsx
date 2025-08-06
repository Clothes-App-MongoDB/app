import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { BASE_URL } from '../src/config';
import { useAuth } from '../src/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface Address {
    _id: string;
    full_name: string;
    phone_number: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    is_default: boolean;
}

export default function AddressListScreen() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const router = useRouter();
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const params = useLocalSearchParams();
    let selectedItems: any[] = [];
    try {
        const raw = Array.isArray(params.items) ? params.items[0] : params.items;
        selectedItems = raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Lỗi parse selectedItems:", e);
    }




    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/api/addresses`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Cache-Control': 'no-cache',
                },
            });
            setAddresses(res.data);
            const defaultAddr = res.data.find((item: Address) => item.is_default);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr._id);
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Lỗi', 'Không thể lấy danh sách địa chỉ.');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (token) {
                fetchAddresses();
            }
        }, [token])
    );

    const handleConfirm = async () => {
        const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);

        if (!selectedAddress) {
            Alert.alert('Thông báo', 'Vui lòng chọn một địa chỉ.');
            return;
        }

        setLoading(true);

        try {
            // Nếu address hiện tại chưa phải là mặc định, thì mới gọi API cập nhật
            if (!selectedAddress.is_default) {
                await axios.put(
                    `${BASE_URL}/api/addresses/${selectedAddress._id}/set-default`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            }

            // Điều hướng sang PaymentScreen kèm dữ liệu
            router.push({
                pathname: '/(auth)/PaymentScreen',
                params: {
                    full_name: selectedAddress.full_name,
                    phone_number: selectedAddress.phone_number,
                    street: selectedAddress.street,
                    ward: selectedAddress.ward,
                    district: selectedAddress.district,
                    province: selectedAddress.province,
                    items: JSON.stringify(selectedItems),
                },
            });
        } catch (error: any) {
            console.error("Lỗi cập nhật địa chỉ mặc định", error);
            const message =
                error.response?.data?.message ||
                "Không thể đặt địa chỉ mặc định. Vui lòng thử lại.";
            Alert.alert("Lỗi", message);
        }
        finally {
            setLoading(false);
        }
    };





    const renderAddress = ({ item }: { item: Address }) => (
        
        
        <View style={styles.card}>
            
            <View style={styles.row}>
                <Ionicons name="home-outline" size={18} color="#000" />
                <Text style={styles.label}>Địa chỉ</Text>
                {item.is_default && (
                    <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Mặc định</Text>
                    </View>
                )}

                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => setSelectedAddressId(item._id)}>
                    <View style={item._id === selectedAddressId ? styles.radioSelected : styles.radioUnselected} />
                </TouchableOpacity>

            </View>

            <Text style={styles.name}>{item.full_name} - {item.phone_number}</Text>
            <Text style={styles.text}>
                {item.street}, {item.ward}, {item.district}, {item.province}, VN
            </Text>
            <Text style={styles.deliveryTime}>Thời gian giao hàng: Tất cả các ngày trong tuần</Text>

            <TouchableOpacity
                style={styles.editIcon}
                onPress={() => router.push({ pathname: '/(auth)/EditAddressScreen', params: { id: item._id } })}
            >
                <Ionicons name="pencil" size={18} color="#333" />
            </TouchableOpacity>
            
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            
            {addresses.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chưa có địa chỉ nào</Text>
                </View>
            ) : (
                
                <FlatList
                    data={addresses}
                    keyExtractor={(item) => item._id}
                    renderItem={renderAddress}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(auth)/NewAddressScreen')}
            >
                <Text style={styles.addText}>Thêm địa chỉ mới +</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                    <Text style={styles.confirmText}>Xác nhận</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: '10%' },
    header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: '#e91e63',
},
headerTitle: {
  color: '#fff',
  fontSize: 18,
  fontWeight: 'bold',
},

    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
        position: 'relative',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 6,
    },
    defaultTag: {
        fontSize: 13,
        color: '#888',
        fontStyle: 'italic',
        marginLeft: 6,
    },
    name: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
    },
    text: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    deliveryTime: {
        fontSize: 13,
        color: '#888',
        marginTop: 4,
    },
    editIcon: {
        position: 'absolute',
        right: 16,
        bottom: 16,
    },
    radioSelected: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#e91e63',
        backgroundColor: '#e91e63',
    },
    radioUnselected: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#ccc',
        backgroundColor: '#fff',
    },
    addButton: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginTop: 12,
        padding: '5%'
    },
    addText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e91e63',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
    footer: {
        backgroundColor: '#e91e63',
        paddingVertical: 14,
        paddingBottom: '13%',
    },
    confirmButton: {
        alignItems: 'center',
    },
    confirmText: {
        color: '#ffffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    defaultBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: '2%',
        
        alignSelf: 'flex-start',
    },
    defaultBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },

});
