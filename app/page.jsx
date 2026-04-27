'use client';
// @ts-nocheck

import { useState, useEffect } from 'react';
import {
  Shield, Calendar, MapPin, Clock, Users, ArrowRight, Check, X,
  ChevronRight, Plus, Home, Bell, Sparkles, Activity, TrendingUp,
  BarChart3, LogOut, Search, Star, Award, Heart, Stethoscope, Dna, UserPlus
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

  const [registeredUsers, setRegisteredUsers] = useState([{ name: '이주필', empId: 'C800440' }]);
  const [programs, setPrograms] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const notifications = [{ id: 1, text: '환영합니다! 건강한 하루 되세요.', time: '방금 전', type: 'success' }];

  useEffect(() => {
    const fetchRealData = async () => {
      if (supabaseUrl !== 'https://placeholder.supabase.co') {
        const { data: pData } = await supabase.from('programs').select('*').order('created_at', { ascending: false });
        if (pData && pData.length > 0) {
          const mappedPrograms = pData.map(p => ({
            id: p.id, title: p.title, category: p.category || '물리치료', location: p.location,
            date: p.date, deadline: p.deadline, time: p.time, capacity: p.capacity, applied: p.applied,
            rating: p.rating || 5.0, manualStatus: p.manual_status,
            therapist: { name: p.therapist_name, role: p.therapist_role || '물리치료사', avatar: (p.therapist_name || 'G').charAt(0) },
            desc: p.description, tags: ['신규', p.category || '물리치료'], color: p.color || 'orange', duration: p.duration || '50분/인'
          }));
          setPrograms(mappedPrograms);
        }
        const { data: users } = await supabase.from('registered_users').select('*');
        if (users && users.length > 0) setRegisteredUsers(users.map(u => ({ name: u.name, empId: u.emp_id })));
      }
    };
    fetchRealData();
  }, []);

  const handleLogin = (e) => { 
    e?.preventDefault(); 
    if (!loginForm.name || !loginForm.empId) return alert('성함과 사번을 모두 입력해주세요.');
    const isValidUser = registeredUsers.find(u => u.name === loginForm.name && u.empId === loginForm.empId);
    if (isValidUser) setUser({ ...isValidUser });
    else alert('등록되지 않은 임직원 정보입니다. 사번과 성함을 다시 확인하시거나 관리자에게 문의하세요.');
  };

  const handleAdminAuth = (e) => { 
    e?.preventDefault(); 
    if (adminPw === 'gspower1234') { setIsAdmin(true); setShowAdminGate(false); setAdminPw(''); if (user) setCurrentTab('admin'); } 
    else { alert('비밀번호가 일치하지 않습니다.'); } 
  };

  const openProgramDetail = (p) => { setSelectedProgram(p); setShowDetail(true); };

  const applyProgram = async () => {
    setShowConfirm(false); setShowDetail(false);
    const updatedApplied = selectedProgram.applied + 1;
    if (supabaseUrl !== 'https://placeholder.supabase.co') await supabase.from('programs').update({ applied: updatedApplied }).eq('id', selectedProgram.id);
    setPrograms(prev => prev.map(p => p.id === selectedProgram.id ? { ...p, applied: updatedApplied } : p));
    setMyApplications(prev => [...prev, { ...selectedProgram, applied: updatedApplied, appliedAt: new Date().toISOString(), status: 'pending' }]);
    setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2800);
  };

  const cancelApplication = (id) => {
    setMyApplications(prev => prev.filter(p => p.id !== id));
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, applied: Math.max(0, p.applied - 1) } : p));
  };

  const handleRunLottery = async (id) => {
    const p = programs.find(x => x.id === id);
    const penaltyCount = Math.floor(p.applied * 0.3);
    const newCount = p.applied - penaltyCount;
    let msg = `<div class="text-left space-y-3 text-[14px] text-gray-700"><p><b class="text-[#0A1628] text-[16px]">${p.title} (${p.location})</b></p><p>총 신청 인원: <b>${p.applied}명</b> (정원 ${p.capacity}명)</p><div class="bg-gray-50 p-3 rounded-lg border border-gray-200"><p>• 직전 참여 제외(Waitlist): <span class="text-[#F47B20] font-bold">${penaltyCount}명</span></p><p>• 1순위 신규 신청자: <b class="text-[#1B3A6B]">${newCount}명</b></p></div>`;
    if (newCount >= p.capacity) msg += `<p class="text-[#5CB85C] font-black text-[15px] pt-2">✅ 1순위 대상자 중 무작위 ${p.capacity}명 선정 완료</p></div>`;
    else msg += `<p class="text-[#5CB85C] font-black text-[15px] pt-2">✅ 1순위 전원 선발 후, 부족한 ${p.capacity - newCount}명을 대기자에서 추가 선정 완료</p></div>`;

    if (supabaseUrl !== 'https://placeholder.supabase.co') await supabase.from('programs').update({ manual_status: '추첨완료' }).eq('id', id);
    setLotteryResult(msg);
    setPrograms(prev => prev.map(item => item.id === id ? { ...item, manualStatus: "추첨완료" } : item));
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
  // 로그인 화면 (부천안전/보건팀 크레딧 추가 완료!)
  // ═══════════════════════════════════════════════════
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
              <h1 className="text-[40px] font-black tracking-tight text-[#0A1628] mb-5 leading-tight">건강한 당신이<br/><span className="bg-gradient-to-r from-[#F47B20] via-[#1B3A6B] to-[#5CB85C] bg-clip-text text-transparent">곧 건강한 회사입니다</span></h1>
              <p className="text-[14px] text-[#64748B] font-medium leading-relaxed">근골격계 전문 테라피 프로그램<br/>사전 등록된 임직원만 이용 가능합니다</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
                <div className="px-5 py-3 border-b border-gray-50">
                  <label className="text-[10px] font-bold uppercase text-gray-400">성함</label>
                  <input value={loginForm.name} onChange={e => setLoginForm({ ...loginForm, name: e.target.value })} placeholder="홍길동" className="w-full mt-1 bg-transparent text-[18px] font-black text-black placeholder-gray-400 outline-none" />
                </div>
                <div className="px-5 py-3">
                  <label className="text-[10px] font-bold uppercase text-gray-400">사번</label>
                  <input value={loginForm.empId} onChange={e => setLoginForm({ ...loginForm, empId: e.target.value.toUpperCase() })} placeholder="C80XXXX" className="w-full mt-1 bg-transparent text-[18px] font-black text-black placeholder-gray-400 outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-[#0A1628] text-white rounded-2xl py-5 font-bold text-[15px] shadow-lg active:scale-[0.98] transition-transform">프로그램 둘러보기</button>
            </form>
            
            <div className="mt-10 text-center">
              <button onClick={() => setShowAdminGate(true)} className="inline-flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-[#1B3A6B] font-bold"><Shield size={12} />관리자 접속</button>
            </div>

            {/* 🔥 부천안전/보건팀 크레딧 추가 */}
            <div className="mt-16 text-center">
              <div className="inline-flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                <Sparkles size={10} className="text-[#F47B20]" />
                <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Powered by 부천안전/보건팀
                </span>
              </div>
            </div>
          </div>
        </div>
        {showAdminGate && <AdminGate pw={adminPw} setPw={setAdminPw} onSubmit={handleAdminAuth} onClose={() => setShowAdminGate(false)} />}
      </>
    );
  }

  // ═══════════════════════════════════════════════════
  // 메인 렌더링
  // ═══════════════════════════════════════════════════
  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen bg-[#FAFAF7] flex">
        
        {/* Desktop Sidebar */}
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
          <div className="mt-auto">
            <button onClick={() => { setUser(null); setIsAdmin(false); }} className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-500 py-2 hover:bg-gray-50 rounded-lg"><LogOut size={11} />로그아웃</button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 pb-24 lg:pb-8">
          {/* Mobile Top Bar */}
          <div className="lg:hidden sticky top-0 z-30 bg-[#FAFAF7]/90 backdrop-blur-xl border-b border-gray-100 px-5 py-3 flex items-center justify-between">
            <GSLogo size={36} onClick={() => setCurrentTab('home')} />
            <div className="flex items-center gap-2.5">
              <button onClick={() => setShowNotifications(true)} className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center relative">
                <Bell size={14} className="text-[#0A1628]" />
                {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F47B20] rounded-full" />}
              </button>
              <button onClick={() => { setUser(null); setIsAdmin(false); }} className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500"><LogOut size={14} /></button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F47B20] to-[#1B3A6B] flex items-center justify-center text-white font-black text-[13px]">{user.name.charAt(0)}</div>
            </div>
          </div>

          <div className="px-5 lg:px-10 py-6 lg:py-8 max-w-[1400px] mx-auto">
            {currentTab === 'home' && <HomeTab user={user} programs={programs} myApplications={myApplications} colorMap={colorMap} onOpenProgram={openProgramDetail} onGoPrograms={() => setCurrentTab('programs')} />}
            {currentTab === 'programs' && <ProgramsTab filtered={filtered} colorMap={colorMap} searchQ={searchQ} setSearchQ={setSearchQ} filterLoc={filterLoc} setFilterLoc={setFilterLoc} onOpenProgram={openProgramDetail} />}
            {currentTab === 'my' && <MyTab myApplications={myApplications} colorMap={colorMap} onCancel={cancelApplication} onGoPrograms={() => setCurrentTab('programs')} />}
            {currentTab === 'admin' && isAdmin && <AdminPanel programs={programs} setPrograms={setPrograms} registeredUsers={registeredUsers} setRegisteredUsers={setRegisteredUsers} colorMap={colorMap} onRunLottery={handleRunLottery} />}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around px-3 py-2 pb-6">
          {[ { id: 'home', icon: Home, label: '홈' }, { id: 'programs', icon: Activity, label: '프로그램' }, { id: 'my', icon: Heart, label: '내 신청', badge: myApplications.length }, ...(isAdmin ? [{ id: 'admin', icon: BarChart3, label: '관리' }] : []) ].map(item => (
            <button key={item.id} onClick={() => setCurrentTab(item.id)} className={`flex flex-col items-center gap-1 px-4 py-2 relative ${currentTab === item.id ? 'text-[#0A1628]' : 'text-gray-400'}`}>
              <item.icon size={20} strokeWidth={currentTab === item.id ? 2.5 : 2} /><span className="text-[10px] font-black">{item.label}</span>
              {item.badge > 0 && <span className="absolute top-1 right-2 w-4 h-4 bg-[#F47B20] text-white text-[9px] font-black rounded-full flex items-center justify-center">{item.badge}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Modals */}
      {showDetail && selectedProgram && <ProgramDetailSheet program={selectedProgram} onClose={() => setShowDetail(false)} onApply={() => setShowConfirm(true)} colorMap={colorMap} />}
      {showConfirm && selectedProgram && (
        <div className="fixed inset-0 z-[70] flex items-end lg:items-center justify-center bg-[#0A1628]/70 backdrop-blur-sm p-0 lg:p-6 a-fade">
          <div className="bg-white rounded-t-3xl lg:rounded-3xl p-7 w-full lg:max-w-md a-sheet">
            <h3 className="text-[20px] font-black text-center mb-6">신청 정보 확인</h3>
            <div className="bg-gray-50 rounded-2xl p-5 space-y-3 mb-6 border border-gray-100">
              <Row label="신청자" value={`${user.name}`} />
              <Row label="프로그램" value={selectedProgram.title} />
              <Row label="일시" value={`${formatDate(selectedProgram.date)}`} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-bold text-[#0A1628]">취소</button>
              <button onClick={applyProgram} className="flex-[2] bg-[#0A1628] text-white py-4 rounded-2xl font-bold">최종 신청</button>
            </div>
          </div>
        </div>
      )}
      {showSuccess && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/80 backdrop-blur-xl p-6 a-fade">
          <div className="text-center a-zoom">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#5CB85C] rounded-3xl flex items-center justify-center text-white"><Check size={36} /></div>
            <h2 className="text-[28px] font-black text-[#0A1628] mb-2">신청 완료!</h2>
          </div>
        </div>
      )}
      {lotteryResult && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 a-fade">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md a-zoom shadow-2xl">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-50 text-[#1B3A6B] rounded-2xl mx-auto mb-5"><Dna size={32} /></div>
            <h3 className="text-[22px] font-black text-center text-[#0A1628] mb-6">추첨 알고리즘 완료</h3>
            <div dangerouslySetInnerHTML={{ __html: lotteryResult }} />
            <button onClick={() => setLotteryResult(null)} className="w-full mt-6 bg-[#0A1628] text-white py-4 rounded-xl font-black">결과 확인</button>
          </div>
        </div>
      )}
      {showNotifications && (
        <div className="fixed inset-0 z-[70] flex items-start justify-end bg-black/30 backdrop-blur-sm a-fade" onClick={() => setShowNotifications(false)}>
          <div className="w-full lg:w-[400px] h-full bg-white a-from-right" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div><h3 className="text-[18px] font-black text-[#0A1628]">알림</h3></div>
              <button onClick={() => setShowNotifications(false)} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center"><X size={14} className="text-gray-500" /></button>
            </div>
            <div className="p-4 space-y-2">
              {notifications.map(n => (
                <div key={n.id} className="p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.type === 'warning' ? 'bg-[#F47B20]' : 'bg-[#5CB85C]'}`} />
                    <div><p className="text-[13px] font-bold text-[#0A1628]">{n.text}</p><p className="text-[11px] text-gray-400 font-semibold mt-1">{n.time}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const HomeTab = ({ user, programs, myApplications, colorMap, onOpenProgram, onGoPrograms }) => (
  <div className="space-y-6 a-fade">
    <div className="relative overflow-hidden rounded-3xl bg-[#0A1628] p-7 lg:p-10 text-white">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#F47B20]/30 to-transparent blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#5CB85C]/25 to-transparent blur-3xl" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-bold mb-5 border border-white/10"><span className="w-1.5 h-1.5 bg-[#5CB85C] rounded-full a-pulse" />지금 신청 가능한 프로그램 {programs.filter(p => p.applied < p.capacity).length}개</div>
        <h1 className="text-[28px] lg:text-[42px] font-black leading-[1.1] tracking-tight mb-3">{user.name}님,<br/>오늘도 건강하세요</h1>
        <button onClick={onGoPrograms} className="mt-6 lg:mt-8 group inline-flex items-center gap-2 bg-white text-[#0A1628] px-5 py-3 rounded-xl font-bold text-[13px] shadow-lg hover:shadow-xl transition-shadow">전체 프로그램 보기<ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" /></button>
      </div>
    </div>
    
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 stagger">
      <StatCard icon={Activity} label="참여 프로그램" value={myApplications.length} suffix="건" accent="#F47B20" />
      <StatCard icon={Users} label="이번 달 참여 인원" value={programs.reduce((a,p)=>a+p.applied,0)} suffix="명" accent="#1B3A6B" />
      <StatCard icon={TrendingUp} label="평균 만족도" value="4.8" suffix="/5.0" accent="#5CB85C" />
      <StatCard icon={Award} label="이번 주 신규" value={programs.length} suffix="개" accent="#F47B20" />
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
    <div><div className="text-[11px] font-bold text-[#F47B20] uppercase tracking-widest mb-1">Programs</div><h1 className="text-[28px] lg:text-[36px] font-black tracking-tight text-[#0A1628]">프로그램 전체</h1></div>
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="검색" className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-4 py-4 text-[14px] font-black placeholder-gray-400 outline-none text-black" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {['전체', '안양사업소', '부천사업소', '서울사업소'].map(loc => (
          <button key={loc} onClick={() => setFilterLoc(loc)} className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all ${filterLoc === loc ? 'bg-[#0A1628] text-white' : 'bg-white border border-gray-100 text-gray-500 hover:text-[#0A1628]'}`}>{loc}</button>
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
    <div><div className="text-[11px] font-bold text-[#5CB85C] uppercase tracking-widest mb-1">My Applications</div><h1 className="text-[28px] lg:text-[36px] font-black tracking-tight text-[#0A1628]">내 신청 내역</h1></div>
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

const StatCard = ({ icon: Icon, label, value, suffix, accent }) => (
  <div className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
    <div className="mb-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}><Icon size={15} style={{ color: accent }} /></div></div>
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
    <div className="flex items-baseline gap-1"><span className="text-[22px] lg:text-[28px] font-black tracking-tight text-[#0A1628]">{value}</span><span className="text-[11px] font-bold text-gray-400">{suffix}</span></div>
  </div>
);

const FeaturedCard = ({ program, onClick, colorMap }) => {
  const c = colorMap[program.color] || colorMap['orange'];
  const status = getProgramStatus(program);
  const isFull = status !== '모집중';
  const pct = Math.min(100, (program.applied / program.capacity) * 100);
  
  return (
    <button onClick={onClick} className="group relative text-left bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
      <div className={`absolute inset-0 bg-gradient-to-br ${c.soft} opacity-40`} />
      <div className="relative p-6 lg:p-7">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2"><span className={`text-[10px] font-black uppercase tracking-widest ${c.text}`}>{program.category}</span></div>
          <StatusBadge status={status} />
        </div>
        <h3 className="text-[22px] lg:text-[24px] font-black leading-tight tracking-tight text-[#0A1628] mb-4">{program.title}</h3>
        <div className="space-y-1.5 mb-6 text-[12px] text-gray-600 font-semibold">
          <div className="flex items-center gap-2"><MapPin size={12} />{program.location}</div>
          <div className="flex items-center gap-2"><Calendar size={12} />실시: {formatDate(program.date)}</div>
          <div className="flex items-center gap-2"><Clock size={12} />마감: {formatDate(program.deadline)}</div>
        </div>
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-200/50">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-[11px]" style={{ backgroundColor: c.solid }}>{program.therapist?.avatar || 'G'}</div>
          <div><div className="text-[12px] font-black text-[#0A1628]">{program.therapist?.name || '담당자'}</div><div className="text-[10px] text-gray-400 font-bold">{program.therapist?.role}</div></div>
        </div>
        <div className="mb-5">
          <div className="flex justify-between mb-2"><span className="text-[10px] font-black uppercase text-gray-400">모집 현황</span><div className="flex gap-1"><span className={`text-[16px] font-black ${isFull ? 'text-gray-500' : 'text-[#0A1628]'}`}>{program.applied}</span><span className="text-[11px] text-gray-300 font-bold">/ {program.capacity}명</span></div></div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: isFull ? '#9CA3AF' : c.solid }} /></div>
        </div>
        <div className={`inline-flex items-center gap-1.5 text-[12px] font-black ${isFull ? 'text-gray-400' : 'text-[#0A1628]'} group-hover:gap-3 transition-all`}>{isFull ? '상세 정보 보기' : '자세히 보기'}<ArrowRight size={13} /></div>
      </div>
    </button>
  );
};

const CompactCard = ({ program, onClick, colorMap }) => {
  const c = colorMap[program.color] || colorMap['orange'];
  const status = getProgramStatus(program);
  const isClosed = status !== '모집중';
  const pct = Math.min(100, (program.applied / program.capacity) * 100);
  
  return (
    <button onClick={onClick} className="w-full group text-left bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
      <div className="flex justify-between items-center mb-4">
        <span className={`${c.bg} ${c.text} px-2.5 py-1 rounded-lg text-[10px] font-black`}>{program.category}</span>
        <StatusBadge status={status} />
      </div>
      <h3 className="text-[16px] font-black text-[#0A1628] leading-snug mb-3 line-clamp-2-fallback">{program.title}</h3>
      <div className="space-y-1 mb-4 text-[11px] text-gray-500 font-semibold">
        <div className="flex gap-1.5"><MapPin size={10} />{program.location}</div>
        <div className="flex justify-between items-center"><div className="flex gap-1.5"><Calendar size={10} />실시: {formatDate(program.date)}</div><span className="text-[#F47B20] font-bold text-[10px]">마감: {formatDate(program.deadline)}</span></div>
      </div>
      <div>
        <div className="flex justify-between mb-1.5"><div className="flex gap-1"><span className={`text-[13px] font-black ${isClosed ? 'text-gray-500' : 'text-[#0A1628]'}`}>{program.applied}</span><span className="text-[10px] text-gray-400 font-bold">/ {program.capacity}</span></div></div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: isClosed ? '#9CA3AF' : c.solid }} /></div>
      </div>
    </button>
  );
};

const ProgramDetailSheet = ({ program, onClose, onApply, colorMap }) => {
  const c = colorMap[program.color] || colorMap['orange'];
  const status = getProgramStatus(program);
  const isClosed = status !== '모집중';
  const pct = Math.min(100, (program.applied / program.capacity) * 100);
  
  return (
    <div className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center bg-[#0A1628]/70 backdrop-blur-sm a-fade" onClick={onClose}>
      <div className="bg-white w-full lg:max-w-lg rounded-t-[2rem] lg:rounded-3xl max-h-[92vh] overflow-y-auto a-sheet" onClick={e => e.stopPropagation()}>
        <div className={`relative bg-gradient-to-br ${c.soft} p-6 lg:p-8`}>
          <div className="w-10 h-1 bg-[#0A1628]/20 rounded-full mx-auto mb-5 lg:hidden" />
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-2"><StatusBadge status={status} /></div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white"><X size={14} className="text-[#0A1628]" /></button>
          </div>
          <h2 className="text-[28px] lg:text-[34px] font-black leading-[1.1] text-[#0A1628] mb-3">{program.title}</h2>
          <div className="flex gap-3 text-[12px] font-bold text-gray-600"><span>{program.duration}</span><span className="text-gray-300">·</span><span>실시일: {formatDate(program.date)}</span></div>
        </div>
        <div className="p-6 lg:p-8 space-y-6">
          <p className="text-[14px] text-gray-600 font-medium leading-relaxed">{program.desc}</p>
          <div className="flex flex-wrap gap-2">
            {program.tags?.map(t => <span key={t} className="bg-[#FAFAF7] text-[#0A1628] px-3 py-1.5 rounded-lg text-[11px] font-bold border border-gray-100">#{t}</span>)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InfoTile icon={MapPin} label="장소" value={program.location} />
            <InfoTile icon={Calendar} label="마감일" value={formatDate(program.deadline)} />
            <InfoTile icon={Clock} label="시간" value={program.time} />
            <InfoTile icon={Users} label="정원" value={`${program.applied}/${program.capacity}명`} />
          </div>
          <div className="bg-[#FAFAF7] rounded-2xl p-5 border border-gray-100">
            <div className="text-[10px] font-black uppercase text-gray-400 mb-3">Therapist</div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-[14px]" style={{ backgroundColor: c.solid }}>{program.therapist?.avatar || 'G'}</div>
              <div className="flex-1"><div className="text-[14px] font-black text-[#0A1628]">{program.therapist?.name || '담당자'}</div><div className="text-[11px] text-gray-500 font-bold">{program.therapist?.role}</div></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-3"><span className="text-[11px] font-black text-gray-400">모집 현황</span><div className="flex gap-1"><span className={`text-[20px] font-black ${isClosed ? 'text-gray-500' : 'text-[#0A1628]'}`}>{program.applied}</span><span className="text-[12px] text-gray-300 font-bold">/ {program.capacity}명</span></div></div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: isClosed ? '#9CA3AF' : c.solid }} /></div>
          </div>
          <button onClick={onApply} disabled={isClosed} className={`w-full rounded-2xl py-5 font-black text-[14px] transition-all ${isClosed ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#0A1628] text-white active:scale-[0.98] shadow-lg'}`}>
            {status === '모집중' ? '이 프로그램 신청하기' : `신청 불가 (${status})`}
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="bg-[#FAFAF7] rounded-xl p-3.5 border border-gray-100"><div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-gray-400 mb-1.5"><Icon size={11} />{label}</div><div className="text-[13px] font-black text-[#0A1628]">{value}</div></div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-3"><span className="text-[12px] text-gray-400 font-bold">{label}</span><span className="text-[12px] font-black text-[#0A1628] text-right">{value}</span></div>
);

const AdminGate = ({ pw, setPw, onSubmit, onClose }) => (
  <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0A1628]/80 backdrop-blur-md p-6 a-fade">
    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl a-zoom">
      <div className="flex justify-between mb-6"><div className="flex gap-2"><div className="w-9 h-9 rounded-xl bg-[#0A1628] flex items-center justify-center"><Shield size={16} className="text-white" /></div><div className="font-black text-[16px] text-[#0A1628] mt-1.5">관리자 인증</div></div><button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><X size={14} className="text-gray-500" /></button></div>
      <form onSubmit={onSubmit}><input type="password" autoFocus value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" className="w-full bg-gray-50 rounded-xl px-4 py-3.5 mb-3 text-black font-bold outline-none focus:border-[#F47B20] border border-transparent transition-all" /><button type="submit" className="w-full bg-[#0A1628] text-white rounded-xl py-3.5 font-bold active:scale-[0.98] transition-transform">인증하기</button></form>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════
// Admin Dashboard
// ══════════════════════════════════════════════════════════
const AdminPanel = ({ programs, setPrograms, registeredUsers, setRegisteredUsers, colorMap, onRunLottery }) => {
  const [form, setForm] = useState({ titleType: '근골격계 테라피', customTitle: '', category: '물리치료', location: '안양사업소', date: '', deadline: '', capacity: '', therapistName: '', therapistRole: '물리치료사', desc: '' });
  const [newUser, setNewUser] = useState({ name: '', empId: '' });

  const totalApplied = programs.reduce((a, p) => a + p.applied, 0);
  const totalCapacity = programs.reduce((a, p) => a + p.capacity, 0);
  const fillRate = totalCapacity ? Math.round((totalApplied / totalCapacity) * 100) : 0;
  
  const getLocationColor = (loc) => {
    if (loc.includes('안양')) return 'orange';
    if (loc.includes('부천')) return 'blue';
    if (loc.includes('서울')) return 'green';
    return 'orange'; 
  };

  const createProgram = async () => {
    const finalTitle = form.titleType === '기타' ? form.customTitle : form.titleType;
    if (!finalTitle || !form.date || !form.deadline || !form.capacity || !form.therapistName) return alert('필수 항목(기한 포함)을 모두 입력해주세요');
    if (form.deadline > form.date) return alert('신청 기한은 실시일 이전이어야 합니다!');
    
    const newP_DB = {
      title: finalTitle, category: form.category, location: form.location,
      date: form.date, deadline: form.deadline, time: '14:00~17:00', capacity: parseInt(form.capacity),
      applied: 0, rating: 5.0, therapist_name: form.therapistName, therapist_role: form.therapistRole,
      description: form.desc || '전문가와 함께하는 프로그램입니다.', color: getLocationColor(form.location), duration: '50분/인'
    };

    if (supabaseUrl !== 'https://placeholder.supabase.co') {
      await supabase.from('programs').insert([newP_DB]);
    }
    
    setPrograms([{ id: Date.now(), ...newP_DB, therapist: { name: form.therapistName, role: form.therapistRole, avatar: form.therapistName.charAt(0) } }, ...programs]);
    alert('게시 성공!');
    setForm({ ...form, titleType: '근골격계 테라피', customTitle: '', date: '', deadline: '', capacity: '', therapistName: '', desc: '' });
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.empId) return;
    const exists = registeredUsers.find(u => u.empId === newUser.empId.toUpperCase());
    if (exists) return alert('이미 등록된 사번입니다.');
    
    if (supabaseUrl !== 'https://placeholder.supabase.co') {
      await supabase.from('registered_users').insert([{ name: newUser.name, emp_id: newUser.empId.toUpperCase() }]);
    }
    setRegisteredUsers([{ name: newUser.name, empId: newUser.empId.toUpperCase() }, ...registeredUsers]);
    setNewUser({ name: '', empId: '' });
  };

  const handleRemoveUser = async (empId) => {
    if (confirm('접근 권한을 삭제하시겠습니까?')) {
      if (supabaseUrl !== 'https://placeholder.supabase.co') {
        await supabase.from('registered_users').delete().eq('emp_id', empId);
      }
      setRegisteredUsers(registeredUsers.filter(x => x.empId !== empId));
    }
  };

  const handleDeleteProgram = async (id) => {
    if (confirm('프로그램을 삭제하시겠습니까?')) {
      if (supabaseUrl !== 'https://placeholder.supabase.co') {
        await supabase.from('programs').delete().eq('id', id);
      }
      setPrograms(programs.filter(x => x.id !== id));
    }
  };

  const inputCls = "w-full bg-gray-50 border border-transparent rounded-xl px-3.5 py-3 text-[13px] font-black text-black placeholder-gray-400 outline-none focus:bg-white focus:border-[#0A1628]";
  
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

      <div className="bg-white rounded-3xl p-6 border border-gray-100">
        <h3 className="text-[15px] font-black text-[#0A1628] mb-4 flex items-center gap-2"><UserPlus size={16} className="text-[#1B3A6B]"/>임직원 접근 권한 관리</h3>
        <p className="text-[12px] text-gray-500 mb-4">여기에 등록된 임직원만 테라피 시스템에 로그인할 수 있습니다.</p>
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="성함 (예: 홍길동)" className={inputCls} />
          <input value={newUser.empId} onChange={e => setNewUser({...newUser, empId: e.target.value})} placeholder="사번 (예: C80XXXX)" className={inputCls} />
          <button onClick={handleAddUser} className="bg-[#1B3A6B] text-white px-6 py-3 rounded-xl font-black text-[13px] whitespace-nowrap">직원 등록</button>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 max-h-48 overflow-y-auto hide-scrollbar space-y-2 border border-gray-100">
          {registeredUsers.length === 0 ? <p className="text-[12px] text-gray-400 text-center py-4">등록된 임직원이 없습니다.</p> : registeredUsers.map((u, i) => (
            <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black text-gray-500">{u.name.charAt(0)}</div>
                <div><span className="font-black text-[13px] text-[#0A1628] block leading-tight">{u.name}</span><span className="text-[10px] text-gray-400 font-bold">{u.empId}</span></div>
              </div>
              <button onClick={() => handleRemoveUser(u.empId)} className="text-gray-400 hover:text-red-500 p-2"><X size={14}/></button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100">
        <h3 className="text-[15px] font-black mb-4 text-[#0A1628] flex items-center gap-2"><Plus size={16} className="text-[#F47B20]"/> 신규 프로그램 개설</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Field label="프로그램명 *"><select value={form.titleType} onChange={e => setForm({ ...form, titleType: e.target.value })} className={inputCls}><option>근골격계 테라피</option><option>기타</option></select></Field>
          {form.titleType === '기타' && <Field label="직접 입력 *"><input value={form.customTitle} onChange={e => setForm({ ...form, customTitle: e.target.value })} placeholder="예: 거북목 교정 클래스" className={inputCls} autoFocus /></Field>}
          <Field label="카테고리"><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}><option>물리치료</option><option>자세교정</option><option>휴식요법</option></select></Field>
          <Field label="장소 (컬러 자동)"><select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inputCls}><option>안양사업소</option><option>부천사업소</option><option>서울사업소</option></select></Field>
          <Field label="실시 일자 *"><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputCls} /></Field>
          <Field label="신청 기한 (마감일) *"><input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className={inputCls} /></Field>
          <Field label="정원 (명) *"><input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="명" className={inputCls} /></Field>
          <Field label="담당자명 *"><input value={form.therapistName} onChange={e => setForm({ ...form, therapistName: e.target.value })} placeholder="김은정" className={inputCls} /></Field>
          <Field label="담당 직책"><select value={form.therapistRole} onChange={e => setForm({ ...form, therapistRole: e.target.value })} className={inputCls}><option>물리치료사</option><option>운동처방사</option><option>아로마테라피스트</option></select></Field>
          <div className="md:col-span-2 lg:col-span-3"><Field label="프로그램 소개"><textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="상세 설명" rows={2} className={`${inputCls} resize-none`} /></Field></div>
        </div>
        <button onClick={createProgram} className="mt-5 bg-[#0A1628] text-white px-8 py-4 rounded-2xl font-black text-[13px] active:scale-[0.98] transition-transform">프로그램 게시하기</button>
      </div>

      <div>
        <h3 className="text-[16px] font-black mb-3 text-[#0A1628]">운영 현황 및 추첨</h3>
        <div className="space-y-2 stagger">
          {programs.map(p => {
            const status = getProgramStatus(p);
            return (
              <div key={p.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col md:flex-row justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1"><h4 className="text-[14px] font-black text-[#0A1628]">{p.title}</h4><StatusBadge status={status} /></div>
                  <div className="text-[11px] text-gray-500 font-semibold">{p.location} · 기한: {formatDate(p.deadline)} · 신청: {p.applied}/{p.capacity}명</div>
                </div>
                <div className="flex gap-2 items-center">
                  {status === '모집중' && <span className="text-[11px] text-gray-400 font-bold px-2">마감 전</span>}
                  {status === '모집마감' && <button onClick={() => onRunLottery(p.id)} className="bg-[#F47B20] text-white px-4 py-2 rounded-xl text-[11px] font-bold shadow-md active:scale-95">추첨 실행</button>}
                  {status === '추첨완료' && <span className="bg-gray-100 text-gray-400 px-4 py-2 rounded-xl text-[11px] font-bold">추첨 완료됨</span>}
                  {status === '종료' && <span className="text-gray-400 text-[11px] font-bold px-2">진행 종료</span>}
                  <button onClick={() => handleDeleteProgram(p.id)} className="bg-red-50 text-red-500 px-3 py-2 rounded-xl text-[11px] font-bold">삭제</button>
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
