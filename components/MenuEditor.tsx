import React, { useState } from 'react';
import { MenuData, MenuCategory, MenuItem } from '../types';
import { Trash2, Plus, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

interface MenuEditorProps {
  data: MenuData;
  onSave: (data: MenuData) => void;
  onCancel: () => void;
}

const MenuEditor: React.FC<MenuEditorProps> = ({ data, onSave, onCancel }) => {
  const [menu, setMenu] = useState<MenuData>(data);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);

  const updateRestaurantName = (name: string) => {
    setMenu({ ...menu, restaurantName: name });
  };

  const updateCategoryName = (index: number, name: string) => {
    const newCategories = [...menu.categories];
    newCategories[index].name = name;
    setMenu({ ...menu, categories: newCategories });
  };

  const deleteCategory = (index: number) => {
    const newCategories = [...menu.categories];
    newCategories.splice(index, 1);
    setMenu({ ...menu, categories: newCategories });
  };

  const addCategory = () => {
    setMenu({
      ...menu,
      categories: [
        ...menu.categories,
        { name: "New Category", items: [] }
      ]
    });
    setExpandedCategory(menu.categories.length);
  };

  const updateItem = (catIndex: number, itemIndex: number, field: keyof MenuItem, value: string) => {
    const newCategories = [...menu.categories];
    const item = newCategories[catIndex].items[itemIndex];
    if (field === 'tags') {
       // Simple comma separated split for editing tags
       (item as any)[field] = value.split(',').map(s => s.trim()).filter(s => s);
    } else {
       (item as any)[field] = value;
    }
    setMenu({ ...menu, categories: newCategories });
  };

  const deleteItem = (catIndex: number, itemIndex: number) => {
    const newCategories = [...menu.categories];
    newCategories[catIndex].items.splice(itemIndex, 1);
    setMenu({ ...menu, categories: newCategories });
  };

  const addItem = (catIndex: number) => {
    const newCategories = [...menu.categories];
    newCategories[catIndex].items.push({
      name: "New Item",
      description: "",
      price: "0.00",
      tags: []
    });
    setMenu({ ...menu, categories: newCategories });
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-serif text-gray-800">Edit Menu</h2>
        <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">
                Back
            </button>
            <button 
            onClick={() => onSave(menu)}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md"
            >
            Save & Preview
            </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Restaurant Info */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <label className="block text-sm font-medium text-gray-500 mb-1">Restaurant Name</label>
          <input
            type="text"
            value={menu.restaurantName}
            onChange={(e) => updateRestaurantName(e.target.value)}
            className="w-full text-xl font-bold border-b border-gray-200 focus:border-blue-500 outline-none pb-2"
          />
        </div>

        {/* Categories */}
        {menu.categories.map((cat, catIndex) => (
          <div key={catIndex} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div 
              className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer border-b border-gray-100"
              onClick={() => setExpandedCategory(expandedCategory === catIndex ? null : catIndex)}
            >
              <div className="flex items-center gap-3 flex-1">
                 <GripVertical size={18} className="text-gray-400" />
                 <input
                    type="text"
                    value={cat.name}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateCategoryName(catIndex, e.target.value)}
                    className="bg-transparent font-bold text-gray-700 w-full outline-none focus:text-blue-600"
                 />
              </div>
              <div className="flex items-center gap-2">
                 <button 
                   onClick={(e) => { e.stopPropagation(); deleteCategory(catIndex); }}
                   className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                 >
                   <Trash2 size={16} />
                 </button>
                 {expandedCategory === catIndex ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
              </div>
            </div>

            {expandedCategory === catIndex && (
              <div className="p-4 space-y-4">
                {cat.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors group">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(catIndex, itemIndex, 'name', e.target.value)}
                          placeholder="Item Name"
                          className="font-semibold text-gray-800 w-full bg-transparent outline-none border-b border-dashed border-gray-300 focus:border-blue-400"
                        />
                         <input
                          type="text"
                          value={item.price}
                          onChange={(e) => updateItem(catIndex, itemIndex, 'price', e.target.value)}
                          placeholder="$0.00"
                          className="font-medium text-gray-800 w-20 text-right bg-transparent outline-none border-b border-dashed border-gray-300 focus:border-blue-400"
                        />
                      </div>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(catIndex, itemIndex, 'description', e.target.value)}
                        placeholder="Description..."
                        className="text-sm text-gray-500 w-full bg-transparent outline-none"
                      />
                      <input
                        type="text"
                        value={item.tags?.join(', ') || ''}
                        onChange={(e) => updateItem(catIndex, itemIndex, 'tags', e.target.value)}
                        placeholder="Tags (e.g. Spicy, Vegan)"
                        className="text-xs text-blue-500 w-full bg-transparent outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => deleteItem(catIndex, itemIndex)}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 self-start mt-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => addItem(catIndex)}
                  className="w-full py-3 flex items-center justify-center gap-2 text-sm text-blue-600 font-medium border border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>
            )}
          </div>
        ))}

        <button 
          onClick={addCategory}
          className="w-full py-4 flex items-center justify-center gap-2 text-gray-500 font-medium border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>
    </div>
  );
};

export default MenuEditor;
