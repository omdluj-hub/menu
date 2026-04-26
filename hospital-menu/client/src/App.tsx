import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PatientMenu from './components/PatientMenu';
import StaffDashboard from './components/StaffDashboard';

function App() {
  return (
    <Router>
      <div className="h-screen bg-[#F8F9FB] font-sans text-gray-900 flex flex-col overflow-hidden">
        <nav className="bg-white/70 backdrop-blur-md border-b border-gray-100 px-10 py-5 flex justify-between items-center z-[60] flex-shrink-0">
          <div className="flex items-center space-x-3">
            <img src="/images/logo.gif" alt="Hoo Clinic Logo" className="h-10 w-auto" onError={(e) => (e.currentTarget.style.display = 'none')} />
            <div className="text-xl font-black text-gray-900 tracking-tighter uppercase">
              후한의원 <span className="text-blue-600 font-bold">구미점</span>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<PatientMenu />} />
            <Route path="/admin" element={<div className="h-full overflow-y-auto p-4 md:p-8"><StaffDashboard /></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
