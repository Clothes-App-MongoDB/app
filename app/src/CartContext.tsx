import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    color: string;
    size: string;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    clearCart: () => void;
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart phải được dùng bên trong CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (item: CartItem) => {
        setCart(prev => {
            const existingIndex = prev.findIndex(
                (cartItem) =>
                    cartItem.productId === item.productId &&
                    cartItem.color === item.color &&
                    cartItem.size === item.size
            );

            if (existingIndex !== -1) {
                // Nếu đã tồn tại, tăng số lượng
                const updatedCart = [...prev];
                updatedCart[existingIndex].quantity += item.quantity;
                return updatedCart;
            }

            // Nếu chưa có, thêm mới
            return [...prev, item];
        });
    };


    const clearCart = () => {
        setCart([]);
    };

    return (
       <CartContext.Provider value={{ cart, addToCart, clearCart, setCart }}>

            {children}
        </CartContext.Provider>
    );
};
