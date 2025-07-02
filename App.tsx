

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product, CartItem, FiltersState, NotificationMessage, ProductWithStringImages } from './types.ts';
import { productDatabase } from './data/products.ts';
import { MAX_PRICE, INITIAL_FILTERS } from './constants.ts';
import { Header } from './components/Header.tsx';
import FiltersDesktop from './components/FiltersDesktop.tsx';
import ProductGrid from './components/ProductGrid.tsx';
import WhatsAppButton from './components/WhatsAppButton.tsx';
import Notification from './components/Notification.tsx';
import ProductModal from './components/ProductModal.tsx';
import CartModal from './components/CartModal.tsx';
import FiltersMobileModal from './components/FiltersMobileModal.tsx';


export const App: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartModalOpen, setCartModalOpen] = useState(false);
  const [isMobileFiltersModalOpen, setMobileFiltersModalOpen] = useState(false);
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const processedProducts: Product[] = productDatabase.map((p: ProductWithStringImages) => ({
      ...p,
      images: p.images.split(',').map(i => i.trim()).filter(Boolean)
    }));
    setAllProducts(processedProducts);
    const uniqueCategories = [...new Set(processedProducts.map(p => p.category))].sort();
    setCategories(uniqueCategories);
  }, []);

  useEffect(() => {
    const storedCart = localStorage.getItem('lilutecno_cart_v2');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        localStorage.removeItem('lilutecno_cart_v2');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lilutecno_cart_v2', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const controlHeaderVisibility = () => {
      const currentScrollY = window.scrollY;
      const headerHeightThreshold = 150;

      if (currentScrollY > lastScrollY.current && currentScrollY > headerHeightThreshold) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', controlHeaderVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', controlHeaderVisibility);
    };
  }, []);

  const addNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);
  
  const filterProducts = useCallback(() => {
    const { searchTerm, category, priceRange, stockOnly } = filters;
    let tempProducts = [...allProducts];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(lowerSearchTerm) ||
        (p.summary && p.summary.toLowerCase().includes(lowerSearchTerm))
      );
    }
    if (category) {
      tempProducts = tempProducts.filter(p => p.category === category);
    }
    tempProducts = tempProducts.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
    if (stockOnly) {
      tempProducts = tempProducts.filter(p => p.stock > 0);
    }
    setFilteredProducts(tempProducts);
  }, [allProducts, filters]);

  useEffect(() => {
    filterProducts();
  }, [allProducts, filters, filterProducts]);

  const handleSetFilters = useCallback((newFilters: Partial<FiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handlePriceRangeChange = useCallback((newPriceRange: {min: number, max: number}) => {
    setFilters(prev => ({...prev, priceRange: newPriceRange}));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    addNotification(`Producto eliminado del carrito`, 'error');
  }, [addNotification]);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const addToCart = useCallback((product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1, image: product.images[0] }];
      }
    });
    addNotification(`${product.name} agregado al carrito`);
  }, [addNotification]);

  const clearCart = useCallback(() => {
    setCart([]);
    addNotification('Carrito vaciado', 'success');
  }, [addNotification]);
  
  const onProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const productsOnOfferCount = filteredProducts.filter(p => p.old_price && p.old_price > p.price).length;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header
        isHeaderVisible={isHeaderVisible}
        searchTerm={filters.searchTerm}
        onSearchChange={(term) => handleSetFilters({ searchTerm: term })}
        totalCartItems={totalCartItems}
        onCartClick={() => setCartModalOpen(true)}
        onMobileFiltersClick={() => setMobileFiltersModalOpen(true)}
        filteredCount={productsOnOfferCount}
        totalAvailableCount={filteredProducts.length}
      />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          <FiltersDesktop
            categories={categories}
            filters={filters}
            onFilterChange={handleSetFilters}
            onPriceChange={handlePriceRangeChange}
            onClearFilters={clearFilters}
            maxPrice={MAX_PRICE}
          />
          <ProductGrid
            products={filteredProducts}
            onProductClick={onProductClick}
            onAddToCart={addToCart}
          />
        </div>
      </main>

      <footer className="bg-gray-800 text-white text-center py-6">
        <p>&copy; {new Date().getFullYear()} LiluTecno. Todos los derechos reservados.</p>
        <p className="text-sm text-gray-400">Tecnología Mundial a Tu Alcance!</p>
      </footer>

      
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
          />
        )}
        {isCartModalOpen && (
          <CartModal
            cart={cart}
            onClose={() => setCartModalOpen(false)}
            onUpdateQuantity={updateCartQuantity}
            onRemoveFromCart={removeFromCart}
            onClearCart={clearCart}
            addNotification={addNotification}
          />
        )}
        {isMobileFiltersModalOpen && (
          <FiltersMobileModal
            isOpen={isMobileFiltersModalOpen}
            onClose={() => setMobileFiltersModalOpen(false)}
            categories={categories}
            currentFilters={filters}
            onApplyFilters={(appliedFilters) => {
              setFilters(appliedFilters);
              setMobileFiltersModalOpen(false);
            }}
            maxPrice={MAX_PRICE}
          />
        )}
      
      <WhatsAppButton />
      <div className="fixed top-4 right-4 z-[1000] space-y-2">
        {notifications.map(n => (
          <Notification key={n.id} message={n.message} type={n.type} onClose={() => setNotifications(prev => prev.filter(item => item.id !== n.id))} />
        ))}
      </div>
    </div>
  );
};