
import React, { useEffect, useRef } from 'react';
import { SearchIcon, FilterIcon, ShoppingCartIcon, WhatsAppIcon, SparklesIcon, TagIcon, ClockIcon, ShieldCheckIcon, LiluTecnoLogoIcon } from './Icons.tsx';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  totalCartItems: number;
  onCartClick: () => void;
  onMobileFiltersClick: () => void;
  filteredCount: number;
  totalAvailableCount: number;
  isHeaderVisible: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  totalCartItems,
  onCartClick,
  onMobileFiltersClick,
  filteredCount,
  totalAvailableCount,
  isHeaderVisible
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const stats = [
    { icon: TagIcon, value: filteredCount, label: 'En oferta' },
    { icon: SparklesIcon, value: totalAvailableCount, label: 'Disponibles' },
    { icon: ClockIcon, value: '24h', label: 'Envío Rápido' },
    { icon: ShieldCheckIcon, value: '100%', label: 'Garantía' }
  ];

  const startAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = window.setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        // Check if we are near the end of the scroll
        if (scrollLeft + clientWidth >= scrollWidth - 1) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by a quarter of the container's width for a smoother look
          scrollContainerRef.current.scrollBy({ left: clientWidth / 4, behavior: 'smooth' });
        }
      }
    }, 3000); // Autoscroll every 3 seconds
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleManualInteraction = () => {
    stopAutoScroll();
    timeoutRef.current = window.setTimeout(startAutoScroll, 5000); // Restart after 5s of inactivity
  };
  
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    
    // Only apply autoscroll on smaller screens
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    
    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        startAutoScroll();
      } else {
        stopAutoScroll();
      }
    };

    if (mediaQuery.matches) {
      startAutoScroll();
    }

    mediaQuery.addEventListener('change', handleMediaQueryChange);
    
    if (scrollContainer) {
      scrollContainer.addEventListener('pointerdown', handleManualInteraction);
      scrollContainer.addEventListener('wheel', handleManualInteraction, { passive: true });
    }

    return () => {
      stopAutoScroll();
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
      if (scrollContainer) {
        scrollContainer.removeEventListener('pointerdown', handleManualInteraction);
        scrollContainer.removeEventListener('wheel', handleManualInteraction);
      }
    };
  }, [filteredCount, totalAvailableCount]);


  return (
    <header className={`bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 shadow-2xl sticky top-0 z-50 text-white transition-transform duration-300 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-center py-2 px-4">
        <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-black tracking-wide">
          <SparklesIcon className="w-5 h-5 text-red-600 animate-pulse" />
          <span className="truncate">¡OFERTAS MUNDIALES! Hasta 70% OFF</span>
          <SparklesIcon className="w-5 h-5 text-red-600 animate-pulse" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4">
          {/* Top row: Logo and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <LiluTecnoLogoIcon className="text-orange-500 w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">LiluTecno</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={onMobileFiltersClick}
                className="lg:hidden p-2 bg-white/20 border border-white/25 rounded-xl text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
                aria-label="Abrir filtros"
              >
                <FilterIcon className="h-6 w-6" />
              </button>
              <button
                onClick={onCartClick}
                className="relative p-3 bg-white/20 border border-white/25 rounded-xl text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
                aria-label="Ver carrito de compras"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-purple-600 animate-pulse">
                    {totalCartItems}
                  </span>
                )}
              </button>
              <a
                href="https://wa.link/4fo4p4"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-green-500 rounded-xl shadow-lg hover:bg-green-600 transition-all transform hover:scale-105"
                aria-label="Contactar por WhatsApp"
              >
                <WhatsAppIcon className="h-6 w-6 text-white" />
              </a>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Busca tu producto favorito..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-transparent shadow-inner bg-black/20 text-white placeholder-gray-300 focus:bg-black/30 focus:border-orange-400 focus:ring-0 outline-none transition-all duration-300"
              aria-label="Buscar productos"
            />
          </div>
        </div>

        {/* Stats Section - Carousel on mobile, Grid on desktop */}
        <div
          ref={scrollContainerRef}
          className="mt-4 pt-4 border-t border-white/20 flex flex-row overflow-x-auto md:grid md:grid-cols-4 gap-x-6 md:gap-4 pb-2 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] scroll-smooth"
        >
          {stats.map((stat, index) => (
            <div key={index} className="flex-shrink-0 w-32 md:w-auto flex flex-col items-center text-center cursor-pointer">
              <div className="flex items-baseline justify-center gap-1.5 text-xl md:text-3xl font-black text-white drop-shadow-lg">
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 self-center" /> {stat.value}
              </div>
              <div className="text-xs text-orange-100 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};
