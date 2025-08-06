import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { BASE_URL } from '../src/config';
import { Ionicons } from '@expo/vector-icons';

interface Product {
    _id: string;
    name: string;
    image: string;
    price: number;

}


export default function ProductByCategoryScreen() {
    const { category } = useLocalSearchParams(); // category: string | string[]

    // Đảm bảo category là string
    const categoryName = Array.isArray(category) ? category[0] : category;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();


    useEffect(() => {
        const fetchProductsByCategory = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/products?category=${categoryName}`);
                setProducts(res.data);
            } catch (err) {
                console.error('Lỗi khi tải sản phẩm:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsByCategory();
    }, [categoryName]);

    if (loading) {
        return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>{category}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Ionicons name="search" size={22} color="#fff" style={{ marginRight: 10 }} />
                    <Ionicons name="cart-outline" color="#fff" size={22} />
                </View>
            </View>


            {products.length === 0 ? (
                <Text style={styles.noResultText}>Không có sản phẩm nào.</Text>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.productCard}
                            onPress={() =>
                                router.push({ pathname: '/(auth)/ProductDetail', params: { id: item._id } })
                            }
                        >
                            <Image source={{ uri: item.image }} style={styles.image} />
                            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                            <Text style={styles.price}>{item.price.toLocaleString()}₫</Text>
                        </TouchableOpacity>
                    )}
                />

            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffd6d2',

    },
    header: {
        flexDirection: 'row',
        padding: 25,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f66',
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30,

    },

    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 0,
        color: "#fff"
    },
    noResultText: {
        textAlign: 'center',
        marginTop: 20,
        color: 'gray',
    },
    row: {
        justifyContent: 'space-between',
        padding: 15,

    },
    productCard: {
        backgroundColor: '#fff',
        width: '48%',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
        padding: 10,

    },
    image: {
        width: '100%',
        height: 160,
        borderRadius: 8,
        marginBottom: 8,
        resizeMode: 'cover',
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        color: '#d0021b',
        fontWeight: '600',
    },
});

