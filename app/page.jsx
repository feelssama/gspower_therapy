'use client';
// @ts-nocheck

import { useState, useEffect } from 'react';
import {
  Shield, Calendar, MapPin, Clock, Users, ArrowRight, Check, X,
  ChevronRight, Plus, Home, Bell, Sparkles, Activity, TrendingUp,
  BarChart3, LogOut, Search, Star, Award, Heart, Stethoscope, Dna
} from 'lucide-react';

// ══════════════════════════════════════════════════════════
// GS파워 로고 (공식 CI 완벽 적용)
// ══════════════════════════════════════════════════════════
const GSLogo = ({ size = 36, showText = true }) => (
  <div className="flex items-center gap-1.5">
    {/* 위키백과에 등록된 GS그룹 공식 고화질 벡터(SVG) 로고를 실시간으로 불러옵니다. */}
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/1/1b/GS_logo_%28South_Korean_company%29.svg" 
      alt="GS Logo" 
      style={{ height: size * 0.85, width: 'auto' }} 
      className="flex-shrink-0"
    />
    {showText && (
      <div className="flex items-baseline gap-[2px] ml-0.5" style={{ transform: 'translateY(1px)' }}>
        <span className="font-black tracking-tighter" style={{ color: '#2B4C8C', fontSize: size * 0.65, fontFamily: 'Arial, sans-serif' }}>GS</span>
        <span className="font-bold tracking-tight text-[#555555]" style={{ fontSize: size * 0.6, fontFamily: "'Pretendard Variable', sans-serif" }}>파워</span>
      </div>
    )}
  </div>
);

// ══════════════════════════════════════════════════════════
// 글로벌 스타일 & 애니메이션
// ══════════════════════════════════════════════════════════
const GlobalStyles = () => (
  <style>{`
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
    html, body, #root { font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif; }
    * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
    @keyframes slideFromRight { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideFromBottom { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes pulseSoft { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

    .a-fade { animation: fadeIn .3s ease-out both; }
    .a-slide-up { animation: slideUp .45s cubic-bezier(0.16,1,0.3,1) both; }
    .a-slide-down { animation: slideDown .35s ease-out both; }
    .a-zoom { animation: zoomIn .4s cubic-bezier(0.16,1,0.3,1) both; }
    .a-from-right { animation: slideFromRight .35s cubic-bezier(0.16,1,0.3,1) both; }
    .a-sheet { animation: slideFromBottom .4s cubic-bezier(0.16,1,0.3,1) both; }
    .a-pulse { animation: pulseSoft 2s ease-in-out infinite; }
    .a-float { animation: float 3s ease-in-out infinite; }

    .stagger > * { opacity: 0; animation: slideUp .5s cubic-bezier(0.16,1,0.3,1) forwards; }
    .stagger > *:nth-child(1) { animation-delay: .05s; }
    .stagger > *:nth-child(2) { animation-delay: .1s; }
    .stagger > *:nth-child(3) { animation-delay: .15s; }
    .stagger > *:nth-child(4) { animation-delay: .2s; }
    .stagger > *:nth-child(5) { animation-delay: .25s; }
    .stagger > *:nth-child(6) { animation-delay: .3s; }

    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .line-clamp-2-fallback { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `}</style>
);

// ══════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════
const formatDate = (iso) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
};

const daysUntil = (iso) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const diff = Math.ceil((d - new Date()) / 86400000);
  if (diff < 0) return '종료';
  if (diff === 0) return '오늘';
  if (diff === 1) return '내일';
  return `D-${diff}`;
};

