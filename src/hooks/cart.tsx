import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      
      const products =  await AsyncStorage.getItem('@GoMarketPlace:products');

      if(products){

        setProducts([...JSON.parse(products)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const productExists = products.find(p => p.id === product.id)

    if(productExists){
      const result  = products.map( p => p.id === product.id ? {...product, quantity: p.quantity + 1}: p);
      
      setProducts(result)
    }else{
      setProducts([...products,{...product, quantity: 1}])

      await AsyncStorage.setItem('@GoMarketPlace:products', 
      JSON.stringify(products)
      )
    }
  }, [products]);

  const increment = useCallback(async id => {

    const result = products.map( e => e.id == id ?  {...e, quantity: e.quantity + 1 }: e)
    setProducts(result)


    await AsyncStorage.setItem('@GoBarberMarketplace:products', JSON.stringify(result))
  },[products],);

  const decrement = useCallback(async id => {
    const result = products.map( e => e.id == id ?  {...e, quantity: e.quantity - 1 }: e)

    setProducts(result)


    await AsyncStorage.setItem('@GoBarberMarketplace:products', JSON.stringify(result))
  },[products],);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
