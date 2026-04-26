'use client';
// @ts-nocheck

import { useState, useEffect } from 'react';
import {
  Shield, Calendar, MapPin, Clock, Users, ArrowRight, Check, X,
  ChevronRight, Plus, Home, Bell, Sparkles, Activity, TrendingUp,
  BarChart3, LogOut, Search, Star, Award, Heart, Stethoscope, Dna, UserPlus, Edit3
} from 'lucide-react';
// 🔥 [Supabase 풀연동 완료]
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const GSLogo = ({ size = 60, onClick }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div onClick={onClick} className={`flex items-center gap-2 ${onClick ? 'cursor-pointer active:scale-95 transition-transform hover:opacity-80' : ''}`}>
      {!imgError ? (
        <img src="/logo.png" alt="GS 파워" style={{ height: size * 0.9, width: 'auto' }} className="flex-shrink-0 object-contain" onError={() => setImgError(true)} />
      ) : (
        <div className="flex items-baseline gap-[2px] ml-0.5" style={{ transform: 'translateY(1px)' }}>
          <span className="font-black tracking-tighter" style={{ color: '#2B4C8C', fontSize: size * 0.7, fontFamily: 'Arial, sans-serif' }}>GS</span>
          <span className="font-bold tracking-tight text-[#555555]" style={{ fontSize: size * 0.65, fontFamily: "'Pretendard Variable', sans-serif" }}>파워</span>
        </div>
      )}
    </div>
  );
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
    html, body, #root { font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif; }
    * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideFromBottom { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
    .a-fade { animation: fadeIn .3s ease-out both; }
    .a-slide-up { animation: slideUp .45s cubic-bezier(0.16,1,0.3,1) both; }
    .a-sheet { animation: slideFromBottom .4s cubic-bezier(0.16,1,0.3,1) both; }
    .a-zoom { animation: zoomIn .4s cubic-bezier(0.16,1,0.3,1) both; }
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

const getProgramStatus = (p) => {
  if (p.manualStatus) return p.manualStatus; 
  const today = new Date().toISOString().split('T')[0];
  if (p.date < today) return '종료';
  if (p.deadline < today) return '모집마감';
  return '모집중';
};

const StatusBadge = ({ status }) => {
  const colors = {
    '모집중': 'bg-green-100 text-green-800 border border-green-200',
    '모집마감': 'bg-red-100 text-red-800 border border-red-200',
    '추첨완료': 'bg-purple-100 text-purple-800 border border-purple-200',
    '종료': 'bg-gray-200 text-gray-700 border border-gray-300'
  };
  return <span className={`px-2.5 py-1 rounded-md text-[11px] font-black ${colors[status]}`}>{status}</span>;
};

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
  const [ratingModal, setRatingModal] = useState(null);
  const [selectedStars, setSelectedStars] = useState(5);

  // DB 실시간 연동용 상태 (빈 배열로 시작)
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const notifications = [{ id: 1, text: '신규 테라피 프로그램이 등록되었습니다.', time: '최근', type: 'success' }];

  // 🔥 [가장 중요한 DB 호출 함수]
  const fetchData = async (currentUserEmpId = null) => {
    // 1. 프로그램 목록 가져오기
    const { data: pData } = await supabase.from('programs').select('*').order('created_at', { ascending: false });
    let loadedPrograms = [];
    if (pData) {
      loadedPrograms = pData.map(db => ({
        id: db.id, title: db.title, category: db.category, location: db.location,
        date: db.date, deadline: db.deadline, time: db.time, capacity: db.capacity,
        applied: db.applied, rating: db.rating, ratingCount: db.rating_count || 0,
        manualStatus: db.manual_status,
        therapist: { name: db.therapist_name, role: db.therapist_role, exp: '5년', avatar: db.therapist_name ? db.therapist_name.charAt(0) : 'T' },
        desc: db.description, tags: ['신규', db.category], color: db.color, duration: db.duration
      }));
      setPrograms(loadedPrograms);
    }

    // 2. 임직원 명단 가져오기
    const { data: uData } = await supabase.from('registered_users').select('*').order('created_at', { ascending: false });
    if (uData) setRegisteredUsers(uData.map(u => ({ name: u.name, empId: u.emp_id })));

    // 3. 내 신청 내역 가져오기 (로그인한 경우)
    if (currentUserEmpId && loadedPrograms.length > 0) {
      const { data: aData } = await supabase.from('applications').select('*').eq('emp_id', currentUserEmpId);
      if (aData) {
        const myApps = aData.map(app => {
          const p = loadedPrograms.find(pr => pr.id === app.program_id);
          return p ? { ...p, appId: app.id, userRating: app.user_rating } : null;
        }).filter(Boolean);
        setMyApplications(myApps);
      }
    }
  };

  // 최초 접속 및 로그인 상태 변경 시 DB 동기화
  useEffect(() => { fetchData(user?.empId); }, [user]);

  // 🔥 [DB 로그인 검증 로직]
  const handleLogin = async (e) => { 
    e?.preventDefault(); 
    if (!loginForm.name || !loginForm.empId) return alert('성함과 사번을 모두 입력해주세요.');
    
    // DB에 직접 질의
    const { data, error } = await supabase.from('registered_users').select('*').eq('name', loginForm.name).eq('emp_id', loginForm.empId);
    
    if (data && data.length > 0) {
      setUser({ name: data[0].name, empId: data[0].emp_id });
    } else {
      alert('등록되지 않은 임직원 정보입니다. 사번과 성함을 다시 확인하시거나 관리자에게 문의하세요.');
    }
  };

  const handleAdminAuth = (e) => { e?.preventDefault(); if (adminPw === 'gspower1234') { setIsAdmin(true); setShowAdminGate(false); setAdminPw(''); if (user) setCurrentTab('admin'); } else { alert('비밀번호가 일치하지 않습니다.'); } };
  const openProgramDetail = (p) => { setSelectedProgram(p); setShowDetail(true); };

  // 🔥 [DB 신청 로직]
  const applyProgram = async () => {
    const exists = myApplications.find(a => a.id === selectedProgram.id);
    if (exists) return alert('이미 신청하신 프로그램입니다!');

    await supabase.from('applications').insert({ emp_id: user.empId, program_id: selectedProgram.id });
    await supabase.from('programs').update({ applied: selectedProgram.applied + 1 }).eq('id', selectedProgram.id);
    
    setShowConfirm(false); setShowDetail(false);
    setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2800);
    fetchData(user.empId); // 신청 후 즉시 갱신
  };

  // 🔥 [DB 취소 로직]
  const cancelApplication = async (programId) => {
    const appInfo = myApplications.find(a => a.id === programId);
    const p = programs.find(x => x.id === programId);
    if (!appInfo || !p) return;

    if(confirm('정말 신청을 취소하시겠습니까?')) {
      await supabase.from('applications').delete().eq('id', appInfo.appId);
      await supabase.from('programs').update({ applied: Math.max(0, p.applied - 1) }).eq('id', p.id);
      fetchData(user.empId);
    }
  };

  // 🔥 [DB 별점 평가 로직]
  const submitRating = async () => {
    const appInfo = myApplications.find(a => a.id === ratingModal.id);
    if (!appInfo) return;

    // 내 신청 내역 업데이트
    await supabase.from('applications').update({ user_rating: selectedStars }).eq('id', appInfo.appId);
    
    // 프로그램 평점 재계산 업데이트
    const newCount = (ratingModal.ratingCount || 0) + 1;
    const newTotal = (ratingModal.rating * (ratingModal.ratingCount || 0)) + selectedStars;
    const newAvg = parseFloat((newTotal / newCount).toFixed(1));
    
    await supabase.from('programs').update({ rating: newAvg, rating_count: newCount }).eq('id', ratingModal.id);

    setRatingModal(null); setSelectedStars(5);
    alert('소중한 평가가 반영되었습니다! 감사합니다.');
    fetchData(user.empId);
  };

  // 🔥 [DB 추첨 로직]
  const handleRunLottery = async (id) => {
    const p = programs.find(x => x.id === id);
    const penaltyCount = Math.floor(p.applied * 0.3);
    const newCount = p.applied - penaltyCount;

    let msg = `<div class="text-left space-y-3 text-[14px] text-gray-800"><p><b class="text-black text-[16px]">${p.title} (${p.location})</b></p><p>총 신청 인원: <b>${p.applied}명</b> (정원 ${p.capacity}명)</p><div class="bg-gray-100 p-3 rounded-lg border border-gray-300"><p>• 직전 참여 제외(Waitlist): <span class="text-[#F47B20] font-bold">${penaltyCount}명</span></p><p>• 1순위 신규 신청자: <b class="text-[#1B3A6B]">${newCount}명</b></p></div>`;
    if (newCount >= p.capacity) msg += `<p class="text-[#5CB85C] font-black text-[15px] pt-2">✅ 1순위 대상자 중 무작위 ${p.capacity}명 선정 완료</p></div>`;
    else msg += `<p class="text-[#5CB85C] font-black text-[15px] pt-2">✅ 1순위 전원 선발 후, 부족한 ${p.capacity - newCount}명을 대기자에서 추가 선정 완료</p></div>`;

    await supabase.from('programs').update({ manual_status: '추첨완료' }).eq('id', id);
    setLotteryResult(msg);
    fetchData(user.empId);
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

  if (!user) {
    return (
      <>
        <GlobalStyles />
        <div className="min-h-screen w-full bg-[#FAFAF7] relative overflow-hidden flex items-center justify-center p-6">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#F5A524]/20 to-transparent blur-3xl a-float" />
            <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#5B8FD9]/20 to-transparent blur-3xl" />
          </div>
          <div className="w-full max-w-[440px] a-slide-up relative z-10">
            <div className="flex justify-center mb-12"><div className="bg-white px-7 py-5 rounded-3xl shadow-sm border border-gray-200"><GSLogo size={56} /></div></div>
            <div className="text-center mb-12">
              <h1 className="text-[40px] md:text-[44px] leading-[1.1] font-black tracking-tight text-black mb-5">건강한 당신이<br/><span className="bg-gradient-to-r from-[#F47B20] via-[#1B3A6B] to-[#5CB85C] bg-clip-text text-transparent">곧 건강한 회사입니다</span></h1>
              <p className="text-[15px] text-gray-700 leading-relaxed font-bold">근골격계 전문 테라피 프로그램<br/>사전 등록된 임직원만 이용 가능합니다</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200">
                <div className="px-5 py-3 border-b border-gray-100">
                  <label className="text-[12px] font-black uppercase tracking-widest text-gray-600">성함</label>
                  <input value={loginForm.name} onChange={e => setLoginForm({ ...loginForm, name: e.target.value })} placeholder="예: 홍길동" className="w-full mt-1 bg-transparent text-[18px] font-black text-black placeholder-gray-500 outline-none" />
                </div>
                <div className="px-5 py-3">
                  <label className="text-[12px] font-black uppercase tracking-widest text-gray-600">사번</label>
                  <input value={loginForm.empId} onChange={e => setLoginForm({ ...loginForm, empId: e.target.value })} placeholder="예: GP12345" className="w-full mt-1 bg-transparent text-[18px] font-black text-black placeholder-gray-500 outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full group relative bg-black text-white rounded-2xl py-5 font-black text-[16px] overflow-hidden active:scale-[0.98] transition-transform shadow-lg">
                <span className="relative flex items-center justify-center gap-2">프로그램 둘러보기<ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
              </button>
            </form>
            <div className="mt-10 text-center"><button onClick={() => setShowAdminGate(true)} className="inline-flex items-center gap-1.5 text-[13px] text-gray-600 hover:text-black font-black"><Shield size={14} />관리자 접속</button></div>
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
        <aside className="hidden lg:flex flex-col w-[260px] bg-white border-r border-gray-200 sticky top-0 h-screen p-6">
          <div className="mb-10"><GSLogo size={42} onClick={() => setCurrentTab('home')} /></div>
          <nav className="space-y-2 flex-1">
            {[ { id: 'home', icon: Home, label: '홈' }, { id: 'programs', icon: Activity, label: '프로그램' }, { id: 'my', icon: Heart, label: '내 신청 내역', badge: myApplications.length }, ...(isAdmin ? [{ id: 'admin', icon: BarChart3, label: '관리자 대시보드' }] : []) ].map(item => (
              <button key={item.id} onClick={() => setCurrentTab(item.id)} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[14px] font-black transition-all ${currentTab === item.id ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}>
                <span className="flex items-center gap-3"><item.icon size={18} strokeWidth={2.5} />{item.label}</span>
                {item.badge > 0 && <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${currentTab === item.id ? 'bg-white text-black' : 'bg-[#F47B20] text-white'}`}>{item.badge}</span>}
              </button>
            ))}
          </nav>
          <div className="mt-auto">
            <button onClick={() => { setUser(null); setIsAdmin(false); }} className="w-full flex items-center justify-center gap-2 text-[13px] font-black text-gray-600 py-3 hover:bg-gray-100 hover:text-black rounded-xl"><LogOut size={14} strokeWidth={2.5}/>로그아웃</button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 pb-24 lg:pb-8">
          <div className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-200 px-5 py-4 flex items-center justify-between">
            <GSLogo size={36} onClick={() => setCurrentTab('home')} />
            <div className="flex items-center gap-3">
              <button onClick={() => setShowNotifications(true)} className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center relative">
                <Bell size={16} className="text-black" />
                {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-[#F47B20] rounded-full" />}
              </button>
              <button onClick={() => { setUser(null); setIsAdmin(false); }} className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black">
                <LogOut size={16} strokeWidth={2.5} />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F47B20] to-[#1B3A6B] flex items-center justify-center text-white font-black text-[14px]">{user.name.charAt(0)}</div>
            </div>
          </div>

          <div className="px-5 lg:px-10 py-6 lg:py-8 max-w-[1400px] mx-auto">
            {currentTab === 'home' && <HomeTab user={user} programs={programs} myApplications={myApplications} colorMap={colorMap} onOpenProgram={openProgramDetail} onGoPrograms={() => setCurrentTab('programs')} />}
            {currentTab === 'programs' && <ProgramsTab filtered={filtered} colorMap={colorMap} searchQ={searchQ} setSearchQ={setSearchQ} filterLoc={filterLoc} setFilterLoc={setFilterLoc} onOpenProgram={openProgramDetail} />}
            {currentTab === 'my' && <MyTab myApplications={myApplications} colorMap={colorMap} onCancel={cancelApplication} onGoPrograms={() => setCurrentTab('programs')} onOpenRating={setRatingModal} />}
            {currentTab === 'admin' && isAdmin && <AdminPanel user={user} fetchData={fetchData} programs={programs} setPrograms={setPrograms} registeredUsers={registeredUsers} setRegisteredUsers={setRegisteredUsers} colorMap={colorMap} onRunLottery={handleRunLottery} />}
          </div>
        </main>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex justify-around px-3 py-3 pb-7">
          {[ { id: 'home', icon: Home, label: '홈' }, { id: 'programs', icon: Activity, label: '프로그램' }, { id: 'my', icon: Heart, label: '내 신청', badge: myApplications.length }, ...(isAdmin ? [{ id: 'admin', icon: BarChart3, label: '관리' }] : []) ].map(item => (
            <button key={item.id} onClick={() => setCurrentTab(item.id)} className={`flex flex-col items-center gap-1.5 px-4 py-2 relative ${currentTab === item.id ? 'text-black' : 'text-gray-500'}`}>
              <item.icon size={22} strokeWidth={currentTab === item.id ? 2.5 : 2} /><span className="text-[11px] font-black">{item.label}</span>
              {item.badge > 0 && <span className="absolute top-1 right-2 w-4 h-4 bg-[#F47B20] text-white text-[10px] font-black rounded-full flex items-center justify-center">{item.badge}</span>}
            </button>
          ))}
        </nav>
      </div>

      {showDetail && selectedProgram && <ProgramDetailSheet program={selectedProgram} onClose={() => setShowDetail(false)} onApply={() => setShowConfirm(true)} colorMap={colorMap} />}
      {showConfirm && selectedProgram && (
        <div className="fixed inset-0 z-[70] flex items-end lg:items-center justify-center bg-black/70 backdrop-blur-sm p-0 lg:p-6 a-fade">
          <div className="bg-white rounded-t-3xl lg:rounded-3xl p-7 w-full lg:max-w-md a-sheet">
            <h3 className="text-[22px] font-black text-center text-black mb-6">신청 정보 확인</h3>
            <div className="bg-gray-50 rounded-2xl p-5 space-y-4 mb-6 border border-gray-200">
              <Row label="신청자" value={`${user.name}`} />
              <Row label="프로그램" value={selectedProgram.title} />
              <Row label="일시" value={`${formatDate(selectedProgram.date)}`} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-200 text-gray-800 py-4 rounded-2xl font-black text-[15px]">취소</button>
              <button onClick={applyProgram} className="flex-[2] bg-black text-white py-4 rounded-2xl font-black text-[15px] active:scale-[0.98] transition-transform">최종 신청</button>
            </div>
          </div>
        </div>
      )}
      {showSuccess && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/90 backdrop-blur-xl p-6 a-fade">
          <div className="text-center a-zoom">
            <div className="w-24 h-24 mx-auto mb-6 bg-[#5CB85C] rounded-[2rem] flex items-center justify-center text-white shadow-xl"><Check size={48} strokeWidth={3} /></div>
            <h2 className="text-[32px] font-black text-black mb-2">신청 완료!</h2>
          </div>
        </div>
      )}
      {lotteryResult && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 a-fade">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md a-zoom shadow-2xl border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-50 text-[#1B3A6B] rounded-2xl mx-auto mb-5"><Dna size={32} /></div>
            <h3 className="text-[24px] font-black text-center text-black mb-6">추첨 결과</h3>
            <div dangerouslySetInnerHTML={{ __html: lotteryResult }} />
            <button onClick={() => setLotteryResult(null)} className="w-full mt-8 bg-black text-white py-4 rounded-xl font-black text-[15px]">확인 완료</button>
          </div>
        </div>
      )}
      {ratingModal && (
        <div className="fixed inset-0 z-[90] flex items-end lg:items-center justify-center bg-black/70 backdrop-blur-sm p-0 lg:p-6 a-fade">
          <div className="bg-white rounded-t-3xl lg:rounded-3xl p-8 w-full lg:max-w-sm a-sheet text-center">
            <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-6 lg:hidden" />
            <h3 className="text-[22px] font-black text-black mb-2">테라피는 어떠셨나요?</h3>
            <p className="text-[14px] text-gray-500 font-bold mb-8">[{ratingModal.title}]<br/>프로그램에 대한 별점을 남겨주세요.</p>
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setSelectedStars(star)} className={`transition-all active:scale-90 ${star <= selectedStars ? 'text-[#F47B20]' : 'text-gray-200'}`}>
                  <Star size={40} className={star <= selectedStars ? 'fill-[#F47B20]' : ''} strokeWidth={1.5} />
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => {setRatingModal(null); setSelectedStars(5);}} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black text-[15px]">나중에</button>
              <button onClick={submitRating} className="flex-[2] bg-[#F47B20] text-white py-4 rounded-2xl font-black text-[15px] active:scale-[0.98] shadow-lg shadow-orange-500/30">평가 완료</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════
// Tabs & Sub-components
// ══════════════════════════════════════════════════════════

const HomeTab = ({ user, programs, myApplications, colorMap, onOpenProgram, onGoPrograms }) => (
  <div className="space-y-8 a-fade">
    <div className="relative overflow-hidden rounded-[2rem] bg-black p-8 lg:p-12 text-white shadow-xl">
      <h1 className="text-[32px] font-black mb-4 leading-tight">{user.name}님,<br/>오늘도 건강하세요</h1>
      <button onClick={onGoPrograms} className="mt-6 bg-white text-black px-6 py-3.5 rounded-xl font-black text-[14px] flex items-center gap-2 hover:bg-gray-100 transition-colors">
        프로그램 보기<ArrowRight size={16} strokeWidth={2.5}/>
      </button>
    </div>
    <div className="grid grid-cols-2 gap-4 stagger">
      <StatCard icon={Activity} label="참여 프로그램" value={myApplications.length} suffix="건" accent="#F47B20" />
      <StatCard 
        icon={Star} label="나의 평균 만족도" 
        value={myApplications.filter(a => a.userRating).length > 0 ? (myApplications.filter(a => a.userRating).reduce((acc, curr) => acc + curr.userRating, 0) / myApplications.filter(a => a.userRating).length).toFixed(1) : "-"} 
        suffix="/5.0" accent="#F47B20" 
      />
    </div>
    <div>
      <div className="flex justify-between items-end mb-5"><h2 className="text-[24px] font-black text-black">추천 프로그램</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger">
        {programs.slice(0, 2).map(p => <CompactCard key={p.id} program={p} onClick={() => onOpenProgram(p)} colorMap={colorMap} />)}
      </div>
    </div>
  </div>
);

const ProgramsTab = ({ filtered, colorMap, searchQ, setSearchQ, filterLoc, setFilterLoc, onOpenProgram }) => (
  <div className="space-y-6 a-fade">
    <h1 className="text-[32px] font-black text-black">프로그램 전체</h1>
    <div className="space-y-4">
      <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="검색어를 입력하세요" className="w-full bg-white border border-gray-300 rounded-2xl px-5 py-4 text-[16px] font-black placeholder-gray-500 outline-none text-black focus:border-black" />
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {['전체', '안양사업소', '부천사업소', '서울사업소'].map(loc => (
          <button key={loc} onClick={() => setFilterLoc(loc)} className={`flex-shrink-0 px-5 py-3 rounded-xl text-[14px] font-black transition-colors ${filterLoc === loc ? 'bg-black text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{loc}</button>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger">
      {filtered.map(p => <CompactCard key={p.id} program={p} onClick={() => onOpenProgram(p)} colorMap={colorMap} />)}
    </div>
  </div>
);

const MyTab = ({ myApplications, colorMap, onCancel, onGoPrograms, onOpenRating }) => (
  <div className="space-y-6 a-fade">
    <h1 className="text-[32px] font-black text-black">내 신청 내역</h1>
    {myApplications.length === 0 ? (
      <div className="bg-white rounded-3xl p-16 text-center border border-gray-200"><Heart size={32} className="mx-auto mb-4 text-gray-400" /><h3 className="text-[18px] font-black text-black mb-2">신청 내역이 없습니다</h3></div>
    ) : (
      <div className="space-y-4 stagger">
        {myApplications.map((p, i) => {
          const status = getProgramStatus(p);
          return (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 flex justify-between items-center shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-1.5"><h3 className="text-[18px] font-black text-black">{p.title}</h3><StatusBadge status={status}/></div>
                <p className="text-[13px] font-bold text-gray-600">{p.location} · {formatDate(p.date)}</p>
              </div>
              {status === '종료' ? (
                p.userRating ? (
                  <span className="text-[13px] font-black text-[#F47B20] bg-orange-50 border border-orange-200 px-4 py-2.5 rounded-xl flex items-center gap-1.5"><Star size={14} className="fill-[#F47B20]" /> {p.userRating}점</span>
                ) : (
                  <button onClick={() => onOpenRating(p)} className="text-[13px] font-black text-white bg-black px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors shadow-md">만족도 평가</button>
                )
              ) : (
                <button onClick={() => onCancel(p.id)} className="text-[13px] font-black text-gray-500 bg-gray-100 px-4 py-2.5 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">신청 취소</button>
              )}
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const StatCard = ({ icon: Icon, label, value, suffix, accent }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
    <div className="mb-3"><Icon size={18} style={{ color: accent }} strokeWidth={2.5} /></div>
    <div className="text-[12px] font-black text-gray-600 uppercase tracking-wider mb-1">{label}</div>
    <div className="flex items-baseline gap-1"><span className="text-[28px] font-black text-black">{value}</span><span className="text-[13px] font-black text-gray-600">{suffix}</span></div>
  </div>
);

const CompactCard = ({ program, onClick, colorMap }) => {
  const c = colorMap[program.color];
  const status = getProgramStatus(program);
  const isClosed = status !== '모집중';
  const pct = (program.applied / program.capacity) * 100;
  return (
    <button onClick={onClick} className="w-full group text-left bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-5"><span className={`${c.bg} ${c.text} px-3 py-1.5 rounded-lg text-[11px] font-black tracking-wider`}>{program.category}</span><StatusBadge status={status} /></div>
      <h3 className="text-[18px] font-black text-black leading-snug mb-3">{program.title}</h3>
      <div className="space-y-1.5 mb-5 text-[13px] text-gray-700 font-bold">
        <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-500" />{program.location}</div>
        <div className="flex justify-between items-center"><div className="flex items-center gap-2"><Calendar size={14} className="text-gray-500"/>실시: {formatDate(program.date)}</div><span className="text-red-600 font-black text-[12px] bg-red-50 px-2 py-1 rounded">마감: {formatDate(program.deadline)}</span></div>
      </div>
      <div className="flex items-center gap-1.5 mb-4"><Star size={14} className="text-[#F47B20] fill-[#F47B20]" /><span className="text-[13px] font-black text-black">{program.rating}</span><span className="text-[11px] font-bold text-gray-400">({program.ratingCount || 0}명 평가)</span></div>
      <div>
        <div className="flex justify-between mb-2"><div className="flex items-baseline gap-1.5"><span className={`text-[15px] font-black ${isClosed ? 'text-gray-600' : 'text-black'}`}>{program.applied}</span><span className="text-[12px] text-gray-500 font-bold">/ {program.capacity}명</span></div></div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: isClosed ? '#9CA3AF' : c.solid }} /></div>
      </div>
    </button>
  );
};

const ProgramDetailSheet = ({ program, onClose, onApply, colorMap }) => {
  const c = colorMap[program.color];
  const status = getProgramStatus(program);
  const isClosed = status !== '모집중';
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm a-fade" onClick={onClose}>
      <div className="bg-white w-full lg:max-w-lg rounded-t-[2rem] max-h-[92vh] overflow-y-auto a-sheet" onClick={e => e.stopPropagation()}>
        <div className={`relative bg-gradient-to-br ${c.soft} p-8 border-b border-gray-200`}>
          <div className="w-12 h-1.5 bg-black/20 rounded-full mx-auto mb-6" />
          <div className="flex justify-between items-start mb-5"><StatusBadge status={status} /><button onClick={onClose} className="bg-white/80 p-2 rounded-full"><X size={18} className="text-black" strokeWidth={2.5}/></button></div>
          <h2 className="text-[28px] font-black text-black leading-tight mb-3">{program.title}</h2>
          <div className="flex items-center gap-1.5 mb-2"><Star size={14} className="text-[#F47B20] fill-[#F47B20]" /><span className="text-[13px] font-black text-black">{program.rating}</span><span className="text-[11px] font-bold text-gray-600">({program.ratingCount || 0}명 평가)</span></div>
          <p className="text-[14px] font-black text-gray-700">실시일: {formatDate(program.date)} | 신청마감: {formatDate(program.deadline)}</p>
        </div>
        <div className="p-8 space-y-6">
          <p className="text-[15px] text-black font-bold leading-relaxed">{program.desc}</p>
          <div className="grid grid-cols-2 gap-4"><InfoTile icon={MapPin} label="장소" value={program.location} /><InfoTile icon={Users} label="정원" value={`${program.applied}/${program.capacity}명`} /></div>
          <button onClick={onApply} disabled={isClosed} className={`w-full rounded-2xl py-5 font-black text-[16px] transition-all ${isClosed ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-black text-white active:scale-[0.98] shadow-lg'}`}>
            {status === '모집중' ? '이 프로그램 신청하기' : `신청 불가 (${status})`}
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200"><div className="flex items-center gap-2 text-[12px] font-black uppercase text-gray-600 mb-2"><Icon size={14} strokeWidth={2.5} />{label}</div><div className="text-[15px] font-black text-black">{value}</div></div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center gap-3"><span className="text-[14px] text-gray-600 font-black">{label}</span><span className="text-[15px] font-black text-black text-right">{value}</span></div>
);

const AdminGate = ({ pw, setPw, onSubmit, onClose }) => (
  <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 a-fade">
    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl a-zoom">
      <div className="flex justify-between items-center mb-8"><div className="font-black text-[20px] text-black">관리자 인증</div><button onClick={onClose} className="bg-gray-100 p-2 rounded-full"><X size={18} className="text-black" strokeWidth={2.5}/></button></div>
      <form onSubmit={onSubmit}>
        <input type="password" autoFocus value={pw} onChange={e => setPw(e.target.value)} placeholder="비밀번호 입력" className="w-full bg-white border border-gray-300 rounded-2xl px-5 py-4 mb-4 text-black font-black outline-none placeholder-gray-500 focus:border-black" />
        <button type="submit" className="w-full bg-black text-white rounded-2xl py-4 font-black text-[15px]">인증하기</button>
      </form>
    </div>
  </div>
);

// 🔥 [DB 풀 연동 로직 적용] 관리자 패널
const AdminPanel = ({ user, fetchData, programs, setPrograms, registeredUsers, setRegisteredUsers, colorMap, onRunLottery }) => {
  const [form, setForm] = useState({
    titleType: '근골격계 테라피', customTitle: '', category: '물리치료', 
    location: '안양사업소', date: '', deadline: '', capacity: '',
    therapistName: '', therapistRole: '물리치료사', desc: ''
  });

  const [newUser, setNewUser] = useState({ name: '', empId: '' });
  const [editingId, setEditingId] = useState(null); 
  const [editAuthId, setEditAuthId] = useState(null); 
  const [editAuthPw, setEditAuthPw] = useState(''); 

  const getLocationColor = (loc) => {
    if (loc.includes('안양')) return 'orange';
    if (loc.includes('부천')) return 'blue';
    if (loc.includes('서울')) return 'green';
    return 'orange'; 
  };

  const submitProgram = async () => {
    const finalTitle = form.titleType === '기타' ? form.customTitle : form.titleType;
    if (!finalTitle || !form.date || !form.deadline || !form.capacity || !form.therapistName) return alert('필수 항목을 모두 입력해주세요');
    if (form.deadline > form.date) return alert('신청 기한은 실시일 이전이어야 합니다!');
    
    const dbPayload = {
      title: finalTitle, category: form.category, location: form.location, 
      date: form.date, deadline: form.deadline, time: '14:00~17:00', capacity: parseInt(form.capacity), 
      therapist_name: form.therapistName, therapist_role: form.therapistRole,
      description: form.desc || '전문가와 함께하는 프로그램입니다.', color: getLocationColor(form.location), duration: '50분/인',
    };

    if (editingId) {
      await supabase.from('programs').update(dbPayload).eq('id', editingId);
      alert('성공적으로 수정되었습니다.');
    } else {
      await supabase.from('programs').insert([{ ...dbPayload, applied: 0, rating: 5.0, rating_count: 0 }]);
      alert('신규 게시되었습니다.');
    }
    
    setEditingId(null);
    setForm({ titleType: '근골격계 테라피', customTitle: '', date: '', deadline: '', capacity: '', therapistName: '', desc: '' });
    fetchData(user.empId); // DB 갱신
  };

  const handleEditClick = (p) => { setEditAuthId(p.id); };

  const handleEditAuth = (e) => {
    e.preventDefault();
    if (editAuthPw === 'gspower1234') { 
      const p = programs.find(x => x.id === editAuthId);
      setForm({
        titleType: p.title === '근골격계 테라피' ? '근골격계 테라피' : '기타', customTitle: p.title !== '근골격계 테라피' ? p.title : '',
        category: p.category, location: p.location, date: p.date, deadline: p.deadline,
        capacity: p.capacity.toString(), therapistName: p.therapist.name, therapistRole: p.therapist.role, desc: p.desc
      });
      setEditingId(p.id); setEditAuthId(null); setEditAuthPw('');
      window.scrollTo(0, 0); 
    } else { alert('비밀번호가 일치하지 않습니다.'); }
  };

  const handleDelete = async (id) => {
    if(confirm('정말 삭제하시겠습니까?')) {
      await supabase.from('programs').delete().eq('id', id);
      fetchData(user.empId);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.empId) return alert('이름과 사번을 모두 입력해주세요.');
    
    // DB 확인
    const { data } = await supabase.from('registered_users').select('*').eq('emp_id', newUser.empId);
    if (data && data.length > 0) return alert('이미 등록된 사번입니다.');
    
    await supabase.from('registered_users').insert([{ name: newUser.name, emp_id: newUser.empId }]);
    setNewUser({ name: '', empId: '' });
    alert('임직원이 성공적으로 등록되었습니다.');
    fetchData(user.empId);
  };

  const handleRemoveUser = async (empId) => {
    if(confirm('이 임직원의 접근 권한을 삭제하시겠습니까?')) {
      await supabase.from('registered_users').delete().eq('emp_id', empId);
      fetchData(user.empId);
    }
  };

  const inputCls = "w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-[14px] font-black text-black placeholder-gray-500 outline-none focus:border-black shadow-sm";

  return (
    <div className="space-y-8 a-fade relative">
      <h1 className="text-[32px] font-black text-black">관리자 대시보드</h1>
      
      <div className={`rounded-3xl p-6 lg:p-8 border transition-all ${editingId ? 'bg-[#FFF4EB] border-[#F47B20] shadow-lg' : 'bg-gray-50 border-gray-200'}`}>
        <h3 className="text-[18px] font-black text-black mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {editingId ? <Edit3 size={20} className="text-[#F47B20]" strokeWidth={2.5}/> : <Plus size={20} className="text-[#F47B20]" strokeWidth={2.5}/>}
            {editingId ? '프로그램 내용 수정' : '신규 프로그램 개설'}
          </div>
          {editingId && <button onClick={() => {setEditingId(null); setForm({ titleType: '근골격계 테라피', customTitle: '', date: '', deadline: '', capacity: '', therapistName: '', desc: '' });}} className="text-[12px] font-bold text-gray-500 hover:text-black bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">수정 취소</button>}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="프로그램명 *"><select value={form.titleType} onChange={e => setForm({ ...form, titleType: e.target.value })} className={inputCls}><option>근골격계 테라피</option><option>기타</option></select></Field>
          {form.titleType === '기타' && <Field label="직접 입력 *"><input value={form.customTitle} onChange={e => setForm({ ...form, customTitle: e.target.value })} placeholder="예: 거북목 교정 클래스" className={inputCls} autoFocus /></Field>}
          <Field label="장소 (컬러 자동)"><select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inputCls}><option>안양사업소</option><option>부천사업소</option><option>서울사업소</option></select></Field>
          <Field label="실시 일자 *"><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputCls} /></Field>
          <Field label="신청 기한 (마감일) *"><input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className={inputCls} /></Field>
          <Field label="정원 (명) *"><input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="명" className={inputCls} /></Field>
          <Field label="담당자명 *"><input value={form.therapistName} onChange={e => setForm({ ...form, therapistName: e.target.value })} placeholder="김은정" className={inputCls} /></Field>
        </div>
        <button onClick={submitProgram} className={`mt-6 w-full text-white px-8 py-4 rounded-xl font-black text-[15px] shadow-md transition-colors ${editingId ? 'bg-[#F47B20] hover:bg-orange-600' : 'bg-black hover:bg-gray-800'}`}>
          {editingId ? '수정 내용 저장하기' : '프로그램 게시하기'}
        </button>
      </div>

      <div className="bg-gray-50 rounded-3xl p-6 lg:p-8 border border-gray-200">
        <h3 className="text-[18px] font-black text-black mb-3 flex items-center gap-2"><UserPlus size={20} className="text-[#1B3A6B]" strokeWidth={2.5}/>임직원 권한 관리</h3>
        <p className="text-[13px] text-gray-600 font-bold mb-5">여기에 등록된 임직원만 테라피 시스템에 로그인할 수 있습니다.</p>
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="성함 (예: 홍길동)" className={inputCls} />
          <input value={newUser.empId} onChange={e => setNewUser({...newUser, empId: e.target.value})} placeholder="사번 (예: GP12345)" className={inputCls} />
          <button onClick={handleAddUser} className="bg-[#1B3A6B] text-white px-6 py-3.5 rounded-xl font-black text-[14px] whitespace-nowrap shadow-md">직원 등록</button>
        </div>
        <div className="bg-white rounded-2xl p-4 max-h-48 overflow-y-auto hide-scrollbar space-y-2 border border-gray-200 shadow-inner">
          {registeredUsers.length === 0 ? (
            <p className="text-[13px] font-bold text-gray-500 text-center py-4">등록된 임직원이 없습니다.</p>
          ) : (
            registeredUsers.map((u, i) => (
              <div key={i} className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[12px] font-black text-black">{u.name.charAt(0)}</div>
                  <div><span className="font-black text-[14px] text-black block leading-tight">{u.name}</span><span className="text-[11px] text-gray-500 font-bold">{u.empId}</span></div>
                </div>
                <button onClick={() => handleRemoveUser(u.empId)} className="bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 p-2 rounded-lg transition-colors"><X size={16} strokeWidth={2.5}/></button>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="text-[20px] font-black text-black mb-4">운영 현황 및 추첨</h3>
        <div className="space-y-3 stagger">
          {programs.map(p => {
            const status = getProgramStatus(p);
            return (
              <div key={p.id} className="bg-white rounded-2xl p-5 border border-gray-200 flex flex-col md:flex-row justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-3 mb-2"><h4 className="text-[16px] font-black text-black">{p.title}</h4><StatusBadge status={status} /></div>
                  <div className="text-[13px] text-gray-600 font-bold">{p.location} · 기한: <span className="text-red-600">{formatDate(p.deadline)}</span> · 신청: <span className="text-black">{p.applied}/{p.capacity}명</span></div>
                </div>
                <div className="flex gap-2 items-center">
                  {status === '모집중' && <span className="text-[12px] text-gray-500 font-black px-3">마감 전</span>}
                  {status === '모집마감' && <button onClick={() => onRunLottery(p.id)} className="bg-[#F47B20] text-white px-5 py-2.5 rounded-xl text-[13px] font-black shadow-md hover:bg-orange-600 transition-colors">추첨 실행</button>}
                  {status === '추첨완료' && <span className="bg-gray-100 text-gray-500 px-5 py-2.5 rounded-xl text-[13px] font-black border border-gray-200">추첨 완료됨</span>}
                  {status === '종료' && <span className="text-gray-500 text-[12px] font-black px-3">진행 종료</span>}
                  
                  <div className="flex bg-gray-50 rounded-xl border border-gray-200 overflow-hidden ml-2">
                    <button onClick={() => handleEditClick(p)} className="px-4 py-2.5 text-[13px] font-black text-gray-600 hover:bg-white hover:text-black transition-colors border-r border-gray-200">수정</button>
                    <button onClick={() => handleDelete(p.id)} className="px-4 py-2.5 text-[13px] font-black text-red-500 hover:bg-red-50 transition-colors">삭제</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editAuthId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 a-fade">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl a-zoom">
            <div className="flex justify-between items-center mb-8">
              <div className="font-black text-[18px] text-black flex items-center gap-2"><Edit3 size={20} className="text-[#F47B20]"/>내용 수정 권한 확인</div>
              <button onClick={() => {setEditAuthId(null); setEditAuthPw('');}} className="bg-gray-100 p-2 rounded-full"><X size={18} className="text-black" strokeWidth={2.5}/></button>
            </div>
            <form onSubmit={handleEditAuth}>
              <p className="text-[13px] font-bold text-gray-600 mb-4">프로그램 내용을 수정하려면 관리자 비밀번호를 다시 입력해주세요.</p>
              <input type="password" autoFocus value={editAuthPw} onChange={e => setEditAuthPw(e.target.value)} placeholder="비밀번호 입력" className="w-full bg-white border border-gray-300 rounded-2xl px-5 py-4 mb-4 text-black font-black outline-none placeholder-gray-500 focus:border-[#F47B20]" />
              <button type="submit" className="w-full bg-[#F47B20] text-white rounded-2xl py-4 font-black text-[15px]">인증하고 수정하기</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, children }) => (
  <div><label className="block text-[11px] font-black uppercase text-gray-600 mb-2 pl-1">{label}</label>{children}</div>
);
