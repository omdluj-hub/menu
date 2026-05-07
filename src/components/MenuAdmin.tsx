import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Search, Upload, ImageIcon, ChevronDown, ArrowUp, ArrowDown, Edit3, X } from 'lucide-react';
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
  sort_order?: number;
}

const MenuAdmin = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching items:', error);
      return;
    }

    const formattedData = data.map(item => ({
      ...item,
      subCategory: item.sub_category,
      maxCount: item.max_count
    }));
    setItems(formattedData);
    
    // Set initial active category if none selected
    if (formattedData.length > 0 && !activeCategory) {
      setActiveCategory(formattedData[0].category);
    }
  };

  const categories = Array.from(new Set(items.map(i => i.category)));
  const getSubCategories = (category: string) => {
    return Array.from(new Set(items.filter(item => item.category === category && item.subCategory).map(item => item.subCategory))) as string[];
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingItem({
      name: '', 
      category: activeCategory || categories[0] || '신규 카테고리', 
      subCategory: activeSubCategory || '', 
      price: '0', 
      description: '', 
      duration: '30분', 
      image: '/images/menu_1.png', 
      options: [{label: '기본', price: '0'}]
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    
    try {
      const { error } = await supabase.storage
        .from('menu-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('menu-images')
        .getPublicUrl(fileName);

      if (editingItem) {
        setEditingItem({ ...editingItem, image: publicUrl.publicUrl });
      }
      alert('이미지가 업로드되었습니다.');
    } catch (error) {
      console.error('Upload error:', error);
      alert('이미지 업로드 실패. Storage 버킷 설정을 확인하세요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editingItem?.name || !editingItem?.category) {
      alert('항목명과 카테고리는 필수 입력 사항입니다.');
      return;
    }

    const payload = {
      category: editingItem.category,
      sub_category: editingItem.subCategory || null,
      name: editingItem.name,
      price: editingItem.price,
      description: editingItem.description,
      duration: editingItem.duration,
      image: editingItem.image,
      options: editingItem.options,
      max_count: editingItem.maxCount || null
    };

    try {
      if (isAdding) {
        const { error: insertError } = await supabase.from('menu_items').insert(payload);
        if (insertError) throw insertError;
      } else {
        const { error } = await supabase
          .from('menu_items')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
      }

      alert('데이터베이스에 저장되었습니다.');
      fetchItems();
      setIsAdding(false);
      setEditingItem(null);
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`저장 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) alert('삭제 실패');
      else fetchItems();
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const viewItems = items.filter(item => 
      item.category === activeCategory && 
      (!activeSubCategory || item.subCategory === activeSubCategory)
    );
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= viewItems.length) return;

    const item1 = viewItems[index];
    const item2 = viewItems[newIndex];

    // Check if sort_order exists (handling both null and undefined)
    if (item1.sort_order === undefined || item1.sort_order === null || 
        item2.sort_order === undefined || item2.sort_order === null) {
      alert('일부 항목에 sort_order 값이 없습니다. 페이지를 새로고침하거나, SQL 에디터에서 UPDATE menu_items SET sort_order = id; 명령어를 실행해주세요.');
      return;
    }

    try {
      // Swap sort_order values
      const { error: error1 } = await supabase
        .from('menu_items')
        .update({ sort_order: item2.sort_order })
        .eq('id', item1.id);
      
      const { error: error2 } = await supabase
        .from('menu_items')
        .update({ sort_order: item1.sort_order })
        .eq('id', item2.id);

      if (error1 || error2) throw (error1 || error2);

      fetchItems();
    } catch (error: any) {
      console.error('Move error:', error);
      alert('순서 변경 실패');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === '' || item.category === activeCategory;
    const matchesSubCategory = !activeSubCategory || item.subCategory === activeSubCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  return (
    <div className="flex h-full bg-[#FAF9F6] text-[#2C2C2C] font-sans relative overflow-hidden">
      {/* Sidebar - Same as PatientMenu */}
      <nav className="w-72 bg-white border-r border-[#E9E4E0] flex flex-col p-6 space-y-2 pt-12 flex-shrink-0 shadow-[4px_0_15px_rgba(0,0,0,0.02)] overflow-y-auto">
        <div className="mb-6 px-4">
          <h2 className="text-xs font-black text-[#A89486] uppercase tracking-[0.2em] mb-4">Categories</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#DED9D4]" size={14} />
            <input 
              type="text" 
              placeholder="Search items..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF9F6] rounded-xl text-xs outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
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
                className={`w-full text-left px-6 py-4 rounded-[1.25rem] text-sm font-bold transition-all duration-300 flex items-center justify-between ${
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
                      className={`w-full text-left px-6 py-3 rounded-xl text-xs font-black transition-all duration-300 ${
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
        <button 
          onClick={() => { setIsAdding(true); setEditingItem({ name: '', category: '신규 카테고리', options: [] }); }}
          className="mt-6 w-full py-4 border-2 border-dashed border-[#E9E4E0] rounded-[1.25rem] text-[#9A8F8A] text-xs font-bold hover:border-[#A89486] hover:text-[#A89486] transition-all flex items-center justify-center space-x-2"
        >
          <Plus size={16} />
          <span>신규 카테고리 추가</span>
        </button>
      </nav>

      <main className="flex-1 overflow-y-auto p-12 relative pb-40">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#2C2C2C] tracking-tight">{activeCategory || '전체 메뉴'}</h1>
            <p className="text-[#9A8F8A] font-bold uppercase text-[10px] tracking-[0.3em] mt-1">{activeSubCategory || 'Main Category'}</p>
          </div>
          <button 
            onClick={handleAdd}
            className="bg-[#2C2C2C] text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-[#A89486] transition-all flex items-center space-x-2 shadow-xl"
          >
            <Plus size={18} />
            <span>이 카테고리에 항목 추가</span>
          </button>
        </div>

        <div className="flex flex-col space-y-6 w-full max-w-5xl">
          {filteredItems.map((item, index) => (
            <div key={item.id}
              className="bg-white rounded-[2rem] overflow-hidden border-2 border-[#F2EFEB] hover:border-[#A89486]/30 transition-all duration-500 flex items-center shadow-sm hover:shadow-lg h-40 group"
            >
              <div className="w-56 h-full flex-shrink-0 overflow-hidden border-r border-[#F2EFEB]">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="pl-10 pr-8 flex-1 flex items-center justify-between">
                <div className="space-y-2 flex-1 pr-6">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-2xl font-black text-[#2C2C2C] tracking-tight">{item.name}</h3>
                    <span className="bg-[#F2EFEB] text-[#9A8F8A] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{item.duration}</span>
                  </div>
                  <p className="text-sm text-[#9A8F8A] font-medium line-clamp-1">{item.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col space-y-1 mr-4">
                    <button onClick={() => moveItem(index, 'up')} className="p-2 hover:bg-[#FAF9F6] rounded-lg text-[#DED9D4] hover:text-[#A89486] transition-all"><ArrowUp size={16} /></button>
                    <button onClick={() => moveItem(index, 'down')} className="p-2 hover:bg-[#FAF9F6] rounded-lg text-[#DED9D4] hover:text-[#A89486] transition-all"><ArrowDown size={16} /></button>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(item)} className="p-4 bg-[#FAF9F6] text-[#A89486] rounded-2xl hover:bg-[#A89486] hover:text-white transition-all shadow-sm"><Edit3 size={20} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-4 bg-[#FAF9F6] text-red-300 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={20} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Edit/Add Modal Overlay */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-[#FAF9F6] w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-12 py-8 bg-white border-b flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-[#2C2C2C] tracking-tight">{isAdding ? 'New Menu Item' : 'Edit Menu Item'}</h2>
                <p className="text-xs text-[#9A8F8A] font-bold uppercase tracking-widest mt-1">Cloud Database Real-time Editor</p>
              </div>
              <button onClick={() => setEditingItem(null)} className="p-4 bg-[#FAF9F6] rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Upload Area */}
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-[#9A8F8A] tracking-widest uppercase ml-1">Item Preview Image</label>
                  <div className="relative group aspect-video rounded-[2.5rem] overflow-hidden border-2 border-dashed border-[#E9E4E0] bg-white flex items-center justify-center">
                    {editingItem.image ? (
                      <img src={editingItem.image} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <ImageIcon size={48} className="text-[#DED9D4]" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white space-y-2 cursor-pointer">
                      <Upload size={32} />
                      <span className="text-xs font-black uppercase">Change Image</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  {isUploading && <p className="text-center text-xs font-bold text-[#A89486] animate-pulse">이미지 업로드 중...</p>}
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#9A8F8A] tracking-widest uppercase ml-1">항목명</label>
                    <input className="w-full p-5 bg-white border-2 border-transparent focus:border-[#A89486] rounded-2xl outline-none font-bold transition-all shadow-sm" value={editingItem.name} onChange={(e) => setEditingItem({...editingItem, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#9A8F8A] tracking-widest uppercase ml-1">카테고리</label>
                      <select className="w-full p-5 bg-white border-2 border-transparent focus:border-[#A89486] rounded-2xl outline-none font-bold transition-all shadow-sm appearance-none" value={editingItem.category} onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="직접 입력">+ 신규 추가</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#9A8F8A] tracking-widest uppercase ml-1">서브 카테고리</label>
                      <input className="w-full p-5 bg-white border-2 border-transparent focus:border-[#A89486] rounded-2xl outline-none font-bold transition-all shadow-sm" value={editingItem.subCategory} onChange={(e) => setEditingItem({...editingItem, subCategory: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9A8F8A] tracking-widest uppercase ml-1">기본 가격</label>
                  <input className="w-full p-5 bg-white border-2 border-transparent focus:border-[#A89486] rounded-2xl outline-none font-bold transition-all shadow-sm" value={editingItem.price} onChange={(e) => setEditingItem({...editingItem, price: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9A8F8A] tracking-widest uppercase ml-1">소요 시간</label>
                  <input className="w-full p-5 bg-white border-2 border-transparent focus:border-[#A89486] rounded-2xl outline-none font-bold transition-all shadow-sm" value={editingItem.duration} onChange={(e) => setEditingItem({...editingItem, duration: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#9A8F8A] tracking-widest uppercase ml-1">최대 선택 개수</label>
                  <input type="number" className="w-full p-5 bg-white border-2 border-transparent focus:border-[#A89486] rounded-2xl outline-none font-bold transition-all shadow-sm" value={editingItem.maxCount || ''} onChange={(e) => setEditingItem({...editingItem, maxCount: parseInt(e.target.value) || undefined})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#9A8F8A] tracking-widest uppercase ml-1">상세 설명</label>
                <textarea rows={3} className="w-full p-5 bg-white border-2 border-transparent focus:border-[#A89486] rounded-2xl outline-none font-medium transition-all shadow-sm" value={editingItem.description} onChange={(e) => setEditingItem({...editingItem, description: e.target.value})} />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-[#9A8F8A] tracking-widest uppercase ml-1">상세 옵션 및 가격</label>
                  <button onClick={() => setEditingItem({...editingItem, options: [...(editingItem.options || []), { label: '', price: '' }]})} className="bg-[#A89486]/10 text-[#A89486] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 hover:bg-[#A89486] hover:text-white transition-all">
                    <Plus size={14} /><span>옵션 추가</span>
                  </button>
                </div>
                <div className="grid gap-3">
                  {editingItem.options?.map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-3 group">
                      <input placeholder="옵션명" className="flex-1 p-5 bg-white border-2 border-transparent focus:border-[#A89486] rounded-2xl outline-none font-bold text-sm shadow-sm" value={opt.label} onChange={(e) => { const newOpts = [...(editingItem.options || [])]; newOpts[idx].label = e.target.value; setEditingItem({ ...editingItem, options: newOpts }); }} />
                      <input placeholder="가격" className="flex-1 p-5 bg-white border-2 border-transparent focus:border-[#A89486] rounded-2xl outline-none font-bold text-sm shadow-sm" value={opt.price} onChange={(e) => { const newOpts = [...(editingItem.options || [])]; newOpts[idx].price = e.target.value; setEditingItem({ ...editingItem, options: newOpts }); }} />
                      <button onClick={() => { const newOpts = [...(editingItem.options || [])]; newOpts.splice(idx, 1); setEditingItem({ ...editingItem, options: newOpts }); }} className="p-4 text-red-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={20} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-10 bg-white border-t flex space-x-4">
              <button onClick={() => setEditingItem(null)} className="flex-1 py-5 rounded-[1.5rem] font-black text-gray-400 hover:bg-gray-50 transition-all uppercase tracking-widest">Discard Changes</button>
              <button onClick={handleSave} className="flex-[2] bg-[#2C2C2C] text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-[#A89486] flex items-center justify-center space-x-3 shadow-xl transition-all">
                <Save size={22} /><span>Cloud Synchronize</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuAdmin;