// ══════════════════════════════════════════════════════════
// Main App Component
// ══════════════════════════════════════════════════════════
export default function TherapyApp() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [adminPw, setAdminPw] = useState('');
  const [loginForm, setLoginForm] = useState({ name: '', empId: '' });
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lotteryResult, setLotteryResult] = useState(null);
  const [filterLoc, setFilterLoc] = useState('전체');
  const [searchQ, setSearchQ] = useState('');

  const [programs, setPrograms] = useState([
    {
      id: 1, title: '근골격계 예방 테라피', category: '물리치료',
      location: '안양사업소', date: '2026-05-20', time: '14:00~17:00',
      capacity: 20, applied: 25, rating: 4.9, status: '모집 중',
      therapist: { name: '김은정', role: '물리치료사', exp: '15년', avatar: 'KE' },
      desc: '허리·목·어깨 만성 통증 완화를 위한 1:1 전문 물리치료 프로그램입니다.',
      tags: ['허리통증', '목어깨', '1:1케어'], color: 'orange', duration: '50분/인'
    },
    {
      id: 2, title: '스트레칭 & 자세교정', category: '자세교정',
      location: '부천사업소', date: '2026-05-15', time: '13:00~16:00',
      capacity: 15, applied: 14, rating: 4.8, status: '모집 중',
      therapist: { name: '박성호', role: '운동처방사', exp: '10년', avatar: 'PS' },
      desc: '사무직 대상 거북목·라운드숄더 교정 스트레칭 프로그램입니다.',
      tags: ['거북목', '자세교정', '사무직'], color: 'blue', duration: '40분/인'
    },
    {
      id: 3, title: '아로마 릴렉싱 테라피', category: '휴식요법',
      location: '서울사업소', date: '2026-05-25', time: '15:00~18:00',
      capacity: 10, applied: 5, rating: 5.0, status: '모집 중',
      therapist: { name: '이수민', role: '아로마테라피스트', exp: '8년', avatar: 'LS' },
      desc: '심신의 긴장 완화를 위한 프리미엄 아로마 릴렉싱 세션입니다.',
      tags: ['스트레스', '수면개선', '힐링'], color: 'green', duration: '60분/인'
    },
  ]);

  const [myApplications, setMyApplications] = useState([]);

  const notifications = [
    { id: 1, text: '5/20 안양 프로그램이 마감 임박입니다', time: '1시간 전', type: 'warning' },
    { id: 2, text: '신청하신 부천 프로그램이 확정되었습니다', time: '어제', type: 'success' },
  ];

  const handleLogin = (e) => {
    e?.preventDefault();
    if (!loginForm.name || !loginForm.empId) return;
    setUser({ ...loginForm });
  };

  const handleAdminAuth = (e) => {
    e?.preventDefault();
    if (adminPw === 'gspower1234') {
      setIsAdmin(true);
      setShowAdminGate(false);
      setAdminPw('');
      if (user) setCurrentTab('admin');
    } else { alert('비밀번호가 일치하지 않습니다.'); }
  };

  const openProgramDetail = (p) => { setSelectedProgram(p); setShowDetail(true); };

  const applyProgram = () => {
    setShowConfirm(false); setShowDetail(false);
    setPrograms(prev => prev.map(p => p.id === selectedProgram.id ? { ...p, applied: p.applied + 1 } : p));
    setMyApplications(prev => [...prev, { ...selectedProgram, applied: selectedProgram.applied + 1, appliedAt: new Date().toISOString(), status: 'pending' }]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2800);
  };

  const cancelApplication = (id) => {
    setMyApplications(prev => prev.filter(p => p.id !== id));
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, applied: Math.max(0, p.applied - 1) } : p));
  };

  const handleRunLottery = (id) => {
    const p = programs.find(x => x.id === id);
    if (p.status === '추첨완료') return alert("이미 추첨이 완료된 프로그램입니다.");

    const penaltyCount = Math.floor(p.applied * 0.3);
    const newCount = p.applied - penaltyCount;

    let msg = `<div class="text-left space-y-3 text-[14px] text-gray-700">`;
    msg += `<p><b class="text-[#0A1628] text-[16px]">${p.title} (${p.location})</b></p>`;
    msg += `<p>총 신청 인원: <b>${p.applied}명</b> (정원 ${p.capacity}명)</p>`;
    msg += `<div class="bg-gray-50 p-3 rounded-lg border border-gray-200">`;
    msg += `<p>• 직전 참여 제외(Waitlist): <span class="text-[#F47B20] font-bold">${penaltyCount}명</span></p>`;
    msg += `<p>• 1순위 신규 신청자: <b class="text-[#1B3A6B]">${newCount}명</b></p></div>`;

    if (newCount >= p.capacity) {
      msg += `<p class="text-[#5CB85C] font-black text-[15px] pt-2">✅ 1순위 대상자 중 무작위 ${p.capacity}명 선정 완료</p>`;
    } else {
      msg += `<p class="text-[#5CB85C] font-black text-[15px] pt-2">✅ 1순위 전원 선발 후, 부족한 ${p.capacity - newCount}명을 대기자(Waitlist)에서 추가 무작위 선정 완료</p>`;
    }
    msg += `</div>`;

    setLotteryResult(msg);
    setPrograms(prev => prev.map(item => item.id === id ? { ...item, status: "추첨완료" } : item));
  };

  const filtered = programs.filter(p => {
    const locOk = filterLoc === '전체' || p.location === filterLoc;
    const qOk = !searchQ || p.title.includes(searchQ) || p.tags.some(t => t.includes(searchQ));
    return locOk && qOk;
  });

  const colorMap = {
    orange: { bg: 'bg-[#FFF4EB]', dot: 'bg-[#F47B20]', text: 'text-[#C85A0F]', solid: '#F47B20', soft: 'from-[#FFE5CC] to-[#FFF4EB]' },
    blue:   { bg: 'bg-[#EDF2FB]', dot: 'bg-[#2B4C8C]', text: 'text-[#1B3A6B]', solid: '#1B3A6B', soft: 'from-[#D6E0F5] to-[#EDF2FB]' },
    green:  { bg: 'bg-[#EFF8EC]', dot: 'bg-[#5CB85C]', text: 'text-[#2E7D32]', solid: '#5CB85C', soft: 'from-[#D4EDC9] to-[#EFF8EC]' },
  };

  // ═══════════════════════════════════════════════════
  // 로그인 스크린
  // ═══════════════════════════════════════════════════
  if (!user) {
    return (
      <>
        <GlobalStyles />
        <div className="min-h-screen w-full bg-[#FAFAF7] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#F5A524]/20 to-transparent blur-3xl a-float" />
            <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#5B8FD9]/20 to-transparent blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#8BC34A]/15 to-transparent blur-3xl" />
          </div>

          <div className="relative min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-[440px] a-slide-up">
              <div className="flex justify-center mb-12">
                <div className="bg-white/70 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-sm border border-white">
                  <GSLogo size={32} />
                </div>
              </div>

              <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-[11px] font-bold text-[#1B3A6B] mb-6 shadow-sm border border-gray-100">
                  <Sparkles size={12} className="text-[#F47B20]" />
                  <span>Wellness Program 2026</span>
                </div>
                <h1 className="text-[40px] md:text-[44px] leading-[1.05] font-black tracking-tight text-[#0A1628] mb-5">
                  건강한 당신이<br/>
                  <span className="bg-gradient-to-r from-[#F47B20] via-[#1B3A6B] to-[#5CB85C] bg-clip-text text-transparent">
                    곧 건강한 회사입니다
                  </span>
                </h1>
                <p className="text-[14px] md:text-[15px] text-[#64748B] leading-relaxed font-medium">
                  근골격계 전문 테라피 프로그램<br/>
                  임직원 인증 후 이용 가능합니다
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div className="bg-white rounded-2xl p-1.5 shadow-[0_8px_32px_rgba(15,23,42,0.04)] border border-gray-100">
                  <div className="px-5 py-2 border-b border-gray-50">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">성함</label>
                    <input
                      value={loginForm.name} onChange={e => setLoginForm({ ...loginForm, name: e.target.value })}
                      placeholder="홍길동" className="w-full mt-0.5 bg-transparent text-[16px] font-semibold text-[#0A1628] placeholder-gray-300 outline-none"
                    />
                  </div>
                  <div className="px-5 py-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">사번</label>
                    <input
                      value={loginForm.empId} onChange={e => setLoginForm({ ...loginForm, empId: e.target.value })}
                      placeholder="GP12345" className="w-full mt-0.5 bg-transparent text-[16px] font-semibold text-[#0A1628] placeholder-gray-300 outline-none"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full group relative bg-[#0A1628] text-white rounded-2xl py-5 font-bold text-[15px] overflow-hidden active:scale-[0.98] transition-transform shadow-[0_12px_32px_rgba(10,22,40,0.25)]">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F47B20] via-[#1B3A6B] to-[#5CB85C] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative flex items-center justify-center gap-2">프로그램 둘러보기<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>
                </button>
              </form>

              <div className="mt-10 text-center">
                <button onClick={() => setShowAdminGate(true)} className="inline-flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-[#1B3A6B] transition-colors font-semibold">
                  <Shield size={12} />관리자 접속
                </button>
              </div>
            </div>
          </div>
          {showAdminGate && <AdminGate pw={adminPw} setPw={setAdminPw} onSubmit={handleAdminAuth} onClose={() => setShowAdminGate(false)} />}
        </div>
      </>
    );
  }

  // ═══════════════════════════════════════════════════
  // 메인 렌더링
  // ═══════════════════════════════════════════════════
  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen bg-[#FAFAF7]">
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex flex-col w-[260px] bg-white border-r border-gray-100 sticky top-0 h-screen p-6">
            <div className="mb-10"><GSLogo size={34} /><div className="mt-1 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Therapy Portal</div></div>
            <nav className="space-y-1 flex-1">
              {[ { id: 'home', icon: Home, label: '홈' }, { id: 'programs', icon: Activity, label: '프로그램' }, { id: 'my', icon: Heart, label: '내 신청 내역', badge: myApplications.length }, ...(isAdmin ? [{ id: 'admin', icon: BarChart3, label: '관리자 대시보드' }] : []) ].map(item => (
                <button key={item.id} onClick={() => setCurrentTab(item.id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-bold transition-all ${currentTab === item.id ? 'bg-[#0A1628] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-[#0A1628]'}`}>
                  <span className="flex items-center gap-3"><item.icon size={17} />{item.label}</span>
                  {item.badge > 0 && <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${currentTab === item.id ? 'bg-white text-[#0A1628]' : 'bg-[#F47B20] text-white'}`}>{item.badge}</span>}
                </button>
              ))}
            </nav>
            <div className="mt-auto">
              <div className="bg-gradient-to-br from-[#FAFAF7] to-white rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F47B20] to-[#1B3A6B] flex items-center justify-center text-white font-black text-[13px]">{user.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0"><div className="text-[13px] font-black text-[#0A1628] truncate">{user.name}</div><div className="text-[11px] text-gray-400 font-semibold">{user.empId}</div></div>
                </div>
                <button onClick={() => { setUser(null); setIsAdmin(false); setMyApplications([]); setCurrentTab('home'); }} className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-[#0A1628] py-2 rounded-lg hover:bg-gray-50 transition-colors"><LogOut size={11} />로그아웃</button>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0 pb-24 lg:pb-8">
            {/* Mobile Top Bar */}
            <div className="lg:hidden sticky top-0 z-30 bg-[#FAFAF7]/90 backdrop-blur-xl border-b border-gray-100/80 px-5 py-3 flex items-center justify-between">
              <GSLogo size={28} />
              <div className="flex items-center gap-2">
                <button onClick={() => setShowNotifications(true)} className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center relative"><Bell size={16} className="text-[#0A1628]" />{notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F47B20] rounded-full" />}</button>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F47B20] to-[#1B3A6B] flex items-center justify-center text-white font-black text-[13px]">{user.name.charAt(0)}</div>
              </div>
            </div>

            {/* Desktop Top Bar */}
            <div className="hidden lg:flex sticky top-0 z-30 bg-[#FAFAF7]/90 backdrop-blur-xl border-b border-gray-100 px-10 py-4 items-center justify-between">
              <div className="flex items-center gap-3 text-[12px] font-bold text-gray-400"><span>Therapy Portal</span><ChevronRight size={12} /><span className="text-[#0A1628]">{currentTab === 'home' ? '홈' : currentTab === 'programs' ? '프로그램' : currentTab === 'my' ? '내 신청 내역' : '관리자 대시보드'}</span></div>
              <div className="flex items-center gap-3">
                {!isAdmin && <button onClick={() => setShowAdminGate(true)} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-[#0A1628] px-3 py-2"><Shield size={12} />관리자</button>}
                <button onClick={() => setShowNotifications(true)} className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center relative hover:border-gray-200"><Bell size={14} className="text-[#0A1628]" />{notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F47B20] rounded-full" />}</button>
                {isAdmin && <div className="flex items-center gap-1.5 bg-[#0A1628] text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider"><Shield size={10} />Admin</div>}
              </div>
            </div>

            <div className="px-5 lg:px-10 py-6 lg:py-8 max-w-[1400px] mx-auto">
              {currentTab === 'home' && <HomeTab user={user} programs={programs} myApplications={myApplications} colorMap={colorMap} onOpenProgram={openProgramDetail} onGoPrograms={() => setCurrentTab('programs')} />}
              {currentTab === 'programs' && <ProgramsTab filtered={filtered} colorMap={colorMap} searchQ={searchQ} setSearchQ={setSearchQ} filterLoc={filterLoc} setFilterLoc={setFilterLoc} onOpenProgram={openProgramDetail} />}
              {currentTab === 'my' && <MyTab myApplications={myApplications} colorMap={colorMap} onCancel={cancelApplication} onGoPrograms={() => setCurrentTab('programs')} />}
              {currentTab === 'admin' && isAdmin && <AdminPanel programs={programs} setPrograms={setPrograms} colorMap={colorMap} onRunLottery={handleRunLottery} />}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-3 pt-2 pb-6">
          <div className="flex justify-around max-w-md mx-auto">
            {[ { id: 'home', icon: Home, label: '홈' }, { id: 'programs', icon: Activity, label: '프로그램' }, { id: 'my', icon: Heart, label: '내 신청', badge: myApplications.length }, ...(isAdmin ? [{ id: 'admin', icon: BarChart3, label: '관리' }] : []) ].map(item => (
              <button key={item.id} onClick={() => setCurrentTab(item.id)} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors relative ${currentTab === item.id ? 'text-[#0A1628]' : 'text-gray-400'}`}>
                <item.icon size={20} strokeWidth={currentTab === item.id ? 2.5 : 2} /><span className="text-[10px] font-black">{item.label}</span>
                {item.badge > 0 && <span className="absolute top-1 right-2 w-4 h-4 bg-[#F47B20] text-white text-[9px] font-black rounded-full flex items-center justify-center">{item.badge}</span>}
                {currentTab === item.id && <span className="absolute -top-2 w-1 h-1 bg-[#F47B20] rounded-full" />}
              </button>
            ))}
          </div>
        </nav>

        {/* Modals & Overlays */}
        {showDetail && selectedProgram && <ProgramDetailSheet program={selectedProgram} onClose={() => setShowDetail(false)} onApply={() => setShowConfirm(true)} colorMap={colorMap} />}
        
        {showConfirm && selectedProgram && (
          <div className="fixed inset-0 z-[70] flex items-end lg:items-center justify-center bg-[#0A1628]/70 backdrop-blur-sm p-0 lg:p-6 a-fade">
            <div className="bg-white rounded-t-3xl lg:rounded-3xl p-7 w-full lg:max-w-md a-sheet">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6 lg:hidden" />
              <h3 className="text-[20px] font-black text-[#0A1628] mb-1 text-center">신청 정보 확인</h3>
              <p className="text-[13px] text-gray-400 font-medium text-center mb-7">신청 전 내용을 확인해주세요</p>
              <div className="bg-[#FAFAF7] rounded-2xl p-5 space-y-3 mb-6 border border-gray-100">
                <Row label="신청자" value={`${user.name} (${user.empId})`} />
                <Row label="프로그램" value={selectedProgram.title} />
                <Row label="장소" value={selectedProgram.location} />
                <Row label="일시" value={`${formatDate(selectedProgram.date)} ${selectedProgram.time}`} />
                <Row label="담당" value={`${selectedProgram.therapist.name} ${selectedProgram.therapist.role}`} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-50 text-gray-500 rounded-2xl py-4 font-bold text-[13px]">취소</button>
                <button onClick={applyProgram} className="flex-[2] bg-[#0A1628] text-white rounded-2xl py-4 font-bold text-[13px] active:scale-[0.98] transition-transform">최종 신청</button>
              </div>
            </div>
          </div>
        )}

        {showSuccess && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/80 backdrop-blur-xl p-6 a-fade">
            <div className="text-center a-zoom">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#5CB85C] to-[#3B9B5F] flex items-center justify-center shadow-2xl"><Check size={36} className="text-white" strokeWidth={3} /></div>
              <h2 className="text-[28px] font-black text-[#0A1628] tracking-tight mb-2">신청 완료!</h2>
              <p className="text-[14px] text-gray-500 font-semibold">건강한 하루 되세요 ✨</p>
            </div>
          </div>
        )}

        {lotteryResult && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 a-fade">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-md a-zoom shadow-2xl">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-50 text-[#1B3A6B] rounded-2xl mx-auto mb-5"><Dna size={32} /></div>
              <h3 className="text-[22px] font-black text-center text-[#0A1628] mb-6">추첨 알고리즘 완료</h3>
              <div dangerouslySetInnerHTML={{ __html: lotteryResult }} />
              <button onClick={() => setLotteryResult(null)} className="w-full mt-6 bg-[#0A1628] text-white py-4 rounded-xl font-black text-[14px] active:scale-[0.98] transition-all">결과 확정하기</button>
            </div>
          </div>
        )}

        {showAdminGate && <AdminGate pw={adminPw} setPw={setAdminPw} onSubmit={handleAdminAuth} onClose={() => setShowAdminGate(false)} />}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════
// Tabs & Components
// ══════════════════════════════════════════════════════════

const HomeTab = ({ user, programs, myApplications, colorMap, onOpenProgram, onGoPrograms }) => (
  <div className="space-y-6 a-fade">
    <div className="relative overflow-hidden rounded-3xl bg-[#0A1628] p-7 lg:p-10 text-white">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#F47B20]/30 to-transparent blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#5CB85C]/25 to-transparent blur-3xl" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-bold mb-5 border border-white/10">
          <span className="w-1.5 h-1.5 bg-[#5CB85C] rounded-full a-pulse" />지금 신청 가능한 프로그램 {programs.filter(p => p.applied < p.capacity).length}개
        </div>
        <h1 className="text-[28px] lg:text-[42px] font-black leading-[1.1] tracking-tight mb-3">{user.name}님,<br/>오늘도 건강하세요</h1>
        <p className="text-[14px] lg:text-[15px] text-white/60 font-medium max-w-md leading-relaxed">엄선된 전문가와 함께하는<br className="lg:hidden" /> 프리미엄 웰니스 케어를 경험해보세요</p>
        <button onClick={onGoPrograms} className="mt-6 lg:mt-8 group inline-flex items-center gap-2 bg-white text-[#0A1628] px-5 py-3 rounded-xl font-bold text-[13px] shadow-lg hover:shadow-xl transition-shadow">
          전체 프로그램 보기<ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 stagger">
      <StatCard icon={Activity} label="참여 프로그램" value={myApplications.length} suffix="건" accent="#F47B20" />
      <StatCard icon={Users} label="이번 달 참여 인원" value={programs.reduce((a,p)=>a+p.applied,0)} suffix="명" accent="#1B3A6B" />
      <StatCard icon={TrendingUp} label="평균 만족도" value="4.8" suffix="/5.0" accent="#5CB85C" />
      <StatCard icon={Award} label="이번 주 신규" value="2" suffix="개" accent="#F47B20" />
    </div>
    <div>
      <div className="flex items-end justify-between mb-4 lg:mb-5">
        <div><div className="text-[11px] font-bold text-[#F47B20] uppercase tracking-widest mb-1">Recommended</div><h2 className="text-[20px] lg:text-[26px] font-black tracking-tight text-[#0A1628]">추천 프로그램</h2></div>
        <button onClick={onGoPrograms} className="text-[12px] font-bold text-gray-400 hover:text-[#0A1628] flex items-center gap-1">전체보기 <ChevronRight size={12} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
        {programs.slice(0, 2).map(p => <FeaturedCard key={p.id} program={p} onClick={() => onOpenProgram(p)} colorMap={colorMap} />)}
      </div>
    </div>
  </div>
);

const ProgramsTab = ({ filtered, colorMap, searchQ, setSearchQ, filterLoc, setFilterLoc, onOpenProgram }) => (
  <div className="space-y-6 a-fade">
    <div>
      <div className="text-[11px] font-bold text-[#F47B20] uppercase tracking-widest mb-1">Programs</div>
      <h1 className="text-[28px] lg:text-[36px] font-black tracking-tight text-[#0A1628]">프로그램 전체</h1>
    </div>
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="검색" className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-4 py-4 text-[14px] font-semibold outline-none" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 lg:mx-0 lg:px-0 hide-scrollbar">
        {['전체', '안양사업소', '부천사업소', '서울사업소'].map(loc => (
          <button key={loc} onClick={() => setFilterLoc(loc)} className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all ${filterLoc === loc ? 'bg-[#0A1628] text-white' : 'bg-white border border-gray-100 text-gray-500'}`}>{loc}</button>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
      {filtered.map(p => <CompactCard key={p.id} program={p} onClick={() => onOpenProgram(p)} colorMap={colorMap} />)}
    </div>
  </div>
);

const MyTab = ({ myApplications, colorMap, onCancel, onGoPrograms }) => (
  <div className="space-y-6 a-fade">
    <div>
      <div className="text-[11px] font-bold text-[#5CB85C] uppercase tracking-widest mb-1">My Applications</div>
      <h1 className="text-[28px] lg:text-[36px] font-black tracking-tight text-[#0A1628]">내 신청 내역</h1>
    </div>
    {myApplications.length === 0 ? (
      <div className="bg-white rounded-3xl p-14 text-center border border-gray-100">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#FAFAF7] to-[#F5F5F2] flex items-center justify-center"><Heart size={24} className="text-gray-300" /></div>
        <h3 className="text-[16px] font-black text-[#0A1628] mb-2">신청 내역이 없습니다</h3>
        <button onClick={onGoPrograms} className="mt-4 bg-[#0A1628] text-white px-5 py-3 rounded-xl font-bold text-[13px]">프로그램 둘러보기</button>
      </div>
    ) : (
      <div className="space-y-3 stagger">
        {myApplications.map((p, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl ${colorMap[p.color].bg} flex items-center justify-center flex-shrink-0`}><Stethoscope size={22} style={{ color: colorMap[p.color].solid }} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-[15px] font-black text-[#0A1628] leading-tight truncate">{p.title}</h3>
                  <span className="bg-[#FFF4EB] text-[#C85A0F] px-2.5 py-1 rounded-lg text-[10px] font-black flex-shrink-0">신청완료</span>
                </div>
                <div className="flex flex-wrap gap-x-3 text-[11px] text-gray-500 font-semibold"><span>{p.location}</span><span>{formatDate(p.date)}</span></div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
              <div className="text-[11px] text-gray-400 font-semibold">{daysUntil(p.date)} · 담당: {p.therapist.name}</div>
              <button onClick={() => onCancel(p.id)} className="text-[11px] font-bold text-gray-400 hover:text-red-500">신청 취소</button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ══════════════════════════════════════════════════════════
// Cards & Modals
// ══════════════════════════════════════════════════════════

const StatCard = ({ icon: Icon, label, value, suffix, accent }) => (
  <div className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
    <div className="mb-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}><Icon size={15} style={{ color: accent }} /></div></div>
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
    <div className="flex items-baseline gap-1"><span className="text-[22px] lg:text-[28px] font-black tracking-tight text-[#0A1628]">{value}</span><span className="text-[11px] font-bold text-gray-400">{suffix}</span></div>
  </div>
);

const FeaturedCard = ({ program, onClick, colorMap }) => {
  const c = colorMap[program.color];
  const isFull = program.status === '추첨완료' || program.applied >= program.capacity;
  const pct = (program.applied / program.capacity) * 100;
  return (
    <button onClick={onClick} className="group relative text-left bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
      <div className={`absolute inset-0 bg-gradient-to-br ${c.soft} opacity-40`} />
      <div className="relative p-6 lg:p-7">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2"><span className={`text-[10px] font-black uppercase tracking-widest ${c.text}`}>{program.category}</span></div>
          <span className="bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-black text-[#0A1628] border border-white">{daysUntil(program.date)}</span>
        </div>
        <h3 className="text-[22px] lg:text-[24px] font-black leading-tight tracking-tight text-[#0A1628] mb-4">{program.title}</h3>
        <div className="space-y-1.5 mb-6 text-[12px] text-gray-600 font-semibold">
          <div className="flex items-center gap-2"><MapPin size={12} />{program.location}</div>
          <div className="flex items-center gap-2"><Calendar size={12} />{formatDate(program.date)} · {program.time}</div>
        </div>
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-200/50">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-[11px]" style={{ backgroundColor: c.solid }}>{program.therapist.avatar}</div>
          <div><div className="text-[12px] font-black text-[#0A1628]">{program.therapist.name} {program.therapist.role}</div><div className="text-[10px] text-gray-400 font-bold">경력 {program.therapist.exp}</div></div>
        </div>
        <div className="mb-5">
          <div className="flex justify-between mb-2"><span className="text-[10px] font-black uppercase text-gray-400">모집 현황</span><div className="flex gap-1"><span className={`text-[16px] font-black ${isFull ? 'text-[#F47B20]' : 'text-[#0A1628]'}`}>{program.applied}</span><span className="text-[11px] text-gray-300 font-bold">/ {program.capacity}명</span></div></div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: isFull ? '#F47B20' : c.solid }} /></div>
        </div>
        <div className={`inline-flex items-center gap-1.5 text-[12px] font-black ${isFull ? 'text-gray-400' : 'text-[#0A1628]'}`}>{isFull ? '모집 마감' : '자세히 보기'}{!isFull && <ArrowRight size={13} />}</div>
      </div>
    </button>
  );
};

const CompactCard = ({ program, onClick, colorMap }) => {
  const c = colorMap[program.color];
  const isFull = program.status === '추첨완료' || program.applied >= program.capacity;
  const pct = (program.applied / program.capacity) * 100;
  return (
    <button onClick={onClick} className="group text-left bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="flex justify-between mb-4"><span className={`${c.bg} ${c.text} px-2.5 py-1 rounded-lg text-[10px] font-black`}>{program.category}</span><span className="text-[10px] font-black text-gray-400">{daysUntil(program.date)}</span></div>
      <h3 className="text-[15px] font-black text-[#0A1628] leading-snug mb-3 line-clamp-2-fallback">{program.title}</h3>
      <div className="space-y-1 mb-4 text-[11px] text-gray-500 font-semibold"><div className="flex gap-1.5"><MapPin size={10} />{program.location}</div><div className="flex gap-1.5"><Calendar size={10} />{formatDate(program.date)}</div></div>
      <div>
        <div className="flex justify-between mb-1.5"><div className="flex gap-1"><span className={`text-[13px] font-black ${isFull ? 'text-[#F47B20]' : 'text-[#0A1628]'}`}>{program.applied}</span><span className="text-[10px] text-gray-300 font-bold">/ {program.capacity}</span></div>{isFull && <span className="text-[9px] font-black text-[#F47B20]">마감</span>}</div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: isFull ? '#F47B20' : c.solid }} /></div>
      </div>
    </button>
  );
};

const ProgramDetailSheet = ({ program, onClose, onApply, colorMap }) => {
  const c = colorMap[program.color];
  const isFull = program.status === '추첨완료' || program.applied >= program.capacity;
  const pct = (program.applied / program.capacity) * 100;
  return (
    <div className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center bg-[#0A1628]/70 backdrop-blur-sm a-fade" onClick={onClose}>
      <div className="bg-white w-full lg:max-w-lg rounded-t-[2rem] lg:rounded-3xl max-h-[92vh] overflow-y-auto a-sheet" onClick={e => e.stopPropagation()}>
        <div className={`relative bg-gradient-to-br ${c.soft} p-6 lg:p-8`}>
          <div className="w-10 h-1 bg-[#0A1628]/20 rounded-full mx-auto mb-5 lg:hidden" />
          <div className="flex justify-between mb-6">
            <div className={`inline-flex gap-2 ${c.bg} px-3 py-1.5 rounded-full`}><span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} /><span className={`text-[10px] font-black uppercase ${c.text}`}>{program.category}</span></div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center"><X size={14} className="text-[#0A1628]" /></button>
          </div>
          <h2 className="text-[28px] lg:text-[34px] font-black leading-[1.1] text-[#0A1628] mb-3">{program.title}</h2>
          <div className="flex gap-3 text-[12px] font-bold text-gray-600"><span>{program.duration}</span><span className="text-gray-300">·</span><span>{daysUntil(program.date)}</span></div>
        </div>
        <div className="p-6 lg:p-8 space-y-6">
          <p className="text-[14px] text-gray-600 font-medium">{program.desc}</p>
          <div className="grid grid-cols-2 gap-3">
            <InfoTile icon={MapPin} label="장소" value={program.location} />
            <InfoTile icon={Calendar} label="날짜" value={formatDate(program.date)} />
            <InfoTile icon={Clock} label="시간" value={program.time} />
            <InfoTile icon={Users} label="정원" value={`${program.applied}/${program.capacity}명`} />
          </div>
          <div className="bg-[#FAFAF7] rounded-2xl p-5 border border-gray-100">
            <div className="text-[10px] font-black uppercase text-gray-400 mb-3">Therapist</div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-[14px]" style={{ backgroundColor: c.solid }}>{program.therapist.avatar}</div>
              <div className="flex-1"><div className="text-[14px] font-black text-[#0A1628]">{program.therapist.name}</div><div className="text-[11px] text-gray-500 font-bold">{program.therapist.role}</div></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-3"><span className="text-[11px] font-black text-gray-400">모집 현황</span><div className="flex gap-1"><span className={`text-[20px] font-black ${isFull ? 'text-[#F47B20]' : 'text-[#0A1628]'}`}>{program.applied}</span><span className="text-[12px] text-gray-300 font-bold">/ {program.capacity}명</span></div></div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: isFull ? '#F47B20' : c.solid }} /></div>
          </div>
          <button onClick={onApply} disabled={isFull} className={`w-full rounded-2xl py-5 font-black text-[14px] transition-all ${isFull ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-[#0A1628] text-white active:scale-[0.98] shadow-lg'}`}>
            {isFull ? '모집이 마감되었습니다' : '이 프로그램 신청하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="bg-[#FAFAF7] rounded-xl p-3.5 border border-gray-100">
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5"><Icon size={11} />{label}</div>
    <div className="text-[13px] font-black text-[#0A1628]">{value}</div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-3"><span className="text-[12px] text-gray-400 font-bold">{label}</span><span className="text-[12px] font-black text-[#0A1628] text-right">{value}</span></div>
);

const AdminGate = ({ pw, setPw, onSubmit, onClose }) => (
  <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0A1628]/80 backdrop-blur-md p-6 a-fade">
    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl a-zoom">
      <div className="flex justify-between mb-6"><div className="flex gap-2"><div className="w-9 h-9 rounded-xl bg-[#0A1628] flex items-center justify-center"><Shield size={16} className="text-white" /></div><div><div className="text-[14px] font-black text-[#0A1628]">관리자 인증</div></div></div><button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><X size={14} className="text-gray-500" /></button></div>
      <form onSubmit={onSubmit}>
        <input type="password" autoFocus value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" className="w-full bg-gray-50 rounded-xl px-4 py-3.5 text-[14px] font-semibold outline-none focus:bg-white focus:border-[#F47B20] border border-transparent transition-all" />
        <button type="submit" className="w-full mt-3 bg-[#0A1628] text-white rounded-xl py-3.5 font-bold text-[13px] active:scale-[0.98]">인증하기</button>
      </form>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════
// Admin Dashboard
// ══════════════════════════════════════════════════════════
const AdminPanel = ({ programs, setPrograms, colorMap, onRunLottery }) => {
  const [form, setForm] = useState({
    titleType: '근골격계 테라피', customTitle: '', category: '물리치료', 
    location: '안양사업소', date: '', time: '14:00~17:00', capacity: '', 
    therapistName: '', therapistRole: '물리치료사', therapistExp: '', desc: '', duration: '50분/인'
  });

  const totalApplied = programs.reduce((a, p) => a + p.applied, 0);
  const totalCapacity = programs.reduce((a, p) => a + p.capacity, 0);
  const fillRate = totalCapacity ? Math.round((totalApplied / totalCapacity) * 100) : 0;

  // 지역 기반 자동 컬러 지정
  const getLocationColor = (loc) => {
    if (loc.includes('안양')) return 'orange';
    if (loc.includes('부천')) return 'blue';
    if (loc.includes('서울')) return 'green';
    return 'orange'; 
  };

  const createProgram = () => {
    const finalTitle = form.titleType === '기타' ? form.customTitle : form.titleType;
    if (!finalTitle || !form.date || !form.capacity || !form.therapistName) return alert('필수 항목을 입력해주세요');
    
    const newP = {
      id: Date.now(), title: finalTitle, category: form.category, location: form.location, 
      date: form.date, time: form.time, capacity: parseInt(form.capacity), applied: 0, rating: 5.0, status: '모집 중',
      therapist: { name: form.therapistName, role: form.therapistRole, exp: form.therapistExp || '5년', avatar: form.therapistName.charAt(0) },
      desc: form.desc || '전문가와 함께하는 웰니스 케어 프로그램입니다.', 
      tags: ['신규', form.category], color: getLocationColor(form.location), duration: form.duration,
    };
    setPrograms([newP, ...programs]);
    setForm({ ...form, titleType: '근골격계 테라피', customTitle: '', date: '', capacity: '', therapistName: '', therapistExp: '', desc: '' });
  };

  const inputCls = "w-full bg-gray-50 border border-transparent rounded-xl px-3.5 py-3 text-[13px] font-semibold text-[#0A1628] outline-none focus:bg-white focus:border-[#0A1628] transition-all";

  return (
    <div className="space-y-6 a-fade">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div><div className="text-[11px] font-bold text-[#1B3A6B] uppercase tracking-widest mb-1">Admin Dashboard</div><h1 className="text-[28px] lg:text-[36px] font-black tracking-tight text-[#0A1628]">관리자 대시보드</h1></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <div className="col-span-2 bg-[#0A1628] rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-gradient-to-br from-[#F47B20]/30 to-transparent blur-2xl" />
          <div className="relative">
            <div className="text-[10px] font-black uppercase text-white/50 mb-2">Total Fill Rate</div>
            <div className="flex items-baseline gap-2 mb-4"><span className="text-[56px] font-black">{fillRate}</span><span className="text-[20px] font-bold text-white/40">%</span></div>
            <div className="text-[12px] text-white/60 font-semibold">{totalApplied}명 / 총 {totalCapacity}명 모집</div>
          </div>
        </div>
        <StatCard icon={Activity} label="진행 프로그램" value={programs.length} suffix="개" accent="#F47B20" />
        <StatCard icon={Users} label="총 신청 인원" value={totalApplied} suffix="명" accent="#5CB85C" />
      </div>

      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100">
        <div className="flex items-center gap-2 mb-6"><div className="w-9 h-9 rounded-xl bg-[#F47B20] flex items-center justify-center"><Plus size={16} className="text-white" /></div><h3 className="text-[15px] font-black text-[#0A1628]">신규 프로그램 개설</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          
          <Field label="프로그램명 *">
            <select value={form.titleType} onChange={e => setForm({ ...form, titleType: e.target.value })} className={inputCls}><option>근골격계 테라피</option><option>기타</option></select>
          </Field>
          {form.titleType === '기타' && (
            <Field label="프로그램명 직접 입력 *"><input value={form.customTitle} onChange={e => setForm({ ...form, customTitle: e.target.value })} placeholder="예: 거북목 교정 클래스" className={inputCls} autoFocus /></Field>
          )}

          <Field label="카테고리"><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}><option>물리치료</option><option>자세교정</option><option>휴식요법</option></select></Field>
          <Field label="장소 (컬러 자동 배정)"><select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inputCls}><option>안양사업소</option><option>부천사업소</option><option>서울사업소</option></select></Field>
          <Field label="날짜 *"><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputCls} /></Field>
          <Field label="시간"><input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="14:00~17:00" className={inputCls} /></Field>
          <Field label="정원 *"><input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="명" className={inputCls} /></Field>
          <Field label="담당자명 *"><input value={form.therapistName} onChange={e => setForm({ ...form, therapistName: e.target.value })} placeholder="김은정" className={inputCls} /></Field>
          <Field label="담당 직책"><select value={form.therapistRole} onChange={e => setForm({ ...form, therapistRole: e.target.value })} className={inputCls}><option>물리치료사</option><option>운동처방사</option><option>아로마테라피스트</option></select></Field>
          <Field label="경력"><input value={form.therapistExp} onChange={e => setForm({ ...form, therapistExp: e.target.value })} placeholder="10년" className={inputCls} /></Field>
          <div className="md:col-span-2 lg:col-span-3"><Field label="프로그램 소개"><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="상세 설명" rows={2} className={`${inputCls} resize-none`} /></Field></div>
        </div>
        <button onClick={createProgram} className="mt-6 bg-[#0A1628] text-white px-8 py-4 rounded-2xl font-black text-[13px] active:scale-[0.98]">프로그램 게시하기</button>
      </div>

      <div>
        <h3 className="text-[16px] font-black text-[#0A1628] mb-3">운영 현황 및 추첨</h3>
        <div className="space-y-2 stagger">
          {programs.map(p => {
            const c = colorMap[p.color];
            const pct = (p.applied / p.capacity) * 100;
            return (
              <div key={p.id} className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center`}><Activity size={18} style={{ color: c.solid }} /></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1"><h4 className="text-[14px] font-black text-[#0A1628]">{p.title}</h4><span className={`${c.bg} ${c.text} px-2 py-0.5 rounded-md text-[9px] font-black`}>{p.category}</span></div>
                    <div className="text-[11px] text-gray-400 font-semibold">{p.location} · {formatDate(p.date)} · 신청 {p.applied}/{p.capacity}명</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {p.status === '추첨완료' ? (
                     <span className="bg-gray-100 text-gray-400 px-4 py-2 rounded-xl text-[11px] font-bold">추첨 완료</span>
                  ) : (
                     <button onClick={() => onRunLottery(p.id)} className="bg-[#F47B20] text-white px-4 py-2 rounded-xl text-[11px] font-bold shadow-md active:scale-95">추첨 실행</button>
                  )}
                  <button onClick={() => setPrograms(programs.filter(x => x.id !== p.id))} className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center hover:bg-red-100"><X size={14} className="text-red-500" /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">{label}</label>{children}</div>
);
