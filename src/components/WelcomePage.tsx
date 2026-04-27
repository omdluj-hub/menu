import { ArrowRight } from 'lucide-react';

interface WelcomePageProps {
  onEnter: () => void;
}

const WelcomePage = ({ onEnter }: WelcomePageProps) => {
  return (
    <div className="h-full w-full bg-[#FAF9F6] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Subtle Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-[#A89486]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] bg-[#A89486]/5 rounded-full blur-[120px]" />

      <div className="max-w-4xl w-full px-10 flex flex-col items-center text-center space-y-12 z-10 animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Logo Section */}
        <div className="space-y-6 flex flex-col items-center">
          <div className="p-8 bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(168,148,134,0.1)] border border-[#E9E4E0] transition-transform duration-700 hover:scale-105">
            <img src="/images/logo.gif" alt="Hoo Clinic Logo" className="w-40 h-auto" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-black text-[#A89486] tracking-[0.4em] uppercase">Premium Oriental Clinic</h2>
            <div className="h-[1px] w-12 bg-[#A89486]/30 mx-auto mt-4" />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl font-black text-[#2C2C2C] leading-[1.1] tracking-tight break-keep">
            아름다움과 건강의 본질,<br/>
            <span className="text-[#A89486]">후한의원 구미점</span>입니다.
          </h1>
          <p className="text-lg md:text-xl text-[#9A8F8A] font-medium max-w-2xl mx-auto leading-relaxed break-keep">
            개개인의 체질과 고민에 맞춘 정교한 처방으로<br/>
            당신만을 위한 진정한 프리미엄 케어를 제안합니다.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-8">
          <button 
            onClick={onEnter}
            className="group relative bg-[#2C2C2C] text-white px-16 py-7 rounded-full font-black text-xl overflow-hidden transition-all duration-500 hover:bg-[#A89486] hover:shadow-[0_20px_40px_rgba(168,148,134,0.3)] active:scale-95 flex items-center space-x-4"
          >
            <span className="relative z-10 tracking-tight">프로그램 둘러보기</span>
            <ArrowRight size={24} className="relative z-10 transition-transform duration-500 group-hover:translate-x-2" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </button>
        </div>

        {/* Footer Info */}
        <div className="pt-12 grid grid-cols-3 gap-12 text-[#DED9D4]">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest">Experience</p>
            <p className="text-sm font-bold text-[#9A8F8A]">Professional</p>
          </div>
          <div className="space-y-1 border-x border-[#E9E4E0] px-12">
            <p className="text-[10px] font-black uppercase tracking-widest">Material</p>
            <p className="text-sm font-bold text-[#9A8F8A]">Natural</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest">Service</p>
            <p className="text-sm font-bold text-[#9A8F8A]">Premium</p>
          </div>
        </div>

      </div>

      {/* Decorative Text */}
      <div className="absolute bottom-10 right-10 text-[120px] font-black text-[#A89486]/5 pointer-events-none select-none tracking-tighter">
        HOOCLINIC
      </div>
    </div>
  );
};

export default WelcomePage;
