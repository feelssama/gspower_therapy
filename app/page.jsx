'use client';
// @ts-nocheck

import { useState, useEffect } from 'react';
import {
  Shield, Calendar, MapPin, Clock, Users, ArrowRight, Check, X,
  ChevronRight, Plus, Home, Bell, Sparkles, Activity, TrendingUp,
  BarChart3, LogOut, Search, Star, Award, Heart, Stethoscope, Dna, UserPlus, ThumbsUp
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

// ══════════════════════════════════════════════════════════
// GS파워 로고
// ══════════════════════════════════════════════════════════
const GSLogo = ({ size = 56, onClick }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div onClick={onClick} className={`flex items-center gap-1.5 ${onClick ? 'cursor-pointer active:scale-95 transition-transform hover:opacity-80' : ''}`}>
      {!imgError ? (
        <img src="/logo.png" alt="GS 파워" style={{ height: size * 0.85, width: 'auto' }} className="flex-shrink-0 object-contain" onError={() => setImgError(true)} />
      ) : (
        <div className="flex items-baseline gap-[2px] ml-0.5" style={{ transform: 'translateY(1px)' }}>
          <span className="font-black tracking-tighter" style={{ color: '#2B4C8C', fontSize: size * 0.65, fontFamily: 'Arial, sans-serif' }}>GS</span>
          <span className="font-bold tracking-tight text-[#555555]" style={{ fontSize: size * 0.6, fontFamily: "'Pretendard Variable', sans-serif" }}>파워</span>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// 글로벌 스타일
// ══════════════════════════════════════════════════════════
const GlobalStyles = () => (
  <style>{`
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
    html, body, #root { font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif; }
    * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideFromBottom { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
    @keyframes pulseSoft { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

    .a-fade { animation: fadeIn .3s ease-out both; }
    .a-slide-up { animation: slideUp .45s cubic-bezier(0.16,1,0.3,1) both; }
    .a-sheet { animation: slideFromBottom .4s cubic-bezier(0.16,1,0.3,1) both; }
    .a-zoom { animation: zoomIn .4s cubic-bezier(0.16,1,0.3,1) both; }
    .a-pulse { animation: pulseSoft 2s ease-in-out infinite; }

    .stagger > * { opacity: 0; animation: slideUp .5s cubic-bezier(0.16,1,0.3,1) forwards; }
    .stagger > *:nth-child(1) { animation-delay: .05s; }
    .stagger > *:nth-child(2) { animation-delay: .1s; }
    .stagger > *:nth-child(3) { animation-delay: .15s; }
    .stagger > *:nth-child(4) { animation-delay: .2s; }
    
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .line-clamp-2-fallback { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `}</style>
);

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

const getProgramStatus = (p) => {
  if (p.manualStatus) return p.manualStatus; 
  const today = new Date().toISOString().split('T')[0];
  if (p.date < today) return '종료';
  if (p.deadline < today) return '모집마감';
  return '모집중';
};

const StatusBadge = ({ status }) => {
  const colors = {
    '모집중': 'bg-green-100 text-green-700 border border-green-200',
    '모집마감': 'bg-red-100 text-red-600 border border-red-200',
    '추첨완료': 'bg-purple-100 text-purple-700 border border-purple-200',
    '종료': 'bg-gray-100 text-gray-500 border border-gray-200'
  };
  return <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${colors[status]}`}>{status}</span>;
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

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const notifications = [{ id: 1, text: '반가워요! 건강한 테라피를 신청해보세요.', time: '방금 전', type: 'success' }];

  useEffect(() => {
    const fetchRealData = async () => {
      if (supabaseUrl !== 'https://placeholder.supabase.co') {
        const { data: pData } = await supabase.from('programs').select('*').order('created_at', { ascending: false });
        if (pData) {
          setPrograms(pData.map(p => ({
            id: p.id, title: p.title, category: p.category || '물리치료', location: p.location,
            date: p.date, deadline: p.deadline, time: p.time, capacity: p.capacity, applied: p.applied,
            rating: p.rating || 5.0, manualStatus: p.manual_status,
            therapist: { name: p.therapist_name, role: p.therapist_role || '물리치료사', avatar: (p.therapist_name || 'G').charAt(0) },
            desc: p.description, tags: ['신규', p.category || '물리치료'], color: p.color || 'orange', duration: p.duration || '50분/인'
          })));
        }
        const { data: users } = await supabase.from('registered_users').select('*');
        if (users) setRegisteredUsers(users.map(u => ({ name: u.name, empId: u.emp_id })));
      }
    };
    fetchRealData();
  }, []);

  const handleLogin = (e) => { 
    e?.preventDefault(); 
    const u = registeredUsers.find(u => u.name === loginForm.name && u.empId === loginForm.empId.toUpperCase());
    if (u) setUser({ ...u });
    else alert('등록되지 않은 정보입니다.');
  };

  const handleAdminAuth = (e) => { 
    e?.preventDefault(); 
    if (adminPw === 'gspower1234') { setIsAdmin(true); setShowAdminGate(false); setAdminPw(''); if (user) setCurrentTab('admin'); } 
    else { alert('비밀번호가 일치하지 않습니다.'); } 
  };

  const applyProgram = async () => {
    setShowConfirm(false); setShowDetail(false);
    const updatedApplied = selectedProgram.applied + 1;
    if (supabaseUrl !== 'https://placeholder.supabase.co') await supabase.from('programs').update({ applied: updatedApplied }).eq('id', selectedProgram.id);
    setPrograms(prev => prev.map(p => p.id === selectedProgram.id ? { ...p, applied: updatedApplied } : p));
    setMyApplications(prev => [...prev, { ...selectedProgram, applied: updatedApplied, appliedAt: new Date().toISOString() }]);
    setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2800);
  };

  // 🔥 [신규 추가] 평점 등록 기능 로직
  const handleRate = async (programId, newRating) => {
    if (supabaseUrl !== 'https://placeholder.supabase.co') {
      await supabase.from('programs').update({ rating: newRating }).eq('id', programId);
    }
    setPrograms(prev => prev.map(p => p.id === programId ? { ...p, rating: newRating } : p));
    setMyApplications(prev => prev.map(p => p.id === programId ? { ...p, rating: newRating } : p));
    alert('평점이 성공적으로 반영되었습니다! 감사합니다. ⭐');
  };

  const handleRunLottery = async (id) => {
    if (supabaseUrl !== 'https://placeholder.supabase.co') await supabase.from('programs').update({ manual_status: '추첨완료' }).eq('id', id);
    setLotteryResult(`<div class="text-left"><b class="text-black">추첨 알고리즘 가동 완료</b><p class="text-[13px] mt-2">페널티 대상자를 제외하고 공정하게 당첨자를 선정했습니다.</p></div>`);
    setPrograms(prev => prev.map(item => item.id === id ? { ...item, manualStatus: "추첨완료" } : item));
  };

  const filtered = programs.filter(p => (filterLoc === '전체' || p.location === filterLoc) && (!searchQ || p.title.includes(searchQ)));
  const colorMap = {
    orange: { bg: 'bg-[#FFF4EB]', dot: 'bg-[#F47B20]', text: 'text-[#C85A0F]', solid: '#F47B20', soft: 'from-[#FFE5CC] to-[#FFF4EB]' },
    blue:   { bg: 'bg-[#EDF2FB]', dot: 'bg-[#2B4C8C]', text: 'text-[#1B3A6B]', solid: '#1B3A6B', soft: 'from-[#D6E0F5] to-[#EDF2FB]' },
    green:  { bg: 'bg-[#EFF8EC]', dot: 'bg-[#5CB85C]', text: 'text-[#2E7D32]', solid: '#5CB85C', soft: 'from-[#D4EDC9] to-[#EFF8EC]' },
  };

  if (!user) {
    return (
      <>
        <GlobalStyles />
        <div className="min-h-screen w-full bg-[#FAFAF7] relative overflow-hidden flex flex-col items-center justify-center p-6">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#F5A524]/20 to-transparent blur-3xl a-float" />
            <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#5B8FD9]/20 to-transparent blur-3xl" />
          </div>
          <div className="w-full max-w-[440px] a-slide-up relative z-10">
            <div className="flex justify-center mb-12"><div className="bg-white/90 backdrop-blur-xl px-7 py-5 rounded-3xl shadow-sm border border-white"><GSLogo size={56} /></div></div>
            <div className="text-center mb-14">
              <h1 className="text-[40px] font-black tracking-tight text-[#0A1628] leading-tight">건강한 당신이<br/><span className="bg-gradient-to-r from-[#F47B20] via-[#1B3A6B] to-[#5CB85C] bg-clip-text text-transparent">곧 건강한 회사입니다</span></h1>
              <p className="text-[14px] text-[#64748B] mt-5">근골격계 전문 테라피 포털 2026</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
                <div className="px-5 py-3 border-b border-gray-50"><label className="text-[10px] font-bold text-gray-400 uppercase">성함</label><input value={loginForm.name} onChange={e => setLoginForm({ ...loginForm, name: e.target.value })} placeholder="홍길동" className="w-full mt-1 bg-transparent text-[18px] font-black text-black outline-none" /></div>
                <div className="px-5 py-3"><label className="text-[10px] font-bold text-gray-400 uppercase">사번</label><input value={loginForm.empId} onChange={e => setLoginForm({ ...loginForm, empId: e.target.value })} placeholder="C80XXXX" className="w-full mt-1 bg-transparent text-[18px] font-black text-black outline-none" /></div>
              </div>
              <button type="submit" className="w-full bg-[#0A1628] text-white rounded-2xl py-5 font-bold text-[15px] shadow-lg active:scale-[0.98] transition-all">입장하기</button>
            </form>
            <div className="mt-10 text-center flex flex-col gap-8">
              <button onClick={() => setShowAdminGate(true)} className="inline-flex items-center justify-center gap-1.5 text-[12px] text-gray-400 hover:text-[#1B3A6B] font-bold"><Shield size={12} />관리자 접속</button>
              <div className="opacity-60 flex items-center justify-center gap-1.5"><Sparkles size={10} className="text-[#F47B20]" /><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Powered by 부천안전/보건팀</span></div>
            </div>
          </div>
        </div>
        {showAdminGate && <AdminGate pw={adminPw} setPw={setAdminPw} onSubmit={handleAdminAuth} onClose={() => setShowAdminGate(false)} />}
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen bg-[#FAFAF7] flex">
        <aside className="hidden lg:flex flex-col w-[260px] bg-white border-r border-gray-100 sticky top-0 h-screen p-6">
          <div className="mb-10"><GSLogo size={42} onClick={() => setCurrentTab('home')} /></div>
          <nav className="space-y-1 flex-1">
            {[ { id: 'home', icon: Home, label: '홈' }, { id: 'programs', icon: Activity, label: '프로그램' }, { id: 'my', icon: Heart, label: '내 신청 내역', badge: myApplications.length }, ...(isAdmin ? [{ id: 'admin', icon: BarChart3, label: '관리자 대시보드' }] : []) ].map(item => (
              <button key={item.id} onClick={() => setCurrentTab(item.id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-bold transition-all ${currentTab === item.id ? 'bg-[#0A1628] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                <span className="flex items-center gap-3"><item.icon size={17} />{item.label}</span>
                {item.badge > 0 && <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${currentTab === item.id ? 'bg-white text-[#0A1628]' : 'bg-[#F47B20] text-white'}`}>{item.badge}</span>}
              </button>
            ))}
          </nav>
          <div className="mt-auto"><button onClick={() => { setUser(null); setIsAdmin(false); }} className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-500 py-2 hover:bg-gray-50 rounded-lg"><LogOut size={11} />로그아웃</button></div>
        </aside>

        <main className="flex-1 min-w-0 pb-24 lg:pb-8">
          <div className="lg:hidden sticky top-0 z-30 bg-[#FAFAF7]/90 backdrop-blur-xl border-b border-gray-100 px-5 py-3 flex items-center justify-between">
            <GSLogo size={36} onClick={() => setCurrentTab('home')} />
            <div className="flex items-center gap-2.5">
              <button onClick={() => setShowNotifications(true)} className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center relative"><Bell size={14} className="text-[#0A1628]" />{notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F47B20] rounded-full" />}</button>
              <button onClick={() => { setUser(null); setIsAdmin(false); }} className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500"><LogOut size={14} /></button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F47B20] to-[#1B3A6B] flex items-center justify-center text-white font-black text-[13px]">{user.name.charAt(0)}</div>
            </div>
          </div>
          <div className="px-5 lg:px-10 py-6 lg:py-8 max-w-[1400px] mx-auto">
            {currentTab === 'home' && <HomeTab user={user} programs={programs} myApplications={myApplications} colorMap={colorMap} onOpenProgram={openProgramDetail} onGoPrograms={() => setCurrentTab('programs')} />}
            {currentTab === 'programs' && <ProgramsTab filtered={filtered} colorMap={colorMap} searchQ={searchQ} setSearchQ={setSearchQ} filterLoc={filterLoc} setFilterLoc={setFilterLoc} onOpenProgram={openProgramDetail} />}
            {currentTab === 'my' && <MyTab myApplications={myApplications} colorMap={colorMap} onCancel={id => setMyApplications(prev => prev.filter(a => a.id !== id))} onRate={handleRate} onGoPrograms={() => setCurrentTab('programs')} />}
            {currentTab === 'admin' && isAdmin && <AdminPanel programs={programs} setPrograms={setPrograms} registeredUsers={registeredUsers} setRegisteredUsers={setRegisteredUsers} colorMap={colorMap} onRunLottery={handleRunLottery} />}
          </div>
        </main>
      </div>

      {showDetail && selectedProgram && <ProgramDetailSheet program={selectedProgram} onClose={() => setShowDetail(false)} onApply={() => setShowConfirm(true)} colorMap={colorMap} />}
      {showConfirm && selectedProgram && (
        <div className="fixed inset-0 z-[70] flex items-end lg:items-center justify-center bg-[#0A1628]/70 backdrop-blur-sm p-0 lg:p-6 a-fade">
          <div className="bg-white rounded-t-3xl lg:rounded-3xl p-7 w-full lg:max-w-md a-sheet">
            <h3 className="text-[20px] font-black text-center mb-6">신청 정보 확인</h3>
            <div className="bg-gray-50 rounded-2xl p-5 space-y-3 mb-6 border border-gray-100">
              <Row label="신청자" value={user.name} /><Row label="프로그램" value={selectedProgram.title} /><Row label="일시" value={formatDate(selectedProgram.date)} />
            </div>
            <div className="flex gap-2"><button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-bold">취소</button><button onClick={applyProgram} className="flex-[2] bg-[#0A1628] text-white py-4 rounded-2xl font-bold">최종 신청</button></div>
          </div>
        </div>
      )}
      {showSuccess && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/80 p-6 a-fade text-center"><div className="a-zoom"><div className="w-20 h-20 mx-auto mb-6 bg-[#5CB85C] rounded-3xl flex items-center justify-center text-white shadow-xl"><Check size={36} strokeWidth={3}/></div><h2 className="text-[28px] font-black">신청 완료!</h2><p className="text-gray-500 font-bold mt-2">행운을 빕니다 ✨</p></div></div>}
      {lotteryResult && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-6 a-fade">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md a-zoom shadow-2xl">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-50 text-[#1B3A6B] rounded-2xl mx-auto mb-5"><Dna size={32} /></div>
            <h3 className="text-[22px] font-black text-center text-[#0A1628] mb-6">추첨 가동 완료</h3>
            <div dangerouslySetInnerHTML={{ __html: lotteryResult }} />
            <button onClick={() => setLotteryResult(null)} className="w-full mt-6 bg-[#0A1628] text-white py-4 rounded-xl font-black">결과 고정하기</button>
          </div>
        </div>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════
// Tabs & Components
// ══════════════════════════════════════════════════════════

const HomeTab = ({ user, programs, myApplications, colorMap, onOpenProgram, onGoPrograms }) => (
  <div className="space-y-6 a-fade">
    <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0A1628] p-8 lg:p-12 text-white">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#F47B20]/30 to-transparent blur-3xl" />
      <div className="relative">
        <h1 className="text-[32px] lg:text-[48px] font-black leading-tight mb-4">{user.name}님,<br/>오늘도 건강하세요</h1>
        <p className="text-white/60 font-medium mb-8">안전과 보건을 생각하는 부천사업소 전용 포털</p>
        <button onClick={onGoPrograms} className="bg-white text-[#0A1628] px-6 py-3.5 rounded-2xl font-black text-[14px] flex items-center gap-2 shadow-lg">전체 프로그램 보기 <ArrowRight size={16}/></button>
      </div>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
      <StatCard icon={Activity} label="참여 프로그램" value={myApplications.length} suffix="건" accent="#F47B20" />
      <StatCard icon={Users} label="평균 만족도" value="4.9" suffix="/5.0" accent="#5CB85C" />
      <StatCard icon={Award} label="신규 오픈" value={programs.length} suffix="개" accent="#1B3A6B" />
      <StatCard icon={TrendingUp} label="참여 인원" value="124" suffix="명" accent="#F47B20" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {programs.slice(0, 2).map(p => <FeaturedCard key={p.id} program={p} onClick={() => onOpenProgram(p)} colorMap={colorMap} />)}
    </div>
  </div>
);

const ProgramsTab = ({ filtered, colorMap, searchQ, setSearchQ, filterLoc, setFilterLoc, onOpenProgram }) => (
  <div className="space-y-6 a-fade">
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="테라피 이름이나 증상을 검색하세요" className="w-full bg-white border border-gray-100 rounded-3xl pl-12 pr-6 py-5 text-[15px] font-black text-black outline-none focus:border-[#0A1628]" />
      </div>
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {['전체', '안양사업소', '부천사업소', '서울사업소'].map(loc => (
          <button key={loc} onClick={() => setFilterLoc(loc)} className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[13px] font-black transition-all ${filterLoc === loc ? 'bg-[#0A1628] text-white shadow-md' : 'bg-white border border-gray-100 text-gray-400'}`}>{loc}</button>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
      {filtered.map(p => <CompactCard key={p.id} program={p} onClick={() => onOpenProgram(p)} colorMap={colorMap} />)}
    </div>
  </div>
);

// 🔥 [평점 입력 기능 UI 추가]
const MyTab = ({ myApplications, colorMap, onCancel, onRate, onGoPrograms }) => (
  <div className="space-y-6 a-fade">
    <h1 className="text-[28px] font-black text-[#0A1628]">내 신청 내역</h1>
    {myApplications.length === 0 ? (
      <div className="bg-white rounded-3xl p-16 text-center border border-gray-100"><Heart size={32} className="mx-auto mb-4 text-gray-200" /><h3 className="font-black text-gray-400">아직 신청한 프로그램이 없어요</h3><button onClick={onGoPrograms} className="mt-6 bg-[#0A1628] text-white px-6 py-3 rounded-xl font-bold">프로그램 보러가기</button></div>
    ) : (
      <div className="space-y-4">
        {myApplications.map((p, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl ${colorMap[p.color].bg} flex items-center justify-center`}><Stethoscope size={20} style={{color: colorMap[p.color].solid}}/></div><div><h3 className="font-black text-[16px] text-[#0A1628]">{p.title}</h3><p className="text-[11px] text-gray-400 font-bold">{p.location} · {formatDate(p.date)}</p></div></div>
              <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">신청완료</span>
            </div>
            
            {/* 평점 남기기 섹션 */}
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2"><ThumbsUp size={14} className="text-[#F47B20]"/><span className="text-[12px] font-black text-gray-600">참여하신 테라피는 어떠셨나요? 평점을 남겨주세요!</span></div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => onRate(p.id, star)} className="hover:scale-110 transition-transform">
                    <Star size={24} className={`${star <= p.rating ? 'fill-[#F47B20] text-[#F47B20]' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end"><button onClick={() => onCancel(p.id)} className="text-[11px] font-bold text-gray-300 hover:text-red-500 transition-colors">신청 취소하기</button></div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const StatCard = ({ icon: Icon, label, value, suffix, accent }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3`} style={{backgroundColor: `${accent}15`}}><Icon size={16} style={{color: accent}}/></div>
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
    <div className="flex items-baseline gap-1"><span className="text-[24px] font-black text-[#0A1628]">{value}</span><span className="text-[11px] font-bold text-gray-400">{suffix}</span></div>
  </div>
);

const FeaturedCard = ({ program, onClick, colorMap }) => {
  const c = colorMap[program.color];
  const pct = Math.min(100, (program.applied / program.capacity) * 100);
  return (
    <button onClick={onClick} className="group relative text-left bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all p-7">
      <div className={`absolute inset-0 bg-gradient-to-br ${c.soft} opacity-30`} />
      <div className="relative">
        <div className="flex justify-between mb-6"><span className={`text-[10px] font-black uppercase ${c.text}`}>{program.category}</span><StatusBadge status={getProgramStatus(program)}/></div>
        <h3 className="text-[22px] font-black text-[#0A1628] mb-4 leading-tight">{program.title}</h3>
        <div className="space-y-1 text-[12px] text-gray-500 font-bold mb-6"><div className="flex gap-2"><MapPin size={12}/>{program.location}</div><div className="flex gap-2"><Calendar size={12}/>{formatDate(program.date)}</div></div>
        <div className="flex items-center gap-3 mb-6"><div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-black text-[11px] text-white" style={{backgroundColor: c.solid}}>{program.therapist.avatar}</div><div><div className="text-[13px] font-black text-[#0A1628]">{program.therapist.name}</div><div className="text-[11px] text-gray-400">{program.therapist.role}</div></div></div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full transition-all" style={{width: `${pct}%`, backgroundColor: c.solid}} /></div>
      </div>
    </button>
  );
};

const CompactCard = ({ program, onClick, colorMap }) => {
  const c = colorMap[program.color];
  const pct = (program.applied / program.capacity) * 100;
  return (
    <button onClick={onClick} className="w-full text-left bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
      <div className="flex justify-between mb-4"><span className={`text-[10px] font-black px-2 py-1 rounded-lg ${c.bg} ${c.text}`}>{program.category}</span><StatusBadge status={getProgramStatus(program)}/></div>
      <h3 className="font-black text-[#0A1628] mb-4 leading-tight">{program.title}</h3>
      <div className="space-y-1 text-[11px] text-gray-400 font-bold mb-4"><div>{program.location}</div><div>{formatDate(program.date)}</div></div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden"><div className="h-full transition-all" style={{width: `${pct}%`, backgroundColor: c.solid}} /></div>
    </button>
  );
};

const ProgramDetailSheet = ({ program, onClose, onApply, colorMap }) => (
  <div className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center bg-[#0A1628]/70 a-fade" onClick={onClose}>
    <div className="bg-white w-full lg:max-w-lg rounded-t-[2.5rem] p-8 a-sheet overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
      <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
      <div className="flex justify-between mb-6"><StatusBadge status={getProgramStatus(program)}/><button onClick={onClose}><X size={20}/></button></div>
      <h2 className="text-[32px] font-black text-[#0A1628] leading-tight mb-4">{program.title}</h2>
      <p className="text-gray-500 font-medium mb-8 leading-relaxed">{program.desc}</p>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <InfoTile icon={MapPin} label="장소" value={program.location} />
        <InfoTile icon={Calendar} label="마감일" value={formatDate(program.deadline)} />
      </div>
      <button onClick={onApply} disabled={getProgramStatus(program) !== '모집중'} className="w-full bg-[#0A1628] text-white py-5 rounded-[1.5rem] font-black shadow-xl active:scale-95 transition-all disabled:bg-gray-200">신청하기</button>
    </div>
  </div>
);

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="bg-[#FAFAF7] rounded-2xl p-4 border border-gray-100"><div className="flex gap-1.5 items-center text-[10px] font-black text-gray-400 uppercase mb-1.5"><Icon size={12}/>{label}</div><div className="text-[14px] font-black text-[#0A1628]">{value}</div></div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4"><span className="text-gray-400 font-bold text-[13px]">{label}</span><span className="text-[#0A1628] font-black text-[13px]">{value}</span></div>
);

const AdminGate = ({ pw, setPw, onSubmit, onClose }) => (
  <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0A1628]/80 p-6 a-fade">
    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl a-zoom">
      <div className="flex justify-between mb-6"><div className="font-black text-[18px]">관리자 인증</div><button onClick={onClose}><X size={20}/></button></div>
      <form onSubmit={onSubmit}><input type="password" autoFocus value={pw} onChange={e => setPw(e.target.value)} placeholder="비밀번호" className="w-full bg-gray-50 rounded-2xl px-5 py-4 font-black outline-none focus:bg-white border-2 border-transparent focus:border-[#0A1628] mb-3" /><button type="submit" className="w-full bg-[#0A1628] text-white py-4 rounded-2xl font-black">인증하기</button></form>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════
// Admin Dashboard
// ══════════════════════════════════════════════════════════
const AdminPanel = ({ programs, setPrograms, registeredUsers, setRegisteredUsers, colorMap, onRunLottery }) => {
  const [form, setForm] = useState({ titleType: '근골격계 테라피', customTitle: '', category: '물리치료', location: '부천사업소', date: '', deadline: '', capacity: '', therapistName: '', desc: '' });
  const [newUser, setNewUser] = useState({ name: '', empId: '' });

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.empId) return;
    if (supabaseUrl !== 'https://placeholder.supabase.co') {
      await supabase.from('registered_users').insert([{ name: newUser.name, emp_id: newUser.empId.toUpperCase() }]);
    }
    setRegisteredUsers([{ name: newUser.name, empId: newUser.empId.toUpperCase() }, ...registeredUsers]);
    setNewUser({ name: '', empId: '' });
  };

  const handleCreate = async () => {
    const title = form.titleType === '기타' ? form.customTitle : form.titleType;
    const newP = {
      title, location: form.location, date: form.date, deadline: form.deadline, capacity: parseInt(form.capacity),
      applied: 0, therapist_name: form.therapistName, description: form.desc || '건강 테라피 세션입니다.',
      color: form.location.includes('안양') ? 'orange' : form.location.includes('부천') ? 'blue' : 'green'
    };
    if (supabaseUrl !== 'https://placeholder.supabase.co') await supabase.from('programs').insert([newP]);
    alert('게시 완료!');
    window.location.reload(); // 리프레시하여 반영
  };

  const inputCls = "w-full bg-gray-50 border-2 border-transparent rounded-2xl px-4 py-3 text-[14px] font-black text-black outline-none focus:bg-white focus:border-[#0A1628] transition-all";

  return (
    <div className="space-y-8 a-fade">
      <h1 className="text-[28px] font-black text-[#0A1628]">운영자 센터</h1>
      
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-black mb-4 flex items-center gap-2"><UserPlus size={18}/> 임직원 권한 부여</h3>
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="성함" className={inputCls} />
          <input value={newUser.empId} onChange={e => setNewUser({...newUser, empId: e.target.value})} placeholder="사번" className={inputCls} />
          <button onClick={handleAddUser} className="bg-[#0A1628] text-white px-6 py-3 rounded-2xl font-black whitespace-nowrap">등록</button>
        </div>
        <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
          {registeredUsers.map((u, i) => (
            <div key={i} className="flex justify-between bg-gray-50 p-3 rounded-xl">
              <div><span className="font-black text-[13px] text-[#0A1628]">{u.name}</span> <span className="text-[11px] text-gray-400">{u.empId}</span></div>
              <button onClick={async () => {
                if (supabaseUrl !== 'https://placeholder.supabase.co') await supabase.from('registered_users').delete().eq('emp_id', u.empId);
                setRegisteredUsers(registeredUsers.filter(x => x.empId !== u.empId));
              }}><X size={14} className="text-gray-300 hover:text-red-500"/></button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-black mb-4 flex items-center gap-2"><Plus size={18}/> 새 테라피 개설</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="프로그램 명"><select value={form.titleType} onChange={e => setForm({...form, titleType: e.target.value})} className={inputCls}><option>근골격계 테라피</option><option>스트레칭 클래스</option><option>기타</option></select></Field>
          {form.titleType === '기타' && <Field label="직접 입력"><input value={form.customTitle} onChange={e => setForm({...form, customTitle: e.target.value})} className={inputCls} /></Field>}
          <Field label="장소"><select value={form.location} onChange={e => setForm({...form, location: e.target.value})} className={inputCls}><option>부천사업소</option><option>안양사업소</option><option>서울사업소</option></select></Field>
          <Field label="실시일"><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className={inputCls} /></Field>
          <Field label="신청마감일"><input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className={inputCls} /></Field>
          <Field label="모집정원"><input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className={inputCls} /></Field>
          <Field label="강사명"><input value={form.therapistName} onChange={e => setForm({...form, therapistName: e.target.value})} className={inputCls} /></Field>
        </div>
        <button onClick={handleCreate} className="w-full mt-6 bg-[#0A1628] text-white py-4 rounded-2xl font-black shadow-lg">프로그램 게시하기</button>
      </div>

      <div className="space-y-3">
        <h3 className="font-black text-[#0A1628]">프로그램 운영 현황</h3>
        {programs.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center">
            <div><div className="flex items-center gap-2"><h4 className="font-black text-[15px]">{p.title}</h4><StatusBadge status={getProgramStatus(p)}/></div><p className="text-[11px] text-gray-400 font-bold mt-1">{p.location} · {p.applied}/{p.capacity}명 신청</p></div>
            <div className="flex gap-2">
              {getProgramStatus(p) === '모집마감' && <button onClick={() => onRunLottery(p.id)} className="bg-[#F47B20] text-white px-4 py-2 rounded-xl text-[11px] font-black shadow-md">추첨 실행</button>}
              <button onClick={async () => {
                if(confirm('삭제할까요?')) {
                  if (supabaseUrl !== 'https://placeholder.supabase.co') await supabase.from('programs').delete().eq('id', p.id);
                  setPrograms(programs.filter(x => x.id !== p.id));
                }
              }} className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[11px] font-black">삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">{label}</label>{children}</div>
);
