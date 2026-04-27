import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Search, Upload, ImageIcon } from 'lucide-react';
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

const MenuAdmin = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingItem, setSelectedEditingItem] = useState<MenuItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '', category: '', subCategory: '', price: '', description: '', duration: '', image: '', options: []
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
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
  };

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];

  const handleEdit = (item: MenuItem) => {
    setSelectedEditingItem(item);
    setFormData(item);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setSelectedEditingItem(null);
    setFormData({
      name: '', 
      category: items[0]?.category || '신규 카테고리', 
      subCategory: '', 
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

      setFormData({ ...formData, image: publicUrl.publicUrl });
      alert('이미지가 업로드되었습니다.');
    } catch (error) {
      console.error('Upload error:', error);
      alert('이미지 업로드 실패. Storage 버킷 설정을 확인하세요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    const payload = {
      category: formData.category,
      sub_category: formData.subCategory || null,
      name: formData.name,
      price: formData.price,
      description: formData.description,
      duration: formData.duration,
      image: formData.image,
      options: formData.options,
      max_count: formData.maxCount || null
    };

    try {
      if (isAdding) {
        const { error } = await supabase.from('menu_items').insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('menu_items')
          .update(payload)
          .eq('id', formData.id);
        if (error) throw error;
      }

      alert('데이터베이스에 저장되었습니다.');
      fetchItems();
      setIsAdding(false);
      setSelectedEditingItem(null);
    } catch (error) {
      console.error('Save error:', error);
      alert('저장 실패');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) alert('삭제 실패');
      else fetchItems();
    }
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...(formData.options || []), { label: '', price: '' }] });
  };

  const removeOption = (idx: number) => {
    const newOpts = [...(formData.options || [])];
    newOpts.splice(idx, 1);
    setFormData({ ...formData, options: newOpts });
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full bg-[#FAF9F6] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#E9E4E0] px-10 py-6 flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-[#2C2C2C] tracking-tight">메뉴 관리자 (Supabase DB)</h1>
          <p className="text-xs text-[#9A8F8A] font-bold uppercase tracking-widest mt-1">Real-time Cloud Database Management</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-[#A89486] text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-[#8F7C70] transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus size={18} />
          <span>신규 항목 추가</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar List */}
        <div className="w-96 border-r border-[#E9E4E0] bg-white flex flex-col">
          <div className="p-6 space-y-4 border-b">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#DED9D4]" size={16} />
              <input 
                type="text" 
                placeholder="항목 검색..."
                className="w-full pl-11 pr-4 py-3 bg-[#FAF9F6] rounded-xl text-sm outline-none"
                value={searchQuery}
                onChange={(e) => setSearchSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex overflow-x-auto space-x-2 pb-2 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    activeCategory === cat ? 'bg-[#2C2C2C] text-white' : 'bg-[#FAF9F6] text-[#9A8F8A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredItems.map(item => (
              <div 
                key={item.id}
                onClick={() => handleEdit(item)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                  editingItem?.id === item.id ? 'border-[#A89486] bg-[#FBF9F7]' : 'border-transparent hover:bg-[#FAF9F6]'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <img src={item.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-[#A89486] truncate tracking-tighter">{item.category}</p>
                    <h3 className="font-bold text-[#2C2C2C] truncate">{item.name}</h3>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 rounded-full transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto bg-[#FAF9F6] p-12">
          {(editingItem || isAdding) ? (
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-[#2C2C2C] tracking-tight">{isAdding ? 'New Item' : 'Edit Item'}</h2>
                  <p className="text-[#9A8F8A] font-medium mt-1">클라우드 DB에 실시간으로 반영됩니다.</p>
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => { setSelectedEditingItem(null); setIsAdding(false); }} className="px-6 py-3 rounded-xl font-bold text-[#9A8F8A]">취소</button>
                  <button onClick={handleSave} className="bg-[#2C2C2C] text-white px-10 py-3 rounded-xl font-black shadow-xl hover:bg-[#A89486] flex items-center space-x-2 transition-all">
                    <Save size={18} />
                    <span>클라우드 저장</span>
                  </button>
                </div>
              </div>

              {/* Image Upload Box */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-[#E9E4E0] shadow-sm flex flex-col items-center space-y-6">
                <div className="relative group w-48 h-48 rounded-[2rem] overflow-hidden border-2 border-dashed border-[#E9E4E0] flex items-center justify-center bg-[#FAF9F6]">
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <ImageIcon size={48} className="text-[#DED9D4]" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload size={32} className="text-white" />
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-[#A89486] uppercase tracking-widest">{isUploading ? '업로드 중...' : '클릭하여 이미지 업로드'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-[#9A8F8A] tracking-widest ml-1 uppercase">항목명</label>
                  <input className="w-full p-4 bg-white border rounded-2xl outline-none font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-[#9A8F8A] tracking-widest ml-1 uppercase">카테고리</label>
                  <input className="w-full p-4 bg-white border rounded-2xl outline-none font-bold" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-[#9A8F8A] tracking-widest ml-1 uppercase">서브 카테고리</label>
                  <input className="w-full p-4 bg-white border rounded-2xl outline-none font-bold" value={formData.subCategory} onChange={(e) => setFormData({...formData, subCategory: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-[#9A8F8A] tracking-widest ml-1 uppercase">기본 가격</label>
                  <input className="w-full p-4 bg-white border rounded-2xl outline-none font-bold" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-[#9A8F8A] tracking-widest ml-1 uppercase">소요 시간</label>
                  <input className="w-full p-4 bg-white border rounded-2xl outline-none font-bold" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-[#9A8F8A] tracking-widest ml-1 uppercase">이미지 URL</label>
                  <input className="w-full p-4 bg-white border rounded-2xl outline-none font-bold text-[#A89486]" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} /></div>
                <div className="col-span-2 space-y-2"><label className="text-[10px] font-black text-[#9A8F8A] tracking-widest ml-1 uppercase">상세 설명</label>
                  <textarea rows={3} className="w-full p-4 bg-white border rounded-2xl outline-none font-medium" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
              </div>

              <div className="space-y-4 pb-20">
                <div className="flex justify-between items-center"><label className="text-[10px] font-black text-[#9A8F8A] tracking-widest uppercase">상세 옵션</label>
                  <button onClick={addOption} className="text-[#A89486] font-black text-[10px] flex items-center space-x-1 hover:underline"><Plus size={12} /><span>옵션 추가</span></button></div>
                <div className="space-y-3">
                  {formData.options?.map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <input placeholder="옵션명" className="flex-1 p-4 bg-white border rounded-xl outline-none font-bold text-sm" value={opt.label} onChange={(e) => { const newOpts = [...(formData.options || [])]; newOpts[idx].label = e.target.value; setFormData({ ...formData, options: newOpts }); }} />
                      <input placeholder="가격" className="flex-1 p-4 bg-white border rounded-xl outline-none font-bold text-sm" value={opt.price} onChange={(e) => { const newOpts = [...(formData.options || [])]; newOpts[idx].price = e.target.value; setFormData({ ...formData, options: newOpts }); }} />
                      <button onClick={() => removeOption(idx)} className="p-4 text-red-300"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-40 space-y-4"><ImageIcon size={48} /><p className="font-bold">항목을 선택하여 클라우드 DB를 관리하세요.</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuAdmin;
