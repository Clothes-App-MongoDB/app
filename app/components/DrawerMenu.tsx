import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function DrawerMenu() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logomaloze.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>-------Manzone Poly------</Text>
      <Text style={styles.section}>Danh mục</Text>

      {['Thông báo', 'Áo thun', 'Áo khoác', 'Áo sơ mi', 'Áo hoodie', 'ChatBot'].map((item, idx) => (
        <TouchableOpacity key={idx} style={styles.menuItem}>
          <Text>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 16 },
  section: { fontWeight: 'bold', fontSize: 20, marginBottom: 10, color:'red'  },
  menuItem: { paddingVertical: 18, borderBottomWidth: 1, borderColor: '#eee',},
  logo: {
    width: 200,
    height: 100,
    marginBottom: 0,
  },
});
