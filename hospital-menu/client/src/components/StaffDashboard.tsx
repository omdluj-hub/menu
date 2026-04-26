import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Check, Clock, User, ClipboardList } from 'lucide-react';

interface Request {
  id: number;
  patientName: string;
  selectedItems: string[];
  status: string;
  timestamp: string;
}

const StaffDashboard = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/requests');
      setRequests(response.data.reverse());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/requests/${id}`, { status });
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-10">
      <header className="flex justify-between items-end border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Consultation Dashboard</h1>
          <p className="text-gray-400 mt-2 font-medium">실시간 환자 상담 요청 내역을 관리합니다.</p>
        </div>
        <button 
          onClick={fetchRequests}
          className="flex items-center space-x-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl hover:bg-gray-50 transition-all shadow-sm font-bold text-gray-600"
        >
          <RefreshCw size={18} />
          <span>새로고침</span>
        </button>
      </header>

      <div className="grid gap-6">
        {requests.length === 0 ? (
          <div className="bg-white p-24 text-center rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center space-y-4">
            <ClipboardList size={64} className="text-gray-100" />
            <p className="text-gray-300 text-xl font-medium">현재 대기 중인 상담 요청이 없습니다.</p>
          </div>
        ) : (
          requests.map(req => (
            <div 
              key={req.id} 
              className={`group bg-white p-8 rounded-[2.5rem] shadow-sm border-2 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-8 ${
                req.status === '대기 중' ? 'border-blue-50/50 hover:border-blue-100' : 'border-transparent opacity-60'
              }`}
            >
              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    req.status === '대기 중' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <User size={24} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-2xl font-black text-gray-900">{req.patientName || '익명 환자'}</h3>
                      <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                        req.status === '대기 중' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm font-medium mt-1">{req.timestamp}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pl-16">
                  {req.selectedItems.map((item, idx) => (
                    <span key={idx} className="bg-blue-50/50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100/50">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="md:pl-8 border-l border-gray-100 flex items-center">
                {req.status === '대기 중' ? (
                  <button 
                    onClick={() => updateStatus(req.id, '상담 완료')}
                    className="w-full md:w-auto bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] font-bold hover:bg-blue-600 transition-all flex items-center justify-center space-x-3 shadow-xl active:scale-95"
                  >
                    <Check size={20} />
                    <span>상담 완료 처리</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => updateStatus(req.id, '대기 중')}
                    className="w-full md:w-auto bg-gray-100 text-gray-500 px-8 py-4 rounded-[1.5rem] font-bold hover:bg-white hover:border-gray-200 border border-transparent transition-all flex items-center justify-center space-x-3"
                  >
                    <Clock size={20} />
                    <span>다시 대기로 변경</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
