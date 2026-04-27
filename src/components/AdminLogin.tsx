import { useState } from 'react';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'gnrnal1075') {
      sessionStorage.setItem('adminAuthenticated', 'true');
      onLogin();
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#FAF9F6] z-[200] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-[#E9E4E0] p-12 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-[#A89486] rounded-2xl flex items-center justify-center shadow-lg shadow-[#A89486]/20">
            <Lock className="text-white" size={32} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-[#2C2C2C]">Admin Access</h1>
            <p className="text-xs text-[#9A8F8A] font-bold uppercase tracking-widest mt-1">Gumi Hoo Clinic Management</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#9A8F8A] tracking-[0.2em] uppercase ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full p-5 bg-[#FAF9F6] border-2 rounded-2xl outline-none text-center text-xl font-black tracking-[0.5em] transition-all ${
                error ? 'border-red-400 shake-animation' : 'border-transparent focus:border-[#A89486]'
              }`}
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#2C2C2C] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#A89486] transition-all shadow-xl shadow-black/10"
          >
            접속하기
          </button>
        </form>

        {error && (
          <p className="text-center text-red-500 text-xs font-bold animate-bounce">비밀번호가 일치하지 않습니다.</p>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
