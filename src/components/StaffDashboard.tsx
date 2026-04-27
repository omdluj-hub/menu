import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, CheckCircle, Clock, Search } from 'lucide-react';

interface Reservation {
  id: number;
  patient_name: string;
  selected_items: string[];
  status: string;
  timestamp: string;
}

const StaffDashboard = () => {
  const [requests, setRequests] = useState<Reservation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRequests();
    
    // 실시간 구독 설정 (Realtime)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        () => fetchRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching reservations:', error);
      return;
    }
    setRequests(data);
  };

  const updateStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) alert('상태 업데이트 실패');
    else fetchRequests();
  };

  const deleteRequest = async (id: number) => {
    if (window.confirm('기록을 삭제하시겠습니까?')) {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);
      
      if (error) alert('삭제 실패');
      else fetchRequests();
    }
  };

  const filteredRequests = requests.filter(req => 
    req.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#2C2C2C] tracking-tight">예약 요청 확인</h1>
          <p className="text-[#9A8F8A] font-medium mt-1 uppercase text-xs tracking-widest">Real-time incoming patient requests</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#DED9D4]" size={18} />
          <input 
            type="text" 
            placeholder="환자 성함 검색..."
            className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl shadow-sm border border-[#E9E4E0] outline-none focus:ring-2 focus:ring-[#A89486]/20 transition-all font-bold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <div key={req.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#E9E4E0] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group hover:shadow-xl hover:border-[#A89486]/30 transition-all duration-500">
              <div className="flex items-center space-x-8 w-full md:w-auto">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                  req.status === '완료' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-400'
                }`}>
                  {req.status === '완료' ? <CheckCircle size={28} /> : <Clock size={28} className="animate-pulse" />}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-2xl font-black text-[#2C2C2C] tracking-tight">{req.patient_name} 님</h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      req.status === '완료' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                    }`}>{req.status}</span>
                  </div>
                  <p className="text-xs text-[#DED9D4] font-bold uppercase tracking-tighter">
                    {new Date(req.timestamp).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-wrap gap-2">
                {req.selected_items.map((item, i) => (
                  <span key={i} className="bg-[#FAF9F6] border border-[#F2EFEB] text-[#5D5451] px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                {req.status !== '완료' && (
                  <button 
                    onClick={() => updateStatus(req.id, '완료')}
                    className="flex-1 md:flex-none bg-[#2C2C2C] text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-green-600 transition-all"
                  >
                    완료 처리
                  </button>
                )}
                <button 
                  onClick={() => deleteRequest(req.id)}
                  className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[3rem] p-20 border-2 border-dashed border-[#E9E4E0] text-center space-y-4 opacity-40">
            <Clock size={48} className="mx-auto text-[#A89486]" />
            <p className="text-xl font-bold text-[#9A8F8A]">새로운 예약 요청이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
