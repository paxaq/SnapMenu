import React, { useState } from 'react';
import { MenuData } from '../types';
import { Share2, ArrowLeft, Search, UtensilsCrossed } from 'lucide-react';

interface MenuPreviewProps {
  data: MenuData;
  readonly?: boolean;
  onBack?: () => void;
  onShare?: () => void;
}

const MenuPreview: React.FC<MenuPreviewProps> = ({ data, readonly = false, onBack, onShare }) => {
  const [activeCategory, setActiveCategory] = useState<string>(data.categories[0]?.name || '');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = data.categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const handleCategoryClick = (name: string) => {
    setActiveCategory(name);
    const element = document.getElementById(`cat-${name}`);
    if (element) {
      // Offset for sticky header
      const y = element.getBoundingClientRect().top + window.scrollY - 180;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="px-4 h-16 flex items-center justify-between">
          {!readonly && onBack ? (
            <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
          ) : (
             <div className="p-2 -ml-2 text-gray-900">
               <UtensilsCrossed size={20} />
             </div>
          )}
          
          <h1 className="flex-1 text-center font-serif font-bold text-lg text-gray-900 truncate px-4">
            {data.restaurantName}
          </h1>

          {!readonly && onShare ? (
             <button onClick={onShare} className="p-2 -mr-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
              <Share2 size={20} />
            </button>
          ) : (
            <div className="w-8" /> 
          )}
        </div>
        
        {/* Category Tabs */}
        <div className="flex overflow-x-auto no-scrollbar px-4 pb-0 space-x-6">
           {data.categories.map((cat) => (
             <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`pb-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 px-1 ${
                  activeCategory === cat.name 
                  ? 'border-gray-900 text-gray-900' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
             >
                {cat.name}
             </button>
           ))}
        </div>
      </div>
      
      {/* Search (Optional, only show if lots of items) */}
      <div className="px-4 py-4 bg-white">
         <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 text-gray-800 text-sm rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all border border-transparent focus:border-blue-200"
            />
         </div>
      </div>

      {/* Menu Content */}
      <div className="px-4 space-y-10 mt-2">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No items found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <section key={cat.name} id={`cat-${cat.name}`} className="scroll-mt-32 animate-fade-in-up">
              <div className="flex items-center gap-4 mb-6">
                 <h2 className="font-serif text-2xl font-bold text-gray-900">{cat.name}</h2>
                 <div className="h-px bg-gray-100 flex-1"></div>
              </div>
              <div className="space-y-6">
                {cat.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start group relative">
                    <div className="flex-1 pr-4">
                      <div className="flex items-baseline justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 text-base">{item.name}</h3>
                      </div>
                      {item.description && (
                          <p className="text-sm text-gray-500 leading-relaxed mb-2">
                            {item.description}
                          </p>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {item.tags.map((tag, tIdx) => (
                            <span key={tIdx} className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right pl-2">
                       <span className="font-medium text-gray-900 block whitespace-nowrap bg-gray-50 px-2 py-1 rounded-md text-sm">
                         {item.price}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Footer Branding */}
      <div className="mt-16 py-10 text-center bg-gray-50 border-t border-gray-100">
         <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
           <UtensilsCrossed size={14} />
           Menu Digitized by SnapMenu
         </p>
      </div>
    </div>
  );
};

export default MenuPreview;