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
    TextInput,
    ActivityIndicator,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../src/config';
import { useCart } from '../src/CartContext';
import { useAuth } from '../src/AuthContext';

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
    ratingAvg?: number | null;
    ratingCount?: number;
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
    const [isFavorite, setIsFavorite] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [myComment, setMyComment] = useState<any | null>(null);
    const [ratingInput, setRatingInput] = useState<number>(0);
    const [contentInput, setContentInput] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const uniqueColors = product?.variations ? [...new Set(product.variations.map(v => v.color))] : [];
    const uniqueSizes = product?.variations ? [...new Set(product.variations.map(v => v.size))] : [];
    const { addToCart } = useCart();
    const { token, user } = useAuth();


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
            const res = await axios.get(`${BASE_URL}/api/products/${id}` , {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            setProduct(res.data);
            setIsFavorite(!!(res.data?.isFavorite));
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể tải sản phẩm');
        }
    };

    useEffect(() => {
        if (id) fetchProduct();
    }, [id]);

    // Load comments
    useEffect(() => {
        const loadComments = async () => {
            if (!id) return;
            setCommentsLoading(true);
            try {
                const res = await axios.get(`${BASE_URL}/api/comments/product/${id}`);
                const items = res.data?.items || [];
                setComments(items);
                // find my comment if logged in
                if (token) {
                    const storedMy = items.find((c: any) => c.user_id?._id === user?.id);
                    if (storedMy) {
                        setMyComment(storedMy);
                        setRatingInput(storedMy.rating || 0);
                        setContentInput(storedMy.content || '');
                        setIsEditing(false);
                    } else {
                        setMyComment(null);
                        setRatingInput(0);
                        setContentInput('');
                        setIsEditing(true);
                    }
                }
            } catch (e) {
                // ignore
            } finally {
                setCommentsLoading(false);
            }
        };
        loadComments();
    }, [id, token]);

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

                    {/* Heart favorite button */}
                    <TouchableOpacity
                        style={styles.heartButton}
                        onPress={async () => {
                            if (!token) {
                                Alert.alert('Bạn cần đăng nhập', 'Vui lòng đăng nhập để sử dụng danh sách yêu thích', [
                                    { text: 'Huỷ' },
                                    { text: 'Đăng nhập', onPress: () => router.push('/(auth)/LoginScreen') },
                                ]);
                                return;
                            }
                            if (!product) return;
                            try {
                                if (isFavorite) {
                                    setIsFavorite(false);
                                    await axios.delete(`${BASE_URL}/api/wishlists/${product._id}`, {
                                        headers: { Authorization: `Bearer ${token}` },
                                    });
                                } else {
                                    setIsFavorite(true);
                                    await axios.post(`${BASE_URL}/api/wishlists`, { productId: product._id }, {
                                        headers: { Authorization: `Bearer ${token}` },
                                    });
                                }
                            } catch (e: any) {
                                // revert on error
                                setIsFavorite(prev => !prev);
                                Alert.alert('Lỗi', e?.response?.data?.message || 'Không thể cập nhật yêu thích');
                            }
                        }}
                    >
                        <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={26} color={isFavorite ? 'red' : '#fff'} />
                    </TouchableOpacity>

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
                        {/* Summary */}
                        <View style={styles.ratingSummary}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <Ionicons
                                        key={idx}
                                        name={(product?.ratingAvg ?? 0) >= idx + 1 ? 'star' : (product?.ratingAvg ?? 0) >= idx + 0.5 ? 'star-half' : 'star-outline'}
                                        size={18}
                                        color={'#f5a623'}
                                        style={{ marginRight: 2 }}
                                    />
                                ))}
                            </View>
                            <Text style={{ marginLeft: 8, color: '#333' }}>
                                {(product?.ratingAvg ?? 0).toFixed(1)} ({product?.ratingCount || 0})
                            </Text>
                        </View>

                        {/* Add/Edit comment */}
                        {!token ? (
                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/LoginScreen')}
                                style={styles.loginPromptBtn}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Đăng nhập để đánh giá</Text>
                            </TouchableOpacity>
                        ) : myComment && !isEditing ? (
                            <View style={styles.commentBox}>
                                <Text style={styles.sectionHeader}>Đánh giá của bạn</Text>
                                <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                        <Ionicons key={idx} name={(myComment.rating ?? 0) >= idx + 1 ? 'star' : 'star-outline'} size={18} color={'#f5a623'} style={{ marginRight: 2 }} />
                                    ))}
                                </View>
                                <Text style={{ color: '#333', marginBottom: 8 }}>{myComment.content}</Text>
                                <TouchableOpacity style={styles.submitBtn} onPress={() => setIsEditing(true)}>
                                    <Text style={{ color: '#fff', fontWeight: '600' }}>Chỉnh sửa đánh giá</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.commentBox}>
                                <Text style={styles.sectionHeader}>{myComment ? 'Cập nhật đánh giá của bạn' : 'Đánh giá sản phẩm'}</Text>
                                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                        <TouchableOpacity key={idx} onPress={() => setRatingInput(idx + 1)}>
                                            <Ionicons name={ratingInput >= idx + 1 ? 'star' : 'star-outline'} size={22} color={'#f5a623'} style={{ marginRight: 4 }} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TextInput
                                    value={contentInput}
                                    onChangeText={setContentInput}
                                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm"
                                    multiline
                                    style={styles.commentInput}
                                />
                                <TouchableOpacity
                                    style={styles.submitBtn}
                                    onPress={async () => {
                                        if (!product) return;
                                        if (ratingInput < 1 || ratingInput > 5) {
                                            Alert.alert('Vui lòng chọn số sao (1-5)');
                                            return;
                                        }
                                        if (!contentInput.trim()) {
                                            Alert.alert('Vui lòng nhập nội dung đánh giá');
                                            return;
                                        }
                                        try {
                                            if (myComment) {
                                                await axios.put(
                                                    `${BASE_URL}/api/comments/${myComment._id}`,
                                                    { content: contentInput.trim(), rating: ratingInput },
                                                    { headers: { Authorization: `Bearer ${token}` } }
                                                );
                                            } else {
                                                await axios.post(
                                                    `${BASE_URL}/api/comments`,
                                                    { productId: product._id, content: contentInput.trim(), rating: ratingInput },
                                                    { headers: { Authorization: `Bearer ${token}` } }
                                                );                                                
                                            }
                                            // reload comments and product summary
                                            await fetchProduct();
                                            // reload list
                                            const res = await axios.get(`${BASE_URL}/api/comments/product/${product._id}`);
                                            const items = res.data?.items || [];
                                            setComments(items);
                                            const mine = items.find((c: any) => c.user_id?._id === user?.id);
                                            setMyComment(mine || null);
                                            if (mine) {
                                                setRatingInput(mine.rating || 0);
                                                setContentInput(mine.content || '');
                                                setIsEditing(false);
                                            }
                                            Alert.alert('Thành công', myComment ? 'Đã cập nhật đánh giá' : 'Đã gửi đánh giá');
                                        } catch (e: any) {
                                            Alert.alert('Lỗi', e?.response?.data?.message || 'Không thể gửi đánh giá');
                                        }
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: '600' }}>{myComment ? 'Cập nhật' : 'Gửi đánh giá'}</Text>
                                </TouchableOpacity>
                                {myComment && (
                                    <TouchableOpacity
                                        style={[styles.submitBtn, { backgroundColor: '#aaa', marginTop: 8 }]}
                                        onPress={() => {
                                            setIsEditing(false);
                                            setRatingInput(myComment.rating || 0);
                                            setContentInput(myComment.content || '');
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: '600' }}>Hủy</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Comments list */}
                        {commentsLoading ? (
                            <ActivityIndicator style={{ marginTop: 12 }} />
                        ) : (
                            <View style={{ marginTop: 10 }}>
                                {comments.length === 0 ? (
                                    <Text style={{ color: '#888' }}>Chưa có đánh giá.</Text>
                                ) : (
                                    comments.map((c) => (
                                        <View key={c._id} style={styles.commentItem}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                                <View style={styles.avatarPlaceholder} />
                                                <Text style={{ fontWeight: '600', marginLeft: 8 }}>{c.user_id?.full_name || 'Người dùng'}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                                                {Array.from({ length: 5 }).map((_, idx) => (
                                                    <Ionicons key={idx} name={c.rating >= idx + 1 ? 'star' : 'star-outline'} size={16} color={'#f5a623'} style={{ marginRight: 2 }} />
                                                ))}
                                            </View>
                                            <Text style={{ color: '#333' }}>{c.content}</Text>
                                        </View>
                                    ))
                                )}
                            </View>
                        )}
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
    ratingSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    loginPromptBtn: {
        backgroundColor: '#f66',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    commentBox: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        padding: 10,
    },
    sectionHeader: {
        fontWeight: '700',
        marginBottom: 8,
        color: '#333',
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        minHeight: 60,
        padding: 8,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
    },
    submitBtn: {
        backgroundColor: '#3366FF',
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    commentItem: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingVertical: 8,
    },
    avatarPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ddd',
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
    heartButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.35)',
        padding: 8,
        borderRadius: 20,
        zIndex: 10,
    },

});
