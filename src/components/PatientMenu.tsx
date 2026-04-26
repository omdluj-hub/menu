import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, Info, X, User, ShoppingBag, ChevronRight, ChevronDown, Plus, Minus } from 'lucide-react';

interface MenuOption {
  label: string;
  price: string;
}

interface MenuItem {
  id: number;
  category: string;
  subCategory?: string;
  name: string;
  price: string;
  description: string;
  duration: string;
  image: string;
  options: MenuOption[];
  maxCount?: number;
}

interface SelectedItem extends MenuItem {
  selectedOption: MenuOption;
  quantity: number;
}

const PatientMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedForOptions, setSelectedForOptions] = useState<MenuItem | null>(null);
  const [currentOption, setCurrentOption] = useState<MenuOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/menu');
      setMenuItems(response.data);
      if (response.data.length > 0) {
        const firstCat = response.data[0].category;
        setActiveCategory(firstCat);
        const firstItem = response.data[0];
        if (firstItem.subCategory) {
          setExpandedParent(firstCat);
          setActiveSubCategory(firstItem.subCategory);
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleSelectItem = (item: MenuItem) => {
    setSelectedForOptions(item);
    setQuantity(1);
    if (item.options && item.options.length > 0) {
      setCurrentOption(item.options[0]);
    }
  };

  const addToCart = () => {
    if (selectedForOptions && currentOption) {
      const newItem: SelectedItem = {
        ...selectedForOptions,
        selectedOption: currentOption,
        quantity: selectedForOptions.maxCount ? quantity : 1
      };
      setSelectedItems([...selectedItems, newItem]);
      setSelectedForOptions(null);
      setCurrentOption(null);
      setQuantity(1);
    }
  };

  const removeItem = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  const handleRequest = async () => {
    if (selectedItems.length === 0) return;
    try {
      const formattedItems = selectedItems.map(item => {
        const qtyStr = item.quantity > 1 ? ` x ${item.quantity}개` : '';
        return `${item.name} (${item.selectedOption.label})${qtyStr}`;
      });
      await axios.post('http://localhost:5000/api/request', {
        patientName,
        selectedItems: formattedItems
      });
      setMessage('상담 요청이 전송되었습니다.');
      setSelectedItems([]);
      setPatientName('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      alert('오류가 발생했습니다.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-[#FAF9F6]">
      <div className="w-10 h-10 border-4 border-[#E9E4E0] border-t-[#A89486] rounded-full animate-spin"></div>
    </div>
  );

  const categories = Array.from(new Set(menuItems.map(item => item.category)));
  
  const getSubCategories = (category: string) => {
    return Array.from(new Set(
      menuItems
        .filter(item => item.category === category && item.subCategory)
        .map(item => item.subCategory)
    )) as string[];
  };

  const formatPrice = (priceStr: string) => {
    const isNumeric = !isNaN(Number(priceStr.replace(/,/g, '')));
    return isNumeric ? `${priceStr}원` : priceStr;
  };

  const formatPriceWithTilde = (priceStr: string) => {
    const isNumeric = !isNaN(Number(priceStr.replace(/,/g, '')));
    return isNumeric ? `${priceStr}~` : priceStr;
  };

  const calculateTotalPrice = () => {
    if (!currentOption) return '';
    const numericPrice = Number(currentOption.price.replace(/,/g, ''));
    if (isNaN(numericPrice)) return currentOption.price;
    return (numericPrice * quantity).toLocaleString();
  };

  return (
    <div className="flex h-full bg-[#FAF9F6] text-[#2C2C2C] font-sans relative overflow-hidden">
      
      <nav className="w-72 bg-white border-r border-[#E9E4E0] flex flex-col p-6 space-y-2 pt-12 flex-shrink-0 shadow-[4px_0_15px_rgba(0,0,0,0.02)] overflow-y-auto">
        {categories.map(category => {
          const subCats = getSubCategories(category);
          const hasSubCats = subCats.length > 0;
          const isExpanded = expandedParent === category;
          const isSelected = activeCategory === category;
          
          return (
            <div key={category} className="space-y-1">
              <button
                onClick={() => {
                  setActiveCategory(category);
                  if (hasSubCats) {
                    setExpandedParent(isExpanded ? null : category);
                    if (!isExpanded) setActiveSubCategory(subCats[0]);
                  } else {
                    setActiveSubCategory(null);
                    setExpandedParent(null);
                  }
                }}
                className={`w-full text-left px-6 py-5 rounded-[1.25rem] text-sm font-bold transition-all duration-300 flex items-center justify-between ${
                  isSelected || (hasSubCats && isExpanded)
                  ? 'bg-[#A89486] text-white shadow-lg shadow-[#A89486]/20' 
                  : 'text-[#9A8F8A] hover:bg-[#FAF9F6] hover:text-[#5D5451]'
                }`}
              >
                <span>{category}</span>
                {hasSubCats && (
                  <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                )}
              </button>

              {hasSubCats && isExpanded && (
                <div className="pl-4 space-y-1 animate-in slide-in-from-top-2 duration-300">
                  {subCats.map(subCat => (
                    <button
                      key={subCat}
                      onClick={() => {
                        setActiveCategory(category);
                        setActiveSubCategory(subCat);
                      }}
                      className={`w-full text-left px-6 py-4 rounded-xl text-xs font-black transition-all duration-300 ${
                        activeSubCategory === subCat 
                        ? 'text-[#A89486] bg-[#F8F5F2]' 
                        : 'text-[#DED9D4] hover:text-[#A89486] hover:bg-[#FAF9F6]'
                      }`}
                    >
                      • {subCat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <main className="flex-1 overflow-y-auto p-12 relative pb-40 pr-[440px]">
        {message && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#5D5451] text-white px-10 py-4 rounded-full text-sm font-bold z-50 animate-in fade-in slide-in-from-top-4 shadow-2xl">
            {message}
          </div>
        )}

        <div className="flex flex-col space-y-6 w-full max-w-5xl">
          {menuItems
            .filter(item => item.category === activeCategory && (!activeSubCategory || item.subCategory === activeSubCategory))
            .map(item => {
            const isAnyOptionSelected = selectedItems.some(i => i.id === item.id);
            const isCurrentlySelected = selectedForOptions?.id === item.id;
            
            return (
              <div 
                key={item.id}
                className={`bg-white rounded-[2rem] overflow-hidden border-2 transition-all duration-500 flex items-center cursor-pointer group h-40 ${
                  isCurrentlySelected 
                  ? 'border-[#A89486] bg-[#F8F5F2] shadow-xl translate-x-2' 
                  : isAnyOptionSelected 
                    ? 'border-[#A89486]/30 bg-[#FBF9F7]' 
                    : 'border-[#F2EFEB] hover:border-[#DED9D4] shadow-sm hover:shadow-lg'
                }`}
                onClick={() => handleSelectItem(item)}
              >
                <div className="w-56 h-full flex-shrink-0 overflow-hidden border-r border-[#F2EFEB]">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                </div>

                <div className="pl-10 pr-3 flex-1 flex items-center justify-between">
                  <div className="space-y-2 flex-1 pr-6">
                    <h3 className="text-2xl font-black text-[#2C2C2C] tracking-tight break-keep">{item.name}</h3>
                    <div className="flex items-center space-x-4">
                      <span className="bg-[#F2EFEB] text-[#9A8F8A] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{item.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <span className="text-2xl font-black text-[#A89486] tracking-tighter whitespace-nowrap">
                      {formatPriceWithTilde(item.price)}
                    </span>
                    <div className={`transition-all duration-500 ${isCurrentlySelected ? 'translate-x-1 text-[#A89486]' : 'text-[#DED9D4] opacity-50'}`}>
                      <ChevronRight size={28} strokeWidth={3} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <div className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-[100] border-l border-[#F2EFEB]">
        {selectedForOptions ? (
          <div className="h-full flex flex-col bg-[#FCFBFA] animate-in slide-in-from-right duration-500">
            <div className="p-10 border-b border-[#F2EFEB] flex justify-between items-center bg-white">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-[#2C2C2C]">Selection</h2>
                <p className="text-xs text-[#9A8F8A] font-bold uppercase tracking-widest mt-1">Options & Details</p>
              </div>
              <button onClick={() => setSelectedForOptions(null)} className="p-2 bg-[#FAF9F6] rounded-full text-[#9A8F8A] hover:text-[#2C2C2C] transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              <div className="space-y-6">
                <div className="inline-block bg-[#A89486]/10 text-[#A89486] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  {selectedForOptions.subCategory || selectedForOptions.category}
                </div>
                <h3 className="text-3xl font-black mt-1 tracking-tight text-[#2C2C2C] leading-[1.1]">{selectedForOptions.name}</h3>
                
                <div className="bg-white p-8 rounded-[2.5rem] border border-[#F2EFEB] shadow-sm">
                  <p className="text-[10px] font-black text-[#DED9D4] uppercase tracking-[0.3em] mb-4">Detailed Description</p>
                  <p className="text-[#5D5451] leading-relaxed font-medium text-lg italic text-balance">
                    "{selectedForOptions.description}"
                  </p>
                </div>
              </div>

              {selectedForOptions.maxCount && (
                <div className="space-y-6 bg-white p-8 rounded-[2rem] border border-[#F2EFEB]">
                  <p className="text-[10px] font-black text-[#9A8F8A] uppercase tracking-[0.3em]">수량 선택 (최대 {selectedForOptions.maxCount}개)</p>
                  <div className="flex items-center justify-center space-x-8">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-full border-2 border-[#F2EFEB] flex items-center justify-center text-[#A89486] hover:bg-[#A89486] hover:text-white transition-all"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-4xl font-black text-[#2C2C2C] w-12 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(selectedForOptions.maxCount || 1, quantity + 1))}
                      className="w-12 h-12 rounded-full border-2 border-[#F2EFEB] flex items-center justify-center text-[#A89486] hover:bg-[#A89486] hover:text-white transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <p className="text-[10px] font-black text-[#9A8F8A] uppercase tracking-[0.3em] ml-2">Choose Option</p>
                <div className="grid gap-4">
                  {selectedForOptions.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentOption(option)}
                      className={`w-full p-6 rounded-[1.8rem] border-2 text-left transition-all duration-300 flex justify-between items-center ${
                        currentOption?.label === option.label
                        ? 'border-[#A89486] bg-white shadow-md'
                        : 'border-white bg-white hover:border-[#F2EFEB] shadow-sm'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${currentOption?.label === option.label ? 'bg-[#A89486] scale-125' : 'bg-[#F2EFEB]'}`} />
                        <div>
                          <p className={`text-lg font-black ${currentOption?.label === option.label ? 'text-[#2C2C2C]' : 'text-[#9A8F8A]'}`}>{option.label}</p>
                          <p className="text-sm font-bold text-[#A89486] mt-0.5">{formatPrice(option.price)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-10 bg-white border-t border-[#F2EFEB] shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-end mb-8">
                <span className="text-[10px] font-black text-[#9A8F8A] uppercase tracking-widest">Total Price</span>
                <span className="text-4xl font-black text-[#A89486] tracking-tighter">
                  {formatPrice(calculateTotalPrice())}
                </span>
              </div>
              <button 
                onClick={addToCart}
                className="w-full bg-[#2C2C2C] text-white py-6 rounded-[1.8rem] font-black text-xl hover:bg-[#A89486] transition-all duration-500 shadow-xl active:scale-95 flex items-center justify-center space-x-3"
              >
                <ShoppingBag size={22} />
                <span className="tracking-tight">결정</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-8 bg-[#FAF9F6]">
            <div className="relative">
              <div className="absolute inset-0 bg-[#A89486]/5 rounded-full scale-150 blur-3xl" />
              <img src="/images/logo.gif" alt="Hoo Clinic" className="w-32 h-auto relative z-10 opacity-40" />
            </div>
            <div className="space-y-3 relative z-10">
              <h3 className="text-xl font-black text-[#2C2C2C] tracking-tight">시술을 선택해주세요</h3>
              <p className="text-sm text-[#9A8F8A] leading-relaxed font-medium">
                왼쪽 메뉴에서 관심 있는 시술을 클릭하시면<br/>
                상세 정보와 가격 옵션을 확인하실 수 있습니다.
              </p>
            </div>
            <div className="w-12 h-[1px] bg-[#E9E4E0]" />
          </div>
        )}
      </div>

      <div className={`fixed bottom-6 left-8 transition-all duration-1000 z-[200] ${
        selectedItems.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
      }`} style={{ width: 'calc(100% - 460px)' }}>
        <div className="bg-white/95 backdrop-blur-2xl border border-[#F2EFEB] p-4 rounded-[2.5rem] flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.12)] mx-auto">
          <div className="flex items-center pl-8 space-x-12">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#9A8F8A] uppercase tracking-[0.25em] mb-1">Selected Items</span>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-black text-[#A89486] tracking-tighter">{selectedItems.length}</span>
                <div className="flex -space-x-3 overflow-hidden">
                  {selectedItems.slice(0, 4).map((item, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-[#F2EFEB] overflow-hidden shadow-sm relative group/item">
                      <img src={item.image} className="w-full h-full object-cover" alt="" />
                      <button 
                        onClick={() => removeItem(i)}
                        className="absolute inset-0 bg-[#2C2C2C]/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {selectedItems.length > 4 && (
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-[#FAF9F6] flex items-center justify-center text-xs font-black text-[#9A8F8A] shadow-sm">
                      +{selectedItems.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="h-12 w-[1px] bg-[#F2EFEB]"></div>
            
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#9A8F8A] uppercase tracking-[0.25em] mb-1">Patient Name</span>
              <input 
                type="text" 
                placeholder="성함 입력"
                className="bg-transparent border-none outline-none text-2xl font-black text-[#2C2C2C] placeholder:text-[#E9E4E0] w-56 tracking-tight"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={handleRequest}
            className="bg-[#A89486] text-white px-16 py-5 rounded-[1.8rem] font-black text-xl hover:bg-[#8F7C70] transition-all duration-500 flex items-center space-x-4 active:scale-95 shadow-xl shadow-[#A89486]/30"
          >
            <ShoppingBag size={22} />
            <span className="tracking-tight">선택 완료</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientMenu;
