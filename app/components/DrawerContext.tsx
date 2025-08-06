import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';

const DrawerContext = createContext({
  openDrawer: () => {},
  closeDrawer: () => {},
});

export const useDrawer = () => useContext(DrawerContext);

type DrawerProviderProps = {
  children: ReactNode;
  drawerContent: ReactNode;
};

export const DrawerProvider = ({ children, drawerContent }: DrawerProviderProps) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer }}>
      {children}
      {isDrawerOpen && (
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={styles.overlay}>
            <View style={styles.drawer}>{drawerContent}</View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </DrawerContext.Provider>
  );
};
export default DrawerProvider;
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 10,
    flexDirection: 'row',
  },
  drawer: {
    width: 280,
    backgroundColor: 'white',
    padding: 16,
  },
});
