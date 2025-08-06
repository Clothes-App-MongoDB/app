import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');


const slides = [
    {
        key: '1',
        title: 'Online Purchase',
        text: 'Khám phá phong cách thời trang nam đẳng cấp ngay trong tầm tay bạn với Manzone Poly',
        image: require('../../assets/images/slide1.png'),
    },
    {
        key: '2',
        title: 'Shopping Quality',
        text: 'Mua sắm thời trang nam chất lượng dễ dàng ngay trên ứng dụng',
        image: require('../../assets/images/slide2.png'),
    },
];

export default function Onboarding() {
    const router = useRouter();
    const [index, setIndex] = useState(0);

    const flatListRef = useRef<FlatList>(null)// <-- Thêm ref

    const handleNext = () => {
        if (index === slides.length - 1) {
            router.replace('/(auth)/Register_LoginScreen');
        } else {
            setIndex(index + 1);
        }
    };

    const handleSkip = () => router.replace('/(auth)/Register_LoginScreen');

    // Khi index thay đổi, cuộn FlatList tới vị trí tương ứng
    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({ index, animated: true });
        }
    }, [index]);

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.header}>
                {index > 0 && (
                    <TouchableOpacity onPress={() => setIndex(index - 1)}>
                        <Ionicons name="chevron-back" size={24} />
                    </TouchableOpacity>
                )}
                <View></View>
                <TouchableOpacity onPress={handleSkip} style={{ alignSelf: 'flex-end', padding: 15, marginRight: 10 }}>
                    <Text style={{ color: '#999', fontWeight: 'bold' }}>Bỏ qua</Text>
                </TouchableOpacity>

            </View>

            <FlatList
                ref={flatListRef} // <-- Gắn ref
                data={slides}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <Image source={item.image} style={styles.image} resizeMode="contain" />
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.text}>{item.text}</Text>
                    </View>
                )}
                keyExtractor={(item) => item.key}
                extraData={index}
            />

            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                <Ionicons name="arrow-forward" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        padding: 15, alignItems: 'center',
    },
    slide: {
        width, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 30,
    },
    image: { width: 300, height: 250 },
    title: { fontSize: 18, fontWeight: 'bold', marginTop: 0 },
    text: { textAlign: 'center', marginTop: 10, color: '#555' },
    nextBtn: {
        position: 'absolute',
        right: 20,
        bottom: 40,
        backgroundColor: '#0039e6',
        padding: 15,
        borderRadius: 30,
    },
});
