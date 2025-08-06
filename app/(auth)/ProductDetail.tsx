import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    Alert,
    Modal,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../src/config';
import { useCart } from '../src/CartContext';

type Product = {
    _id: string;
    name: string;
    image: string;
    images: string[];
    description: { field: string; value: string }[];
    price: number;
    brand: string;
    category: string;
    quantity: number;
    variations: {
        color: string;
        size: string;
        quantity: number;
    }[];
};

type ProductType = {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    description?: string;

};

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('screen').height;

export default function ProductDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [tab, setTab] = useState<'info' | 'reviews'>('info');
    const [showMore, setShowMore] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const uniqueColors = product?.variations ? [...new Set(product.variations.map(v => v.color))] : [];
    const uniqueSizes = product?.variations ? [...new Set(product.variations.map(v => v.size))] : [];
    const { addToCart } = useCart();


    const handleAddToCart = () => {
        if (!selectedColor || !selectedSize) {
            Alert.alert('Vui lòng chọn đầy đủ màu sắc và kích cỡ');
            return;
        }
        if (!product) return;

        const item = {
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            color: selectedColor,
            size: selectedSize,
            quantity: quantity,
        };

        addToCart(item); // Sử dụng context
        Alert.alert('✅ Đã thêm vào giỏ hàng');
        setModalVisible(false);
        router.push('/(tabs)/Cart'); // Đúng path nếu Cart nằm trong (tabs)
    };


    // Move fetchProduct before useEffect
    const fetchProduct = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/products/${id}`);
            setProduct(res.data);
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể tải sản phẩm');
        }
    };

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    useEffect(() => {
        setRelatedProducts([]);
        if (product?.category && product._id) {
            const fetchRelated = async () => {
                try {
                    const encodedCategory = encodeURIComponent(product.category);
                    const url = `${BASE_URL}/api/products/related/by-category?category=${encodedCategory}&exclude=${product._id}`;

                    const res = await fetch(url);

                    if (!res.ok) {
                        const errorText = await res.text();
                        console.error("Lỗi phản hồi từ server:", errorText);
                        return;
                    }

                    const data = await res.json();
                    setRelatedProducts(data);
                } catch (err) {
                    console.error("Lỗi khi load sản phẩm liên quan:", err);
                }
            };
            fetchRelated();
        }
    }, [product]);

    if (!product) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Đang tải sản phẩm...</Text>
            </View>
        );
    }

    const images = [product.image, ...(product.images || [])];

    return (
        <View style={styles.container}>

            <View style={styles.container}>


                {/* Modal */}
                <Modal
                    transparent={true}
                    visible={modalVisible}
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)} // Android back button
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContentWrapper}>
                            <ScrollView
                                style={{ maxHeight: screenHeight * 0.75 }}
                                contentContainerStyle={{ padding: 20 }}
                                showsVerticalScrollIndicator={false}
                            >
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                    <Text style={{ fontSize: 20 }}>✕</Text>
                                </TouchableOpacity>

                                <Text style={styles.stockText}>Kho: {product.quantity}</Text>
                                <Text style={styles.priceText}>{product.price.toLocaleString()} ₫</Text>

                                <Text style={styles.sectionTitle}>Màu sắc</Text>
                                <View style={styles.optionContainer}>
                                    {uniqueColors.map(color => (
                                        <TouchableOpacity
                                            key={color}
                                            style={[
                                                styles.optionButton,
                                                selectedColor === color && styles.selectedOption,
                                            ]}
                                            onPress={() => setSelectedColor(color)}
                                        >
                                            <Text style={styles.optionText}>{color}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.sectionTitle}>Kích cỡ</Text>
                                <View style={styles.optionContainer}>
                                    {uniqueSizes.map(size => (
                                        <TouchableOpacity
                                            key={size}
                                            style={[
                                                styles.optionButton,
                                                selectedSize === size && styles.selectedOption,
                                            ]}
                                            onPress={() => setSelectedSize(size)}
                                        >
                                            <Text style={styles.optionText}>{size}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                                        <Text style={styles.quantityButton}>−</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.quantityText}>{quantity}</Text>
                                    <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                                        <Text style={styles.quantityButton}>+</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                                    <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi Tiết Sản Phẩm</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Ionicons name="share-social-outline" size={22} style={{ marginRight: 10 }} />
                    <Ionicons name="cart-outline" size={22} />
                </View>
            </View>

            <ScrollView>
                <View>
                    <Carousel
                        loop
                        width={screenWidth}
                        height={screenWidth}
                        autoPlay={false}
                        data={images}
                        scrollAnimationDuration={1000}
                        onSnapToItem={(index) => setCurrentIndex(index)}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item }} style={{ width: screenWidth, height: screenWidth }} />
                        )}
                    />

                    {/* Pagination Dots */}
                    <View style={styles.paginationContainer}>
                        {images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    currentIndex === index ? styles.activeDot : {},
                                ]}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>{product.price.toLocaleString()}đ</Text>
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        onPress={() => setTab('info')}
                        style={[styles.tabItem, tab === 'info' && styles.tabSelected]}
                    >
                        <Text style={tab === 'info' && styles.tabTextSelected}>Thông tin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setTab('reviews')}
                        style={[styles.tabItem, tab === 'reviews' && styles.tabSelected]}
                    >
                        <Text style={tab === 'reviews' && styles.tabTextSelected}>Đánh giá</Text>
                    </TouchableOpacity>
                </View>

                {tab === 'info' && (
                    <View style={styles.detailBox}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Thương hiệu:</Text>
                            <Text style={styles.detailValue}>{product.brand}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Danh mục:</Text>
                            <Text style={styles.detailValue}>{product.category}</Text>
                        </View>
                        {product.description?.slice(0, showMore ? product.description.length : 3).map((item, idx) => (
                            <View key={idx} style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{item.field}:</Text>
                                <Text style={styles.detailValue}>{item.value}</Text>
                            </View>
                        ))}
                        {product.description?.length > 3 && (
                            <TouchableOpacity onPress={() => setShowMore(!showMore)}>
                                <Text style={styles.showMoreText}>
                                    {showMore ? 'Thu gọn ▲' : 'Xem thêm ▼'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {tab === 'reviews' && (
                    <View style={styles.detailBox}>
                        <Text style={{ color: '#888' }}>Chưa có đánh giá.</Text>
                    </View>
                )}

                {relatedProducts.length > 0 && (
                    <View style={styles.relatedContainer}>
                        <Text style={styles.relatedTitle}>Sản phẩm liên quan</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {relatedProducts.map((item) => (
                                <TouchableOpacity
                                    key={item._id}
                                    style={styles.relatedCard}
                                    onPress={() => router.push(`/ProductDetail?id=${item._id}`)}
                                >
                                    <Image source={{ uri: item.image }} style={styles.relatedImage} />
                                    <Text style={{ fontSize: 14, fontWeight: '600' }} numberOfLines={1}>{item.name}</Text>
                                    <Text style={{ color: 'red' }}>{item.price.toLocaleString()}đ</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </ScrollView>

            <View style={styles.bottomBar}>

                <TouchableOpacity style={{ padding: 10 }} onPress={() => setModalVisible(true)} >
                    <Ionicons name="cart-outline" size={26} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => Alert.alert('', 'Chức năng mua chưa được triển khai')}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Mua ngay</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        padding: '5%',
        paddingTop: '8%',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#eee',
    },
    headerTitle: { fontSize: 16, fontWeight: '600' },
    infoContainer: { padding: 12 },
    productName: { fontSize: 18, fontWeight: 'bold' },
    productPrice: { fontSize: 16, color: 'red', marginTop: 4 },
    tabContainer: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    tabItem: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
    },
    tabSelected: {
        borderBottomWidth: 2,
        borderColor: 'red',
    },
    tabTextSelected: {
        color: 'red',
        fontWeight: 'bold',
    },
    detailBox: { padding: 12 },
    detailRow: { flexDirection: 'row', marginBottom: 8 },
    detailLabel: { width: 100, fontWeight: '600' },
    detailValue: { flex: 1 },
    relatedContainer: { padding: 12 },
    relatedTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    relatedCard: {
        width: 120,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#eee',
        padding: 8,
        borderRadius: 8,
    },
    relatedImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginBottom: 6,
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: '9%',
        margin: 10,
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
    buyButton: {
        flex: 1,
        backgroundColor: 'red',
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 4,
    },
    showMoreText: {
        color: '#007AFF',
        marginTop: 10,
        fontWeight: '500',
        textAlign: 'center',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#000',
        width: 8,
        height: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',

    },
    modalContentWrapper: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    closeButton: {
        alignSelf: 'flex-end',
    },
    stockText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
    },
    priceText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#e53935',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 10,
    },
    optionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 12,
    },
    optionButton: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#999',
    },
    selectedOption: {
        backgroundColor: '#e8e7e7ff',
        borderColor: '#000',
    },
    optionText: {
        color: '#000',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        justifyContent: 'center',
        marginVertical: 14,
    },
    quantityButton: {
        fontSize: 22,
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
    quantityText: {
        fontSize: 18,
    },
    addToCartButton: {
        backgroundColor: '#e61c58ff',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    addToCartText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

});
