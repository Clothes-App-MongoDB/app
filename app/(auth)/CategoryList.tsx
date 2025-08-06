import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../src/config';
import { Ionicons } from '@expo/vector-icons';


export type Product = {
    _id: string;
    name: string;
    price: number;
    oldPrice?: number;
    image: string;
    rating?: number;
};

const subCategories = [
    { id: 1, title: 'Áo thun', image: require('../../assets/images/t-shirt.png') },
    { id: 2, title: 'Áo sơ mi', image: require('../../assets/images/shirt.png') },
    { id: 3, title: 'Áo hoodie', image: require('../../assets/images/hoodie.png') },
    { id: 4, title: 'Áo len', image: require('../../assets/images/sweater.png') },
    { id: 5, title: 'Áo khoác', image: require('../../assets/images/jacket.png') },
    { id: 6, title: 'Áo vest', image: require('../../assets/images/icons8-vest-48.png') },
];

const filters = ['Bán nhiều nhất', 'Giá cao', 'Giá thấp', ,];

export default function CategoryList() {
    const screenWidth = Dimensions.get('window').width;
    const itemWidth = (screenWidth - 40) / 2;
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const router = useRouter();
    const handlePress = (id: string) => {
        router.push({ pathname: '/(auth)/ProductDetail', params: { id } });
    };


    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/products?featured=true`);
                setFeaturedProducts(res.data);
            } catch (error) {
                console.error("Lỗi khi fetch sản phẩm nổi bật:", error);
            }
        };

        fetchFeaturedProducts();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconLeft}>
                    <Ionicons name="arrow-back" color="#fff" size={24} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Danh mục Sản Phẩm</Text>

                <View style={styles.headerIconsRight}>
                    <Ionicons name="search" size={22} color="#fff" style={{ marginRight: 10 }} />
                    <Ionicons name="cart-outline" color="#fff" size={22} />
                </View>
            </View>

            {/* Danh mục con */}
            <View>
                <FlatList
                    data={subCategories}
                    horizontal
                    keyExtractor={(item) => item.id.toString()}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.subCategoryList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.subCategoryItem}
                            onPress={() =>
                                router.push({
                                    pathname: '/(auth)/ProductByCategory',
                                    params: { category: item.title },
                                })
                            }
                        >
                            <View style={styles.categoryCircle}>
                                <Image source={item.image} style={styles.circleIcon} />
                            </View>

                            <Text style={styles.subCategoryText}>{item.title}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
            {/* Filter */}
            <View style={styles.filterRow}>
                {filters.map((filter, index) => (
                    <TouchableOpacity key={index} style={styles.filterBtn}>
                        <Text style={styles.filterText}>{filter}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Gợi ý sản phẩm */}
            <Text style={styles.sectionTitle}>Gợi Ý Riêng Cho Bạn</Text>
            <FlatList
                data={featuredProducts}
                keyExtractor={(item) => item._id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.productCard, { width: itemWidth }]}
                        onPress={() => handlePress(item._id)}
                    >
                        <View >
                            <Image
                                source={{ uri: item.image }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                        </View>

                        <Text style={styles.productPrice}>
                            {item.price.toLocaleString()} ₫
                        </Text>
                        <Text numberOfLines={2} style={styles.productName}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    categoryCircle: {
        backgroundColor: '#ffffffff',
        borderRadius: 999,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    container: {
        flex: 1,
        backgroundColor: '#ffd6d2',


    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: '8%',
        backgroundColor: '#f66060ff',
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30,
    },

    headerIconLeft: {
        width: 40,
        alignItems: 'flex-start',
    },

    headerIconsRight: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 60,
        justifyContent: 'flex-end',
    },

    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: "#fff",
        textAlign: 'center',
        flex: 1,
    },

    subCategoryList: {
        paddingVertical: 10,
        paddingHorizontal: 12,

    },
    subCategoryItem: {
        alignItems: 'center',
        marginRight: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,


    },
    circleIcon: {
        width: 35,
        height: 35,
        borderRadius: 30,
        backgroundColor: '#f2f2f2',
        resizeMode: 'contain',



    },
    subCategoryText: {
        fontSize: 13,
        textAlign: 'center',
        color: '#000',

    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        marginBottom: 10,

    },
    filterBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#fff',
    },
    filterText: {
        fontSize: 13,
        color: '#000',
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        paddingHorizontal: 16,
        marginVertical: 10,
        color: '#000',
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 12,
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
    },
    productImage: {
        width: '100%',
        height: 200,
    },
    productPrice: {
        fontWeight: 'bold',
        fontSize: 14,
        marginHorizontal: 8,
        marginTop: 8,
        color: '#000',
    },
    productName: {
        fontSize: 13,
        color: '#333',
        marginHorizontal: 8,
        marginBottom: 8,
    },
});
