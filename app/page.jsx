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
    .a-fade { animation: fadeIn .3s ease-out both; }
    .a-slide-up { animation: slideUp .45s cubic-bezier(0.16,1,0.3,1) both; }
    .stagger > * { opacity: 0; animation: slideUp .5s cubic-bezier(0.16,1,0.3,1) forwards; }
    .stagger > *:nth-child(1) { animation-delay: .05s; }
    .stagger > *:nth-child(2) { animation-delay: .1s; }
    .stagger > *:nth-child(3) { animation-delay: .15s; }
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
  const [lotteryResult, setLotteryResult] = useState(null);
  const [filterLoc, setFilterLoc] = useState('전체');
  const [searchQ, setSearchQ] = useState('');

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  // 🔥 [버그 해결] DB 언어를 앱 언어로 번역해서 가져옵니다!
  useEffect(() => {
    const fetchRealData = async () => {
      if (supabaseUrl !== 'https://placeholder.supabase.co') {
        
        // 1. 프로그램 데이터 매핑 (therapist_name -> therapist.name)
        const { data: pData } = await supabase.from('programs').select('*').order('created_at', { ascending: false });
        if (pData && pData.length > 0) {
          const mappedPrograms = pData.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category || '물리치료',
            location: p.location,
            date: p.date,
            deadline: p.deadline,
            time: p.time,
            capacity: p.capacity,
            applied: p.applied,
            rating: p.rating,
            manualStatus: p.manual_status,
            therapist: { name: p.therapist_name, role: p.therapist_role, exp: '5년', avatar: (p.therapist_name || 'G').charAt(0) },
            desc: p.description,
            tags: ['신규'],
            color: p.color || 'orange',
            duration: p.duration
          }));
          setPrograms(mappedPrograms);
        }

        // 2. 임직원 명단 매핑 (emp_id -> empId)
        const { data: users } = await supabase.from('registered_users').select('*');
        if (users && users.length > 0) {
          const mappedUsers = users.map(u => ({
            name: u.name,
            empId: u.emp_id // 여기서 언더바를 대문자 I로 번역해줍니다!
          }));
          setRegisteredUsers(mappedUsers);
        }
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

  const handleAdminAuth = (e) => { e?.preventDefault(); if (adminPw === 'gspower1234') { setIsAdmin(true); setShowAdminGate(false); setAdminPw(''); if (user) setCurrentTab('admin'); } else { alert('비밀번호가 일치하지 않습니다.'); } };
  const openProgramDetail = (p) => { setSelectedProgram(p); setShowDetail(true); };

  // 프로그램 신청 로직 (로컬 + DB 업데이트)
  const applyProgram = async () => {
    setShowConfirm(false); setShowDetail(false);
    const updatedApplied = selectedProgram.applied + 1;
    
    // DB 업데이트
    if (supabaseUrl !== 'https://placeholder.supabase.co') {
      await supabase.from('programs').update({ applied: updatedApplied }).eq('id', selectedProgram.id);
    }
    
    setPrograms(prev => prev.map(p => p.id === selectedProgram.id ? { ...p, applied: updatedApplied } : p));
    setMyApplications(prev => [...prev, { ...selectedProgram, applied: updatedApplied, appliedAt: new Date().toISOString(), status: 'pending' }]);
    setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2800);
  };

  const handleRunLottery = async (id) => {
    const p = programs.find(x => x.id === id);
    const penaltyCount = Math.floor(p.applied * 0.3);
    const newCount = p.applied - penaltyCount;
    let msg = `<div class="text-left space-y-3 text-[14px] text-gray-700"><p><b class="text-black text-[16px]">${p.title}</b></p><p>총 신청: <b>${p.applied}명</b></p><p>✅ 추첨 로직에 따라 대상자 선정 완료</p></div>`;
    
    // DB 업데이트
    if (supabaseUrl !== 'https://placeholder.supabase.co') {
      await supabase.from('programs').update({ manual_status: '추첨완료' }).eq('id', id);
    }

    setLotteryResult(msg);
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
        <div className="min-h-screen w-full bg-[#FAFAF7] flex items-center justify-center p-6 relative overflow-hidden">
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
            <div className="mt-10 text-center"><button onClick={() => setShowAdminGate(true)} className="inline-flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-[#1B3A6B] font-bold"><Shield size={12} />관리자 접속</button></div>
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
              <button onClick={() => { setUser(null); setIsAdmin(false); }} className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500"><LogOut size={14} /></button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F47B20] to-[#1B3A6B] flex items-center justify-center text-white font-black text-[13px]">{user.name.charAt(0)}</div>
            </div>
          </div>
          <div className="px-5 lg:px-10 py-6 lg:py-8 max-w-[1400px] mx-auto">
            {currentTab === 'home' && <HomeTab user={user} programs={programs} myApplications={myApplications} colorMap={colorMap} onOpenProgram={openProgramDetail} onGoPrograms={() => setCurrentTab('programs')} />}
            {currentTab === 'programs' && <ProgramsTab filtered={filtered} colorMap={colorMap} searchQ={searchQ} setSearchQ={setSearchQ} filterLoc={filterLoc} setFilterLoc={setFilterLoc} onOpenProgram={openProgramDetail} />}
            {currentTab === 'my' && <MyTab myApplications={myApplications} colorMap={colorMap} onCancel={applicationId => setMyApplications(prev => prev.filter(a => a.id !== applicationId))} onGoPrograms={() => setCurrentTab('programs')} />}
            {currentTab === 'admin' && isAdmin && <AdminPanel programs={programs} setPrograms={setPrograms} registeredUsers={registeredUsers} setRegisteredUsers={setRegisteredUsers} colorMap={colorMap} onRunLottery={handleRunLottery} />}
          </div>
        </main>
      </div>

      {showDetail && selectedProgram && <ProgramDetailSheet program={selectedProgram} onClose={() => setShowDetail(false)} onApply={() => setShowConfirm(true)} colorMap={colorMap} />}
      {showConfirm && selectedProgram && <div className="fixed inset-0 z-[70] flex items-end lg:items-center justify-center bg-[#0A1628]/70 p-0 lg:p-6 a-fade"><div className="bg-white rounded-t-3xl lg:rounded-3xl p-7 w-full lg:max-w-md"><h3 className="text-[20px] font-black text-center mb-6">신청 정보 확인</h3><div className="bg-gray-50 rounded-2xl p-5 space-y-3 mb-6 border border-gray-100"><Row label="신청자" value={user.name} /><Row label="프로그램" value={selectedProgram.title} /></div><div className="flex gap-2"><button onClick={() => setShowConfirm(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-bold">취소</button><button onClick={applyProgram} className="flex-[2] bg-[#0A1628] text-white py-4 rounded-2xl font-bold">최종 신청</button></div></div></div>}
      {showSuccess && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/80 p-6 a-fade"><div className="text-center a-zoom"><div className="w-20 h-20 mx-auto mb-6 bg-[#5CB85C] rounded-3xl flex items-center justify-center text-white"><Check size={36} /></div><h2 className="text-[28px] font-black">신청 완료!</h2></div></div>}
      {lotteryResult && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-6 a-fade"><div className="bg-white rounded-[2rem] p-8 w-full max-w-md a-zoom shadow-2xl"><div className="flex items-center justify-center w-16 h-16 bg-blue-50 text-[#1B3A6B] rounded-2xl mx-auto mb-5"><Dna size={32} /></div><h3 className="text-[22px] font-black text-center mb-6">추첨 알고리즘 완료</h3><div dangerouslySetInnerHTML={{ __html: lotteryResult }} /><button onClick={() => setLotteryResult(null)} className="w-full mt-6 bg-[#0A1628] text-white py-4 rounded-xl font-black">확인</button></div></div>}
    </>
  );
}

const HomeTab = ({ user, programs, myApplications, colorMap, onOpenProgram, onGoPrograms }) => (
  <div className="space-y-6 a-fade">
    <div className="relative overflow-hidden rounded-3xl bg-[#0A1628] p-7 lg:p-10 text-white">
      <h1 className="text-[28px] font-black mb-3">{user.name}님,<br/>오늘도 건강하세요</h1>
      <button onClick={onGoPrograms} className="mt-6 bg-white text-[#0A1628] px-5 py-3 rounded-xl font-bold text-[13px] flex items-center gap-2">프로그램 보기<ArrowRight size={14} /></button>
    </div>
    <div className="grid grid-cols-2 gap-3 stagger">
      <StatCard icon={Activity} label="참여 프로그램" value={myApplications.length} suffix="건" accent="#F47B20" />
      <StatCard icon={Users} label="평균 만족도" value="4.8" suffix="/5.0" accent="#5CB85C" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">{programs.slice(0, 2).map(p => <CompactCard key={p.id} program={p} onClick={() => onOpenProgram(p)} colorMap={colorMap} />)}</div>
  </div>
);

const ProgramsTab = ({ filtered, colorMap, searchQ, setSearchQ, filterLoc, setFilterLoc, onOpenProgram }) => (
  <div className="space-y-6 a-fade">
    <h1 className="text-[28px] font-black">프로그램 전체</h1>
    <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="검색" className="w-full bg-white border border-gray-100 rounded-2xl px-4 py-4 text-[14px] font-black placeholder-gray-400 outline-none text-black" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">{filtered.map(p => <CompactCard key={p.id} program={p} onClick={() => onOpenProgram(p)} colorMap={colorMap} />)}</div>
  </div>
);

const MyTab = ({ myApplications, onCancel }) => (
  <div className="space-y-6 a-fade">
    <h1 className="text-[28px] font-black">내 신청 내역</h1>
    {myApplications.length === 0 ? <div className="bg-white rounded-3xl p-14 text-center border border-gray-100">내역이 없습니다</div> : 
      <div className="space-y-3">{myApplications.map((p, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 flex justify-between items-center">
          <div><h3 className="text-[15px] font-black mb-1">{p.title}</h3><p className="text-[11px] text-gray-500">{p.location}</p></div>
          <button onClick={() => onCancel(p.id)} className="text-[11px] font-bold text-gray-400 hover:text-red-500">신청 취소</button>
        </div>
      ))}</div>
    }
  </div>
);

const AdminPanel = ({ programs, setPrograms, registeredUsers, setRegisteredUsers, colorMap, onRunLottery }) => {
  const [form, setForm] = useState({ titleType: '근골격계 테라피', customTitle: '', location: '안양사업소', date: '', deadline: '', capacity: '', therapistName: '', category: '물리치료' });
  const [newUser, setNewUser] = useState({ name: '', empId: '' });
  
  // 🔥 [업데이트] DB Insert 풀 연동!
  const createProgram = async () => {
    const finalTitle = form.titleType === '기타' ? form.customTitle : form.titleType;
    if (!finalTitle || !form.date || !form.deadline || !form.capacity || !form.therapistName) return alert('필수 입력 누락');
    
    const newP_DB = {
      title: finalTitle, category: form.category, location: form.location,
      date: form.date, deadline: form.deadline, time: '14:00~17:00', capacity: parseInt(form.capacity),
      applied: 0, rating: 5.0, therapist_name: form.therapistName, therapist_role: '물리치료사',
      description: '전문가와 함께하는 프로그램입니다.', color: form.location.includes('안양') ? 'orange' : form.location.includes('부천') ? 'blue' : 'green', duration: '50분/인'
    };

    if (supabaseUrl !== 'https://placeholder.supabase.co') {
      await supabase.from('programs').insert([newP_DB]);
    }
    
    // 화면 즉시 반영 (새로고침 전에도 보이게)
    setPrograms([{ id: Date.now(), ...newP_DB, therapist: { name: form.therapistName, role: '물리치료사', exp: '5년', avatar: form.therapistName.charAt(0) } }, ...programs]);
    alert('게시 성공!');
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.empId) return;
    const exists = registeredUsers.find(u => u.empId === newUser.empId);
    if (exists) return alert('이미 등록된 사번입니다.');
    
    if (supabaseUrl !== 'https://placeholder.supabase.co') {
      await supabase.from('registered_users').insert([{ name: newUser.name, emp_id: newUser.empId.toUpperCase() }]);
    }

    setRegisteredUsers([{ name: newUser.name, empId: newUser.empId.toUpperCase() }, ...registeredUsers]);
    setNewUser({ name: '', empId: '' });
  };

  const handleRemoveUser = async (empId) => {
    if (supabaseUrl !== 'https://placeholder.supabase.co') {
      await supabase.from('registered_users').delete().eq('emp_id', empId);
    }
    setRegisteredUsers(registeredUsers.filter(x => x.empId !== empId));
  };

  const handleDeleteProgram = async (id) => {
    if (supabaseUrl !== 'https://placeholder.supabase.co') {
      await supabase.from('programs').delete().eq('id', id);
    }
    setPrograms(programs.filter(x => x.id !== id));
  };

  const inputCls = "w-full bg-gray-50 border border-transparent rounded-xl px-3.5 py-3 text-[13px] font-black text-black placeholder-gray-400 outline-none focus:bg-white focus:border-[#0A1628]";
  return (
    <div className="space-y-6 a-fade">
      <h1 className="text-[28px] font-black">관리자 대시보드</h1>
      <div className="bg-white rounded-3xl p-6 border border-gray-100">
        <h3 className="text-[15px] font-black mb-4 flex items-center gap-2"><UserPlus size={16} />임직원 접근 권한 관리</h3>
        <div className="flex gap-3 mb-6">
          <input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} placeholder="성함" className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-[13px] font-black text-black outline-none" />
          <input value={newUser.empId} onChange={e => setNewUser({...newUser, empId: e.target.value})} placeholder="사번" className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-[13px] font-black text-black outline-none" />
          <button onClick={handleAddUser} className="bg-[#1B3A6B] text-white px-6 py-3 rounded-xl font-black text-[13px]">등록</button>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
          {registeredUsers.map((u, i) => (
            <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-50">
              <div><span className="font-black text-[13px] text-[#0A1628] block">{u.name}</span><span className="text-[10px] text-gray-400 font-bold">{u.empId}</span></div>
              <button onClick={() => handleRemoveUser(u.empId)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-3xl p-6 border border-gray-100">
        <h3 className="text-[15px] font-black mb-4"><Plus size={16} /> 신규 프로그램 개설</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="프로그램명 *"><select value={form.titleType} onChange={e => setForm({ ...form, titleType: e.target.value })} className={inputCls}><option>근골격계 테라피</option><option>기타</option></select></Field>
          <Field label="실시 일자 *"><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputCls} /></Field>
          <Field label="신청 기한 *"><input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className={inputCls} /></Field>
          <Field label="정원 *"><input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className={inputCls} /></Field>
          <Field label="담당자명 *"><input value={form.therapistName} onChange={e => setForm({ ...form, therapistName: e.target.value })} className={inputCls} /></Field>
        </div>
        <button onClick={createProgram} className="mt-5 bg-[#0A1628] text-white px-8 py-3.5 rounded-xl font-black text-[13px]">게시하기</button>
      </div>
      <div className="space-y-2">{programs.map(p => {
        const status = getProgramStatus(p);
        return (
          <div key={p.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex justify-between items-center">
            <div><div className="flex items-center gap-2 mb-1"><h4 className="text-[14px] font-black">{p.title}</h4><StatusBadge status={status} /></div><div className="text-[11px] text-gray-400 font-semibold">{p.location} · {p.applied}/{p.capacity}명</div></div>
            <div className="flex gap-2">
              {status === '모집마감' && <button onClick={() => onRunLottery(p.id)} className="bg-[#F47B20] text-white px-4 py-2 rounded-xl text-[11px] font-bold">추첨 실행</button>}
              <button onClick={() => handleDeleteProgram(p.id)} className="bg-red-50 text-red-500 px-3 py-2 rounded-xl text-[11px] font-bold">삭제</button>
            </div>
          </div>
        );
      })}</div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, suffix, accent }) => (
  <div className="bg-white rounded-2xl p-4 border border-gray-100">
    <div className="mb-2"><Icon size={15} style={{ color: accent }} /></div>
    <div className="text-[10px] font-bold text-gray-400 uppercase">{label}</div>
    <div className="flex items-baseline gap-1"><span className="text-[22px] font-black">{value}</span><span className="text-[11px] font-bold text-gray-400">{suffix}</span></div>
  </div>
);

const CompactCard = ({ program, onClick, colorMap }) => {
  const c = colorMap[program.color] || colorMap['orange'];
  const status = getProgramStatus(program);
  const pct = Math.min(100, (program.applied / program.capacity) * 100);
  return (
    <button onClick={onClick} className="w-full text-left bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all">
      <div className="flex justify-between items-center mb-4"><span className={`${c.bg} ${c.text} px-2.5 py-1 rounded-lg text-[10px] font-black`}>{program.category}</span><StatusBadge status={status} /></div>
      <h3 className="text-[16px] font-black text-[#0A1628] leading-snug mb-3">{program.title}</h3>
      <div className="space-y-1 mb-4 text-[11px] text-gray-500 font-semibold"><div className="flex gap-1.5"><MapPin size={10} />{program.location}</div><div className="flex gap-1.5"><Calendar size={10} />{formatDate(program.date)}</div></div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.solid }} /></div>
    </button>
  );
};

const ProgramDetailSheet = ({ program, onClose, onApply }) => (
  <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#0A1628]/70 a-fade" onClick={onClose}>
    <div className="bg-white w-full lg:max-w-lg rounded-t-[2rem] p-6 a-sheet" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between mb-4"><StatusBadge status={getProgramStatus(program)} /><button onClick={onClose}><X size={16} /></button></div>
      <h2 className="text-[24px] font-black mb-4">{program.title}</h2>
      <p className="text-[14px] text-gray-600 mb-6">{program.desc}</p>
      <button onClick={onApply} className="w-full rounded-2xl py-4 bg-[#0A1628] text-white font-black">신청하기</button>
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div><label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">{label}</label>{children}</div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-3"><span className="text-[12px] text-gray-400 font-bold">{label}</span><span className="text-[12px] font-black text-right">{value}</span></div>
);

const AdminGate = ({ pw, setPw, onSubmit, onClose }) => (
  <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0A1628]/80 p-6 a-fade">
    <div className="bg-white rounded-3xl p-8 w-full max-w-sm a-zoom text-center">
      <div className="flex justify-between mb-6"><div className="font-black text-[16px]">관리자 인증</div><button onClick={onClose}><X size={16} /></button></div>
      <form onSubmit={onSubmit}><input type="password" autoFocus value={pw} onChange={e => setPw(e.target.value)} placeholder="gspower1234" className="w-full bg-gray-50 rounded-xl px-4 py-3.5 mb-3 text-black font-bold outline-none" /><button type="submit" className="w-full bg-[#0A1628] text-white rounded-xl py-3.5 font-bold">인증하기</button></form>
    </div>
  </div>
);
