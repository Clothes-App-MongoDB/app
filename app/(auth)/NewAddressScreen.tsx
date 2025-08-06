import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Switch,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../src/AuthContext'; // Đường dẫn tới AuthContext của bạn
import { BASE_URL } from '../src/config';
import { AxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';



export default function NewAddressScreen() {
    const navigation = useNavigation();
    const { token } = useAuth();

    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [ward, setWard] = useState('');
    const [street, setStreet] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        if (!token) {
            Alert.alert('Bạn chưa đăng nhập');
            return;
        }

        try {
            const response = await axios.post(
                `${BASE_URL}/api/addresses`,
                {
                    full_name: fullName,
                    phone_number: phoneNumber,
                    province,
                    district,
                    ward,
                    street,
                    is_default: isDefault,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            Alert.alert('Thành công', 'Đã thêm địa chỉ mới!');
            router.replace('/(auth)/AddressListScreen');
        } catch (err) {
            if (err instanceof AxiosError) {
                Alert.alert("Lỗi", err.response?.data?.message || "Đã có lỗi xảy ra");
            } else {
                Alert.alert("Lỗi", "Đã có lỗi không xác định");
            }
        }
    };

    return (
        <View style={{ height: '100%' }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={'#fff'} />
                </TouchableOpacity>
                <Text style={styles.title}>Thêm địa chỉ mới</Text>
                <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 450, }}>

                {/* Các input */}
                <Text style={styles.label}>Họ và tên</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập họ và tên"
                    value={fullName}
                    onChangeText={setFullName}
                />

                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                />

                <Text style={styles.label}>Tỉnh/Thành phố</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Chọn Tỉnh/Thành phố"
                    value={province}
                    onChangeText={setProvince}
                />

                <Text style={styles.label}>Quận/Huyện</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Chọn Quận/Huyện"
                    value={district}
                    onChangeText={setDistrict}
                />

                <Text style={styles.label}>Phường/Xã</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Chọn Phường/Xã"
                    value={ward}
                    onChangeText={setWard}
                />

                <Text style={styles.label}>Địa chỉ cụ thể</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Số nhà, tên đường..."
                    value={street}
                    onChangeText={setStreet}
                />

                <View style={styles.switchRow}>
                    <Text style={styles.label}>Đặt làm địa chỉ mặc định</Text>
                    <Switch value={isDefault} onValueChange={setIsDefault} />
                </View>

                {/* Đặt nút ở cuối ScrollView nếu muốn nó cuộn theo */}
                <View style={{ marginTop: 24 }}>
                    <TouchableOpacity style={styles.button} onPress={handleSave}>
                        <Text style={styles.buttonText}>Lưu địa chỉ</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView></View>

    );



}
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
    headerIconLeft: {
        width: 40,
        alignItems: 'flex-start',
    },
    bottomButtonContainer: {
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: '1%',
        color: 'white'
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 4,
        marginTop: 16
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 8
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16
    },
    button: {
        marginTop: 32,
        backgroundColor: '#f04e4e',
        padding: 14,
        borderRadius: 6,
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    }
});
