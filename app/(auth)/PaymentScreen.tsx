import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../src/config';
import { useAuth } from '../src/AuthContext';

interface Address {
    _id: string;
    user_id: string;
    full_name: string;
    phone_number: string;
    province: string;
    district: string;
    ward: string;
    street: string;
    is_default: boolean;
}

export default function PaymentScreen() {
    const router = useRouter();
    const { token, user } = useAuth();

    const {
        full_name,
        phone_number,
        street,
        ward,
        district,
        province,
        items,
        paymentMethod: paymentMethodParam,
    } = useLocalSearchParams<{
        full_name?: string;
        phone_number?: string;
        street?: string;
        ward?: string;
        district?: string;
        province?: string;
        items: string;
        paymentMethod?: string;
    }>();

    const selectedItems = JSON.parse(items || '[]');
    const [shippingFee] = useState(12500);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'vnpay'>('cash');
    const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);

    useEffect(() => {
        if (paymentMethodParam && ['cash', 'vnpay'].includes(paymentMethodParam)) {
            setPaymentMethod(paymentMethodParam as 'cash' | 'vnpay');
        }
    }, [paymentMethodParam]);

    useEffect(() => {
        const fetchDefaultAddress = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/addresses/default`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDefaultAddress(res.data);
            } catch (err) {
                console.error('Không lấy được địa chỉ mặc định', err);
            }
        };
        if (token) fetchDefaultAddress();
    }, [token]);

    const productTotal = selectedItems.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
    );
    const total = productTotal + shippingFee;

    const getDeliveryDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 3);
        return `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${today.getFullYear()}`;
    };

    const handleVNPayPayment = async () => {
        try {
            console.log('🚀 Bắt đầu thanh toán VNPay...');
            console.log('📦 Dữ liệu items:', selectedItems);
            console.log('🏠 Địa chỉ:', defaultAddress);
            console.log('💰 Tổng tiền:', total);
            console.log('🔑 Token:', token ? 'Có token' : 'Không có token');

            const orderItems = selectedItems.map((item: any) => ({
                product_id: item.productId,
                name: item.name ?? '',
                image: item.image ?? '',
                color: item.color ?? '',
                size: item.size ?? '',
                quantity: item.quantity ?? 1,
                price: item.price ?? 0,
            }));

            console.log('📋 Order items đã format:', orderItems);

            const orderData = {
                items: orderItems,
                address: defaultAddress ?? {
                    full_name,
                    phone_number,
                    street,
                    ward,
                    district,
                    province,
                },
                shipping_fee: shippingFee,
                total_amount: total,
                payment_method: 'vnpay',
            };

            console.log('📤 Gửi request tạo order VNPay:', orderData);
            console.log('🌐 URL API:', `${BASE_URL}/api/orders/vnpay-order`);

            const orderRes = await axios.post(
                `${BASE_URL}/api/orders/vnpay-order`,
                orderData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('✅ Tạo order thành công:', orderRes.data);
            const order = orderRes.data;

            console.log('🔗 Bắt đầu tạo payment URL VNPay...');
            const paymentData = {
                order_id: order._id,
                total: order.total_amount,
                user_id: order.user_id,
                orderInfo: `Thanh toan don hang ${order._id}`,
                ipAddr: '',
            };

            console.log('📤 Gửi request tạo payment URL:', paymentData);
            console.log('🌐 URL API payment:', `${BASE_URL}/api/payments/create`);

            const paymentRes = await axios.post(
                `${BASE_URL}/api/payments/create`,
                paymentData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('✅ Tạo payment URL thành công:', paymentRes.data);

            if (paymentRes.data && paymentRes.data.paymentUrl) {
                console.log('🔗 Payment URL:', paymentRes.data.paymentUrl);
                let paymentCompleted = false;
                let checkCount = 0;
                const maxChecks = 30;

                const checkPaymentStatus = async () => {
                    try {
                        console.log(`🔍 Check payment status lần ${checkCount + 1}...`);
                        const statusRes = await axios.get(
                            `${BASE_URL}/api/payments/status/${order._id}`,
                            {
                                headers: { Authorization: `Bearer ${token}` },
                            }
                        );
                        console.log('📊 Payment status response:', statusRes.data);
                        
                        if (statusRes.data && statusRes.data.paymentStatus === 'completed') {
                            paymentCompleted = true;
                            console.log('✅ Thanh toán hoàn tất!');
                            alert('Thanh toán thành công!');
                            router.push({ pathname: '/(auth)/OrderSuccessScreen', params: { orderId: order._id } });
                            return;
                        } else if (statusRes.data && statusRes.data.paymentStatus === 'failed') {
                            paymentCompleted = true;
                            console.log('❌ Thanh toán thất bại!');
                            alert('Thanh toán thất bại!');
                            return;
                        }
                                          } catch (error: any) {
                          console.error('❌ Lỗi check payment status:', error);
                          console.error('❌ Error response:', error.response?.data);
                      }
                };

                const pollingInterval = setInterval(async () => {
                    checkCount++;
                    await checkPaymentStatus();
                    if (paymentCompleted || checkCount >= maxChecks) {
                        clearInterval(pollingInterval);
                        if (!paymentCompleted) {
                            console.log('⏰ Hết thời gian check payment status');
                            alert('Không thể xác định trạng thái thanh toán. Vui lòng kiểm tra đơn hàng sau.');
                        }
                    }
                }, 10000);

                console.log('🌐 Mở web browser thanh toán...');
                const result = await require('expo-web-browser').openBrowserAsync(paymentRes.data.paymentUrl);
                console.log('🔚 Web browser result:', result);
                
                clearInterval(pollingInterval);
                await checkPaymentStatus();
            } else {
                console.error('❌ Không nhận được payment URL:', paymentRes.data);
                alert('Không lấy được link thanh toán VNPay!');
            }
        } catch (error: any) {
            console.error('❌ Lỗi thanh toán VNPay:', error);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error headers:', error.response?.headers);
            alert(`Có lỗi xảy ra khi thanh toán VNPay: ${error.message}`);
        }
    };

    const handleCashPayment = async () => {
        try {
            const orderItems = selectedItems.map((item: any) => {
                if (!item.productId || !item.color || !item.size || !item.quantity || !item.price) {
                    console.warn('❌ Lỗi dữ liệu item:', item);
                }

                return {
                    product_id: item.productId, 
                    name: item.name ?? '',
                    image: item.image ?? '',
                    color: item.color ?? '',
                    size: item.size ?? '',
                    quantity: item.quantity ?? 1,
                    price: item.price ?? 0,
                };
            });

            console.log("✅ orderItems gửi lên:", orderItems);
            const res = await axios.post(

                `${BASE_URL}/api/orders/cash-order`,
                {
                    items: orderItems,
                    address: defaultAddress ?? {
                        full_name,
                        phone_number,
                        street,
                        ward,
                        district,
                        province,
                    },
                    shipping_fee: shippingFee,
                    total_amount: total,
                    payment_method: 'cash',
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            router.push({
                pathname: "/(auth)/OrderSuccessScreen",
                params: { orderId: res.data._id },
            });
        } catch (error) {
            // console.error("Đặt hàng thất bại:", error?.response?.data || error.message);
            alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.");
        }
    };






    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/Cart')}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Địa chỉ giao hàng */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
                    {defaultAddress ? (
                        <>
                            <Text style={styles.text}>
                                {defaultAddress.full_name} - {defaultAddress.phone_number}
                            </Text>
                            <Text style={styles.text}>
                                {defaultAddress.street}, {defaultAddress.ward}, {defaultAddress.district}, {defaultAddress.province}, VN
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.text}>{full_name} - {phone_number}</Text>
                            <Text style={styles.text}>
                                {street}, {ward}, {district}, {province}, VN
                            </Text>
                        </>
                    )}
                    <TouchableOpacity onPress={() => {
                        router.push({
                            pathname: '/(auth)/AddressListScreen',
                            params: { items: JSON.stringify(selectedItems) },
                        });
                    }}>
                        <Text style={styles.linkText}>Thêm địa chỉ</Text>
                    </TouchableOpacity>
                </View>

                {/* Danh sách sản phẩm */}
                {selectedItems.map((item: any, index: number) => (
                    <View key={index} style={styles.productCard}>
                        <Image source={{ uri: item.image }} style={styles.productImage} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.productInfo}>Loại hàng: {item.size}</Text>
                            <Text style={styles.productPrice}>
                                {(item.price * item.quantity).toLocaleString()}₫ x{item.quantity}
                            </Text>
                        </View>
                    </View>
                ))}

                {/* Tổng tiền sản phẩm */}
                <Text style={styles.subTotal}>Tổng số tiền: {productTotal.toLocaleString()}₫</Text>

                {/* Vận chuyển */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tùy chọn vận chuyển</Text>
                    <View style={styles.shippingOption}>
                        <Ionicons name="radio-button-on" size={18} color="#f33" />
                        <View style={{ marginLeft: 8 }}>
                            <Text>Giao Hàng Tiết Kiệm</Text>
                            <Text style={{ color: '#888', fontSize: 12 }}>Dự kiến nhận hàng: {getDeliveryDate()}</Text>
                        </View>
                        <View style={{ flex: 1 }} />
                        <Text>{shippingFee.toLocaleString()}₫</Text>
                    </View>
                </View>

                {/* Phương thức thanh toán */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                    <TouchableOpacity
                        style={styles.paymentMethod}
                        onPress={() =>
                            router.push({
                                pathname: '/(auth)/SelectPaymentMethodScreen',
                                params: {
                                    returnTo: '/(auth)/PaymentScreen',
                                    paymentMethod,
                                    full_name,
                                    phone_number,
                                    street,
                                    ward,
                                    district,
                                    province,
                                    items: JSON.stringify(selectedItems),
                                },
                            })
                        }
                    >
                        <Text>Chọn phương thức thanh toán</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons
                                name={paymentMethod === 'vnpay' ? 'card' : 'cash'}
                                size={18}
                                color={paymentMethod === 'vnpay' ? '#0a7cff' : '#333'}
                            />
                            <Text style={{ marginLeft: 6 }}>
                                {paymentMethod === 'vnpay' ? 'VNPay' : 'Tiền mặt'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Tổng kết */}
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}>
                        Tổng tiền hàng: <Text style={styles.bold}>{productTotal.toLocaleString()}₫</Text>
                    </Text>
                    <Text style={styles.summaryText}>
                        Tổng tiền vận chuyển: <Text style={styles.bold}>{shippingFee.toLocaleString()}₫</Text>
                    </Text>
                    <Text style={[styles.summaryText, { color: '#e53935' }]}>
                        Tổng thanh toán: <Text style={styles.bold}>{total.toLocaleString()}₫</Text>
                    </Text>
                </View>
            </ScrollView>

            {/* Thanh dưới */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={{}}>Tổng tiền</Text>
                    <Text style={styles.totalBottom}>{total.toLocaleString()}₫</Text>
                </View>

                <TouchableOpacity style={styles.payButton} onPress={paymentMethod === 'vnpay' ? handleVNPayPayment : handleCashPayment}>
                    <Text style={styles.payText}>Thanh toán</Text>
                </TouchableOpacity>


            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        backgroundColor: '#ff4d4f',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    text: {
        fontSize: 14,
        marginBottom: 4,
    },
    content: { padding: 16 },

    section: {
        marginTop: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    sectionTitle: { fontWeight: 'bold', marginBottom: 4 },
    linkText: { color: '#f33' },

    productCard: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
        alignItems: 'center',
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    productName: { fontWeight: '600' },
    productInfo: { fontSize: 12, color: '#666', marginTop: 2 },
    productPrice: { marginTop: 4, fontWeight: 'bold', color: '#e53935' },

    subTotal: {
        textAlign: 'right',
        marginTop: 12,
        fontWeight: '500',
        fontSize: 13,
    },

    shippingOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },

    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
    },

    summaryBox: {
        marginTop: 20,
        backgroundColor: '#fafafa',
        borderRadius: 8,
        padding: 12,
    },
    summaryText: { fontSize: 14, marginVertical: 2 },
    bold: { fontWeight: '600' },

    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '8%',
        borderTopWidth: 1,
        borderColor: '#eee',
        alignItems: 'center',
        paddingBottom: '15%',
    },
    totalBottom: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    payButton: {
        backgroundColor: '#e53935',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    payText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
