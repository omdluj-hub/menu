import { useState, useEffect } from 'react';
import { X, ShoppingBag, ChevronRight, ChevronDown, Plus, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedForOptions, setSelectedForOptions] = useState<MenuItem | null>(null);
  const [currentOption, setCurrentOption] = useState<MenuOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setFetchError(null);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      
      const formattedData = data.map(item => ({
        ...item,
        subCategory: item.sub_category,
        maxCount: item.max_count
      }));
      
      setMenuItems(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setFetchError('메뉴 데이터를 불러오는 중 오류가 발생했습니다. 환경 변수 설정을 확인해 주세요.');
      setLoading(false);
    }
  };

  const handleSelectItem = (item: MenuItem) => {
    setSelectedForOptions(item);
    setQuantity(1);
    setSelectedType(null);
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
      setSelectedType(null);
    }
  };

  const removeItem = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  const handleRequest = async () => {
    if (selectedItems.length === 0 || !patientName) {
      alert('성함을 입력해주세요.');
      return;
    }
    try {
      const formattedItems = selectedItems.map(item => {
        const qtyStr = item.quantity > 1 ? ` x ${item.quantity}개` : '';
        return `${item.name} (${item.selectedOption.label})${qtyStr}`;
      });

      const { error } = await supabase.from('reservations').insert({
        patient_name: patientName,
        selected_items: formattedItems,
        status: '대기'
      });

      if (error) throw error;

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

  if (fetchError) return (
    <div className="flex flex-col items-center justify-center h-full bg-[#FAF9F6] p-8 text-center">
      <div className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 max-w-md">
        <h2 className="text-lg font-bold mb-2">오류 발생</h2>
        <p className="text-sm opacity-80">{fetchError}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl text-xs font-bold">다시 시도</button>
      </div>
    </div>
  );

  const categories = Array.from(new Set(menuItems.map(item => item.category)));
  const getSubCategories = (category: string) => {
    return Array.from(new Set(menuItems.filter(item => item.category === category && item.subCategory).map(item => item.subCategory))) as string[];
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
                  isSelected || (hasSubCats && isExpanded) ? 'bg-[#A89486] text-white shadow-lg' : 'text-[#9A8F8A] hover:bg-[#FAF9F6]'
                }`}
              >
                <span>{category}</span>
                {hasSubCats && <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />}
              </button>
              {hasSubCats && isExpanded && (
                <div className="pl-4 space-y-1">
                  {subCats.map(subCat => (
                    <button
                      key={subCat}
                      onClick={() => { setActiveCategory(category); setActiveSubCategory(subCat); }}
                      className={`w-full text-left px-6 py-4 rounded-xl text-xs font-black transition-all duration-300 ${
                        activeSubCategory === subCat ? 'text-[#A89486] bg-[#F8F5F2]' : 'text-[#DED9D4] hover:text-[#A89486]'
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
          {activeCategory === '' ? (
            <div className="min-h-[600px] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-1000">
              <div className="p-6 bg-white rounded-[2.5rem] shadow-[0_20px_40px_rgba(168,148,134,0.08)] border border-[#E9E4E0]">
                <img src="/images/logo.gif" alt="Hoo Clinic Logo" className="w-32 h-auto" />
              </div>
              <div className="space-y-4">
                <h2 className="text-[10px] font-black text-[#A89486] tracking-[0.6em] uppercase opacity-80">Premium Oriental Medicine Clinic</h2>
                <h1 className="text-4xl font-black text-[#2C2C2C] leading-[1.2] tracking-tight break-keep">건강한 아름다움의 시작,<br/><span className="text-[#A89486]">후한의원 구미점</span>입니다.</h1>
                <p className="text-lg text-[#9A8F8A] font-medium max-w-md mx-auto leading-relaxed break-keep">체질에 맞는 정교한 진단과 후한의원만의<br/>프리미엄 프로그램을 지금 확인해보세요.</p>
              </div>
            </div>
          ) : (
            menuItems.filter(item => item.category === activeCategory && (!activeSubCategory || item.subCategory === activeSubCategory)).map(item => (
              <div key={item.id} onClick={() => handleSelectItem(item)}
                className={`bg-white rounded-[2rem] overflow-hidden border-2 transition-all duration-500 flex items-center cursor-pointer group h-40 ${
                  selectedForOptions?.id === item.id ? 'border-[#A89486] bg-[#F8F5F2] shadow-xl translate-x-2' : 'border-[#F2EFEB] hover:border-[#DED9D4] shadow-sm hover:shadow-lg'
                }`}
              >
                <div className="w-56 h-full flex-shrink-0 overflow-hidden border-r border-[#F2EFEB]">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                </div>
                <div className="pl-10 pr-3 flex-1 flex items-center justify-between">
                  <div className="space-y-2 flex-1 pr-6">
                    <h3 className="text-2xl font-black text-[#2C2C2C] tracking-tight break-keep">{item.name}</h3>
                    <span className="bg-[#F2EFEB] text-[#9A8F8A] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{item.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <span className="text-2xl font-black text-[#A89486] tracking-tighter whitespace-nowrap">{formatPriceWithTilde(item.price)}</span>
                    <ChevronRight size={28} className={selectedForOptions?.id === item.id ? 'text-[#A89486]' : 'text-[#DED9D4]'} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <div className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-[#F2EFEB] z-[100]">
        {selectedForOptions ? (
          <div className="h-full flex flex-col bg-[#FCFBFA] animate-in slide-in-from-right duration-500">
            <div className="p-10 border-b flex justify-between items-center bg-white">
              <div><h2 className="text-2xl font-black text-[#2C2C2C]">Selection</h2><p className="text-xs text-[#9A8F8A] font-bold tracking-widest uppercase">Options & Details</p></div>
              <button onClick={() => setSelectedForOptions(null)} className="p-2 bg-[#FAF9F6] rounded-full"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              <div className="space-y-6">
                <div className="inline-block bg-[#A89486]/10 text-[#A89486] px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase">{selectedForOptions.subCategory || selectedForOptions.category}</div>
                <h3 className="text-3xl font-black tracking-tight text-[#2C2C2C]">{selectedForOptions.name}</h3>
                <div className="bg-white p-8 rounded-[2.5rem] border border-[#F2EFEB] shadow-sm"><p className="text-[#5D5451] leading-relaxed italic">"{selectedForOptions.description}"</p></div>
              </div>
              {selectedForOptions.maxCount && (
                <div className="space-y-6 bg-white p-8 rounded-[2rem] border border-[#F2EFEB]">
                  <p className="text-[10px] font-black text-[#9A8F8A] uppercase tracking-[0.3em]">수량 선택 (최대 {selectedForOptions.maxCount}개)</p>
                  <div className="flex items-center justify-center space-x-8">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-full border-2 text-[#A89486]"><Minus /></button>
                    <span className="text-4xl font-black text-[#2C2C2C]">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(selectedForOptions.maxCount || 1, quantity + 1))} className="w-12 h-12 rounded-full border-2 text-[#A89486]"><Plus /></button>
                  </div>
                </div>
              )}
              <div className="space-y-6">
                <p className="text-[10px] font-black text-[#9A8F8A] uppercase tracking-[0.3em]">{selectedForOptions.id === 621 && !selectedType ? '종 선택' : 'Choose Option'}</p>
                <div className="grid gap-4">
                  {selectedForOptions.id === 621 ? (
                    !selectedType ? ['2종', '3종', '4종'].map(type => (
                      <button key={type} onClick={() => { setSelectedType(type); const match = selectedForOptions.options.find(o => o.label.startsWith(type)); if (match) setCurrentOption(match); }}
                        className="w-full p-6 rounded-[1.8rem] border-2 bg-white flex justify-between items-center"><span className="text-lg font-black">{type} 선택</span><ChevronRight size={20} /></button>
                    )) : (
                      <>
                        <button onClick={() => setSelectedType(null)} className="text-xs font-bold text-[#A89486] mb-2">다시 선택하기 ({selectedType})</button>
                        {selectedForOptions.options.filter(o => o.label.startsWith(selectedType)).map((o, i) => (
                          <button key={i} onClick={() => setCurrentOption(o)} className={`w-full p-6 rounded-[1.8rem] border-2 text-left ${currentOption?.label === o.label ? 'border-[#A89486] bg-white shadow-md' : 'border-white bg-white'}`}>
                            <div className="flex items-center space-x-4"><div className={`w-3 h-3 rounded-full ${currentOption?.label === o.label ? 'bg-[#A89486]' : 'bg-[#F2EFEB]'}`} />
                            <div><p className="text-lg font-black">{o.label.split(' - ')[1]}</p><p className="text-sm font-bold text-[#A89486]">{formatPrice(o.price)}</p></div></div></button>
                        ))}
                      </>
                    )
                  ) : (
                    selectedForOptions.options.map((o, i) => (
                      <button key={i} onClick={() => setCurrentOption(o)} className={`w-full p-6 rounded-[1.8rem] border-2 text-left ${currentOption?.label === o.label ? 'border-[#A89486] bg-white shadow-md' : 'border-white bg-white'}`}>
                        <div className="flex items-center space-x-4"><div className={`w-3 h-3 rounded-full ${currentOption?.label === o.label ? 'bg-[#A89486]' : 'bg-[#F2EFEB]'}`} />
                        <div><p className="text-lg font-black">{o.label}</p><p className="text-sm font-bold text-[#A89486]">{formatPrice(o.price)}</p></div></div></button>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="p-10 bg-white border-t"><div className="flex justify-between items-end mb-8"><span className="text-xs font-black text-[#9A8F8A] tracking-widest">Total Price</span><span className="text-4xl font-black text-[#A89486]">{formatPrice(calculateTotalPrice())}</span></div>
              <button onClick={addToCart} className="w-full bg-[#2C2C2C] text-white py-6 rounded-[1.8rem] font-black text-xl hover:bg-[#A89486] flex items-center justify-center space-x-3"><ShoppingBag size={22} /><span>결정</span></button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-8 bg-[#FAF9F6]">
            <img src="/images/logo.gif" alt="Hoo Clinic" className="w-32 h-auto opacity-40" />
            <div className="space-y-3"><h3 className="text-xl font-black text-[#2C2C2C]">시술을 선택해주세요</h3><p className="text-sm text-[#9A8F8A]">왼쪽 메뉴에서 관심 있는 시술을 클릭하시면<br/>상세 정보와 가격 옵션을 확인하실 수 있습니다.</p></div>
          </div>
        )}
      </div>

      <div className={`fixed bottom-6 left-8 transition-all z-[200] ${selectedItems.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`} style={{ width: 'calc(100% - 460px)' }}>
        <div className="bg-white/95 backdrop-blur-2xl border p-4 rounded-[2.5rem] flex items-center justify-between shadow-2xl mx-auto">
          <div className="flex items-center pl-8 space-x-12">
            <div className="flex flex-col"><span className="text-[10px] font-black text-[#9A8F8A] uppercase tracking-widest mb-1">Selected Items</span>
              <div className="flex items-center space-x-4"><span className="text-2xl font-black text-[#A89486]">{selectedItems.length}</span>
                <div className="flex -space-x-3 overflow-hidden">
                  {selectedItems.slice(0, 4).map((item, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-[#F2EFEB] relative group">
                      <img src={item.image} className="w-full h-full object-cover rounded-full" alt="" />
                      <button onClick={() => removeItem(i)} className="absolute inset-0 bg-[#2C2C2C]/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white rounded-full"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-12 w-[1px] bg-[#F2EFEB]"></div>
            <div className="flex flex-col"><span className="text-[10px] font-black text-[#9A8F8A] uppercase tracking-widest mb-1">Patient Name</span>
              <input type="text" placeholder="성함 입력" className="bg-transparent border-none outline-none text-2xl font-black text-[#2C2C2C] w-56" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
            </div>
          </div>
          <button onClick={handleRequest} className="bg-[#A89486] text-white px-16 py-5 rounded-[1.8rem] font-black text-xl flex items-center space-x-4 shadow-xl shadow-[#A89486]/30"><ShoppingBag size={22} /><span>선택 완료</span></button>
        </div>
      </div>
    </div>
  );
};

export default PatientMenu;
