import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PatientMenu from './components/PatientMenu';
import StaffDashboard from './components/StaffDashboard';
import MenuAdmin from './components/MenuAdmin';
import AdminLogin from './components/AdminLogin';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <div className="h-screen bg-[#F8F9FB] font-sans text-gray-900 flex flex-col overflow-hidden">
        <nav className="bg-white/70 backdrop-blur-md border-b border-gray-100 px-10 py-5 flex justify-between items-center z-[60] flex-shrink-0">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            <img src="/images/logo.gif" alt="Hoo Clinic Logo" className="h-10 w-auto" />
            <div className="text-xl font-black text-gray-900 tracking-tighter uppercase">
              후한의원 <span className="text-[#A89486] font-bold">구미점</span>
            </div>
          </div>
          <div className="flex space-x-6">
            <button onClick={() => window.location.href = '/reservations'} className="text-xs font-black text-[#9A8F8A] hover:text-[#2C2C2C] uppercase tracking-widest transition-colors">Reservations</button>
            <button onClick={() => window.location.href = '/admin'} className="text-xs font-black text-[#9A8F8A] hover:text-[#2C2C2C] uppercase tracking-widest transition-colors">Admin</button>
          </div>
        </nav>

        <main className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<PatientMenu />} />
            <Route 
              path="/reservations" 
              element={isAuthenticated ? <div className="h-full overflow-y-auto p-4 md:p-8"><StaffDashboard /></div> : <AdminLogin onLogin={handleLogin} />} 
            />
            <Route 
              path="/admin" 
              element={isAuthenticated ? <MenuAdmin /> : <AdminLogin onLogin={handleLogin} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
