'use client';
// @ts-nocheck

import { useState, useEffect, useRef } from 'react';
import {
  Shield, Calendar, MapPin, Users, ArrowRight, Check, X,
  Plus, Home, Activity, TrendingUp, Settings, LogOut, 
  Search, Star, Award, Heart, UserPlus, Sparkles, Pencil, 
  Stethoscope, ThumbsUp, FileText, Clock
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

// ══════════════════════════════════════════════════════════
// 공통 컴포넌트 & 헬퍼
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

const GlobalStyles = () => (
  <style>{`
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
    html, body { font-family: 'Pretendard Variable', sans-serif; background-color: #FAFAF7; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .a-fade { animation: fadeIn .4s ease-out both; }
    .a-slide-up { animation: slideUp .5s cubic-bezier(0.16,1,0.3,1) both; }
    .stagger > * { opacity: 0; animation: slideUp .5s cubic-bezier(0.16,1,0.3,1) forwards; }
    .stagger > *:nth-child(1) { animation-delay: .05s; }
    .stagger > *:nth-child(2) { animation-delay: .1s; }
    .stagger > *:nth-child(3) { animation-delay: .15s; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
  `}</style>
);

const formatDate = (iso) => {
  if (!iso) return '날짜 미정';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
};

const getProgramStatus = (p) => {
  if (!p) return '종료';
  if (p.manualStatus) return p.manualStatus; 
  if (!p.date || !p.deadline) return '모집중';
  try {
    const today = new Date().toISOString().split('T')[0];
    if (p.date < today) return '종료';
    if (p.deadline < today) return '모집마감';
    return '모집중';
  } catch(e) { return '모집중'; }
};

// 🔥 상태 뱃지에 당첨/탈락 컬러 추가
const StatusBadge = ({ status }) => {
  const colors = {
    '모집중': 'bg-green-100 text-green-700',
    '모집마감': 'bg-red-100 text-red-600',
    '추첨완료': 'bg-purple-100 text-purple-700',
    '종료': 'bg-gray-100 text-gray-500',
    '당첨': 'bg-blue-500 text-white shadow-sm',
    '대기(탈락)': 'bg-red-100 text-red-600',
    '신청완료': 'bg-gray-200 text-gray-600'
  };
  return <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black ${colors[status] || colors['종료']}`}>{status || '종료'}</span>;
};

// ══════════════════════════════════════════════════════════
// Main Application
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

  const timeoutRef = useRef(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        if (supabaseUrl === 'https://placeholder.supabase.co') return;
        
        const { data: pData } = await supabase.from('programs').select('*').order('created_at', { ascending: false });
        if (pData && Array.isArray(pData)) {
          setPrograms(pData.map(p => ({
            id: p.id, title: p.title || '테라피', category: p.category || '물리치료', location: p.location || '부천사업소',
            date: p.date || '', deadline: p.deadline || '', capacity: p.capacity || 10, applied: p.applied || 0,
            rating: p.rating || 5.0, manualStatus: p.manual_status,
            therapist: { name: p.therapist_name || '담당자', role: p.therapist_role || '전문가', avatar: String(p.therapist_name || 'G').charAt(0) },
            desc: p.description || '', color: p.color || 'orange'
          })));
        }
        
        const { data: uData } = await supabase.from('registered_users').select('*');
        if (uData && Array.isArray(uData)) setRegisteredUsers(uData.map(u => ({ name: u.name, empId: String(u.emp_id || '').toUpperCase() })));
        
        try {
          const savedUser = localStorage.getItem('gs_user');
          const savedIsAdmin = localStorage.getItem('gs_isAdmin');
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            if (savedIsAdmin === 'true') {
              setIsAdmin(true);
              setCurrentTab('admin');
            }
            
            // 🔥 앱 로딩 시 DB에서 'appStatus(당첨여부)'도 같이 가져와서 매핑!
            const { data: myApps } = await supabase.from('applications').select('*').eq('emp_id', parsedUser.empId);
            if (myApps && pData) {
              const mappedApps = myApps.map(a => {
                const prog = pData.find(pr => pr.id === a.program_id);
                return prog ? { ...prog, appId: a.id, appStatus: a.status } : null;
              }).filter(Boolean);
              setMyApplications(mappedApps);
            }
          }
        } catch (err) {
          localStorage.removeItem('gs_user');
        }
      } catch (e) { console.error(e); }
    };
    initApp();
  }, []);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (user) timeoutRef.current = setTimeout(handleLogout, 1800000); 
  };

  useEffect(() => {
    if (user) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(e => window.addEventListener(e, resetTimer));
      resetTimer();
      return () => {
        events.forEach(e => window.removeEventListener(e, resetTimer));
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [user]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    const found = registeredUsers.find(u => u.name === loginForm.name && u.empId === String(loginForm.empId).toUpperCase());
    if (found) {
      setUser(found);
      localStorage.setItem('gs_user', JSON.stringify(found));
      if (isAdmin) {
        setCurrentTab('admin');
        localStorage.setItem('gs_isAdmin', 'true');
      }
      
      // 🔥 로그인 시 DB에서 'appStatus(당첨여부)' 매핑
      if (supabaseUrl !== 'https://placeholder.supabase.co') {
        const { data: myApps } = await supabase.from('applications').select('*').eq('emp_id', found.empId);
        if (myApps) {
          const mappedApps = myApps.map(a => {
            const prog = programs.find(pr => pr.id === a.program_id);
            return prog ? { ...prog, appId: a.id, appStatus: a.status } : null;
          }).filter(Boolean);
          setMyApplications(mappedApps);
        }
      }
    } else alert('등록되지 않은 정보입니다.');
  };

  const handleLogout = () => {
    setUser(null); setIsAdmin(false); setCurrentTab('home'); setMyApplications([]);
    localStorage.removeItem('gs_user'); localStorage.removeItem('gs_isAdmin');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    alert('보안을 위해 30분간 활동이 없어 자동 로그아웃 되었습니다.');
  };

  const manualLogout = () => {
    setUser(null); setIsAdmin(false); setMyApplications([]);
    localStorage.removeItem('gs_user'); localStorage.removeItem('gs_isAdmin');
    window.location.reload();
  };

  const applyProgram = async () => {
    if (!selectedProgram) return;
    
    if (supabaseUrl !== 'https://placeholder.supabase.co') {
      const { data: existingApp } = await supabase.from('applications').select('*').eq('program_id', selectedProgram.id).eq('emp_id', user.empId);

      if (existingApp && existingApp.length > 0) {
        alert('이미 신청이 완료된 프로그램입니다!');
        setShowConfirm(false); setShowDetail(false);
        return; 
      }

      const { data: insertedApp, error: insertError } = await supabase.from('applications').insert([{
        program_id: selectedProgram.id,
        emp_id: user.empId,
        user_name: user.name,
        status: '신청완료' // 기본값 명시
      }]).select();

      if (insertError) return alert(`신청 실패 (DB오류): ${insertError.message}`);
      
      const newCount = (selectedProgram.applied || 0) + 1;
      await supabase.from('programs').update({ applied: newCount }).eq('id', selectedProgram.id);
      
      setPrograms(prev => prev.map(p => p.id === selectedProgram.id ? { ...p, applied: newCount } : p));
      setMyApplications(prev => [...prev, { ...selectedProgram, applied: newCount, appId: insertedApp?.[0]?.id, appStatus: '신청완료' }]);
    }
    
    setShowConfirm(false); setShowDetail(false); setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  const handleRate = async (pid, rate) => {
    if (supabaseUrl !== 'https://placeholder.supabase.co') await supabase.from('programs').update({ rating: rate }).eq('id', pid);
    setPrograms(prev => prev.map(p => p.id === pid ? { ...p, rating: rate } : p));
    setMyApplications(prev => prev.map(p => p.id === pid ? { ...p, rating: rate } : p));
    alert('평점이 반영되었습니다! ⭐');
  };

  // 🔥 [V15.1] 완벽 복구된 추첨 알고리즘 (수정 없이 그대로 사용!)
  const handleLottery = async (programId) => {
    if (supabaseUrl === 'https://placeholder.supabase.co') return;

    const targetProgram = programs.find(p => p.id === programId);
    if (!targetProgram) return;
    const capacity = targetProgram.capacity;

    const { data: currentApplicants } = await supabase.from('applications').select('*').eq('program_id', programId);
    if (!currentApplicants || currentApplicants.length === 0) return alert('신청자가 없어 추첨을 진행할 수 없습니다.');

    const { data: pastWinners } = await supabase.from('applications').select('emp_id').eq('status', '당첨').neq('program_id', programId);
    const pastWinnerIds = pastWinners ? pastWinners.map(a => a.emp_id) : [];

    const firstPriority = [];
    const secondPriority = [];
    currentApplicants.forEach(app => {
      if (pastWinnerIds.includes(app.emp_id)) secondPriority.push(app); 
      else firstPriority.push(app);  
    });

    const shuffle = (array) => array.sort(() => Math.random() - 0.5);
    shuffle(firstPriority); shuffle(secondPriority);

    let winners = [];
    let losers = [];

    if (firstPriority.length >= capacity) {
      winners = firstPriority.slice(0, capacity);
      losers = [...firstPriority.slice(capacity), ...secondPriority];
    } else {
      winners = [...firstPriority];
      const remainingSeats = capacity - firstPriority.length;
      winners = [...winners, ...secondPriority.slice(0, remainingSeats)];
      losers = secondPriority.slice(remainingSeats);
    }

    if (winners.length > 0) await supabase.from('applications').update({ status: '당첨' }).in('id', winners.map(w => w.id));
    if (losers.length > 0) await supabase.from('applications').update({ status: '대기(탈락)' }).in('id', losers.map(l => l.id));

    await supabase.from('programs').update({ manual_status: '추첨완료' }).eq('id', programId);
    setPrograms(prev => prev.map(p => p.id === programId ? { ...p, manualStatus: '추첨완료' } : p));

    const resultHtml = `
      <div class="text-left w-full">
        <p class="font-black text-[15px] text-[#0A1628] mb-3">🎯 총 신청자: ${currentApplicants.length}명 (정원: ${capacity}명)</p>
        <div class="bg-gray-50 p-3 rounded-xl mb-4">
          <p class="text-[12px] font-bold text-gray-600">✨ 1순위 (신규): <span class="text-blue-600">${firstPriority.length}명</span></p>
          <p class="text-[12px] font-bold text-gray-600 mt-1">🚨 2순위 (직전 당첨자): <span class="text-red-500">${secondPriority.length}명</span></p>
        </div>
        <p class="font-black text-green-600 text-[13px] mb-1">🎉 최종 당첨자 (${winners.length}명)</p>
        <p class="text-[12px] text-gray-500 bg-green-50 p-2 rounded-lg break-words leading-relaxed">${winners.map(w => w.user_name).join(', ') || '없음'}</p>
        
        <p class="font-black text-red-500 text-[13px] mt-3 mb-1">💧 대기/탈락자 (${losers.length}명)</p>
        <p class="text-[12px] text-gray-500 bg-red-50 p-2 rounded-lg break-words leading-relaxed">${losers.map(l => l.user_name).join(', ') || '없음'}</p>
      </div>
    `;
    setLotteryResult(resultHtml);
  };

  const filtered = programs.filter(p => (filterLoc === '전체' || String(p.location||'').includes(filterLoc)) && (!searchQ || String(p.title||'').includes(searchQ)));
  const colorMap = {
    orange: { bg: 'bg-[#FFF4EB]', text: 'text-[#C85A0F]', solid: '#F47B20', soft: 'from-[#FFE5CC] to-[#FFF4EB]' },
    blue:   { bg: 'bg-[#EDF2FB]', text: 'text-[#1B3A6B]', solid: '#2B4C8C', soft: 'from-[#D6E0F5] to-[#EDF2FB]' },
    green:  { bg: 'bg-[#EFF8EC]', text: 'text-[#2E7D32]', solid: '#5CB85C', soft: 'from-[#D4EDC9] to-[#EFF8EC]' }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAFAF7]">
        <GlobalStyles />
        <div className="w-full max-w-[400px] a-slide-up text-center">
          <div className="mb-10 inline-block bg-white px-8 py-5 rounded-3xl shadow-sm"><GSLogo size={50} /></div>
          <h1 className="text-[32px] font-black leading-tight mb-8 text-[#0A1628]">건강한 당신이<br/><span className="bg-gradient-to-r from-[#F47B20] via-[#1B3A6B] to-[#5CB85C] bg-clip-text text-transparent">곧 건강한 회사입니다</span></h1>
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
              <input value={loginForm.name} onChange={e=>setLoginForm({...loginForm, name:e.target.value})} placeholder="성함" className="w-full p-4 text-[16px] font-bold outline-none border-b border-gray-50" />
              <input value={loginForm.empId} onChange={e=>setLoginForm({...loginForm, empId:e.target.value})} placeholder="사번 (C80XXXX)" className="w-full p-4 text-[16px] font-bold outline-none" />
            </div>
            <button className="w-full bg-[#0A1628] text-white py-5 rounded-2xl font-black shadow-lg active:scale-95 transition-all">입장하기</button>
          </form>
          <button onClick={()=>setShowAdminGate(true)} className="mt-10 text-[12px] text-gray-400 font-bold flex items-center gap-1 mx-auto hover:text-[#1B3A6B]"><Shield size={12}/>관리자 접속</button>
        </div>
        
        {showAdminGate && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-6 a-fade">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm">
            <h3 className="font-black mb-6 flex items-center gap-2"><Shield size={18} className="text-[#1B3A6B]"/>관리자 인증</h3>
            <input type="password" value={adminPw} onChange={e=>setAdminPw(e.target.value)} placeholder="비밀번호를 입력하세요" className="w-full bg-gray-100 p-4 rounded-xl mb-4 outline-none font-bold focus:bg-white border-2 border-transparent focus:border-[#1B3A6B]" />
            <div className="flex gap-2">
              <button onClick={()=>setShowAdminGate(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-xl font-bold">취소</button>
              <button onClick={()=>{
                if(adminPw==='gspower1234'){
                  setIsAdmin(true); setShowAdminGate(false); setAdminPw('');
                  alert('인증 완료! 이제 성함/사번으로 로그인하시면 관리자 모드로 접속됩니다.');
                } else { alert('비밀번호가 일치하지 않습니다.'); }
              }} className="flex-[2] bg-[#0A1628] text-white py-4 rounded-xl font-bold">인증하기</button>
            </div>
          </div>
        </div>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col lg:flex-row">
      <GlobalStyles />
      <aside className="hidden lg:flex flex-col w-[260px] bg-white border-r border-gray-100 p-8 sticky top-0 h-screen">
        <div className="mb-12"><GSLogo size={40} onClick={()=>setCurrentTab('home')} /></div>
        <nav className="space-y-2">
          {[{id:'home',icon:Home,label:'홈'},{id:'programs',icon:Activity,label:'프로그램'},{id:'my',icon:Heart,label:'내 신청'}].map(m=>(
            <button key={m.id} onClick={()=>setCurrentTab(m.id)} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black transition-all ${currentTab===m.id?'bg-[#0A1628] text-white shadow-md':'text-gray-400 hover:bg-gray-50'}`}><m.icon size={18}/>{m.label}</button>
          ))}
          {isAdmin && <button onClick={()=>setCurrentTab('admin')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black mt-10 ${currentTab==='admin'?'bg-blue-600 text-white shadow-md':'text-blue-500 hover:bg-blue-50'}`}><Settings size={18}/>관리자 센터</button>}
        </nav>
        <button onClick={manualLogout} className="mt-auto flex items-center justify-center gap-2 text-gray-300 font-bold text-[12px] hover:text-red-400"><LogOut size={12}/>로그아웃</button>
      </aside>

      <main className="flex-1 p-5 lg:p-12 pb-24 overflow-x-hidden">
        <div className="lg:hidden mb-6 flex justify-between items-center"><GSLogo size={36} onClick={()=>setCurrentTab('home')} /><button onClick={manualLogout} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-red-400 shadow-sm"><LogOut size={18}/></button></div>
        
        {currentTab === 'home' && (
          <div className="space-y-8 a-fade">
            <div className="bg-[#0A1628] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"/>
              <h1 className="text-[36px] font-black leading-tight mb-4">{user.name}님,<br/>오늘도 건강하세요</h1>
              <p className="text-white/50 text-[14px] mb-8 font-medium">안전과 보건을 생각하는 부천사업소 전용 포털</p>
              <button onClick={()=>setCurrentTab('programs')} className="bg-white text-[#0A1628] px-6 py-3 rounded-2xl font-black text-[14px] flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">프로그램 보기 <ArrowRight size={16}/></button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
              <StatCard icon={Activity} label="참여 프로그램" value={myApplications.length} suffix="건" color="#F47B20" />
              <StatCard icon={Users} label="평균 만족도" value="4.9" suffix="/5.0" color="#5CB85C" />
              <StatCard icon={Award} label="신규 테라피" value={programs.length} suffix="개" color="#2B4C8C" />
              <StatCard icon={TrendingUp} label="총 신청 인원" value={Array.isArray(programs) ? programs.reduce((a,p)=>a+(p?.applied||0),0) : 0} suffix="명" color="#F47B20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.isArray(programs) && programs.slice(0, 2).map(p => <FeaturedCard key={p.id} program={p} colorMap={colorMap} onClick={()=>{setSelectedProgram(p);setShowDetail(true);}} />)}
            </div>
          </div>
        )}

        {currentTab === 'programs' && (
          <div className="space-y-8 a-fade">
            <div className="flex flex-col gap-4">
              <div className="relative shadow-sm"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" /><input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="검색어를 입력하세요" className="w-full bg-white border border-gray-100 rounded-3xl pl-12 py-5 font-black outline-none focus:border-[#0A1628]" /></div>
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {['전체','부천','안양','서울'].map(l=>(
                  <button key={l} onClick={()=>setFilterLoc(l)} className={`px-6 py-2.5 rounded-full text-[13px] font-black whitespace-nowrap transition-all ${filterLoc===l?'bg-[#0A1628] text-white shadow-lg':'bg-white text-gray-400 border border-gray-100 shadow-sm'}`}>{l=== '전체' ? l : l+'사업소'}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
              {Array.isArray(filtered) && filtered.map(p => <CompactCard key={p.id} program={p} colorMap={colorMap} onClick={()=>{setSelectedProgram(p);setShowDetail(true);}} />)}
            </div>
          </div>
        )}

        {currentTab === 'my' && (
          <div className="space-y-6 a-fade">
            <h2 className="text-[28px] font-black">내 신청 내역</h2>
            {!myApplications || myApplications.length === 0 ? <div className="p-20 text-center text-gray-300 font-black bg-white rounded-3xl border border-gray-100 shadow-sm">신청 내역이 없습니다</div> : (
              <div className="space-y-4">
                {myApplications.map((p, i) => {
                  const c = colorMap[p?.color] || colorMap.orange;
                  const isCompleted = getProgramStatus(p) === '종료'; 
                  // 🔥 DB에서 가져온 상태(당첨, 대기, 신청완료)를 우선 보여줍니다!
                  const displayStatus = p?.appStatus || '신청완료';

                  return (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.bg}`}><Stethoscope size={24} style={{color: c.solid}}/></div><div><h3 className="font-black text-[17px]">{p?.title}</h3><p className="text-[12px] text-gray-400 font-bold">{p?.location} · {formatDate(p?.date)}</p></div></div>
                        <StatusBadge status={displayStatus} />
                      </div>

                      {/* 🔥 오직 '당첨자'이면서 프로그램이 '종료'되었을 때만 평점을 매길 수 있음! */}
                      {isCompleted && displayStatus === '당첨' ? (
                        <div className="bg-gray-50 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 mt-4 shadow-inner">
                          <div className="flex items-center gap-2 text-[12px] font-black text-gray-600"><ThumbsUp size={16} className="text-orange-500"/> 테라피는 어떠셨나요? 만족도를 평가해주세요!</div>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(s=>(
                              <button key={s} onClick={() => {
                                if(confirm(`만족도 ${s}점을 부여하시겠습니까?`)) {
                                  handleRate(p.id, s);
                                }
                              }} className="hover:scale-125 transition-transform">
                                <Star size={24} className={s<=(p?.rating||0)?'fill-orange-400 text-orange-400':'text-gray-200'}/>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : isCompleted ? (
                        // 프로그램은 끝났는데 탈락자거나 신청만 한 경우
                        <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-center gap-2 mt-4 shadow-inner">
                          <p className="text-[12px] font-black text-gray-400">참여 대상자가 아니어 평점을 남길 수 없습니다.</p>
                        </div>
                      ) : (
                        // 아직 프로그램이 진행되지 않았을 경우
                        <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-center gap-2 mt-4 shadow-inner">
                          <Clock size={14} className="text-gray-400" />
                          <p className="text-[12px] font-black text-gray-400">프로그램이 완료된 후 평점을 남길 수 있습니다 ⏳</p>
                        </div>
                      )}

                      <div className="mt-4 flex justify-end"><button onClick={async()=>{
                        if(confirm('신청을 취소하시겠습니까?')) {
                           if(p.appId && supabaseUrl !== 'https://placeholder.supabase.co') {
                             await supabase.from('applications').delete().eq('id', p.appId);
                             const newCount = Math.max(0, (p.applied || 1) - 1);
                             await supabase.from('programs').update({ applied: newCount }).eq('id', p.id);
                             setPrograms(prev => prev.map(pr => pr.id === p.id ? { ...pr, applied: newCount } : pr));
                             setMyApplications(prev => prev.filter(app => app.appId !== p.appId));
                           }
                        }
                      }} className="text-[11px] font-bold text-gray-300 hover:text-red-500">신청 취소하기</button></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentTab === 'admin' && isAdmin && <AdminPanel programs={programs} users={registeredUsers} onLottery={handleLottery} colorMap={colorMap} />}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around py-3 pb-8 z-50">
        {[{id:'home',icon:Home,l:'홈'},{id:'programs',icon:Activity,l:'목록'},{id:'my',icon:Heart,l:'내 신청'}].map(m=>(
          <button key={m.id} onClick={()=>setCurrentTab(m.id)} className={`flex flex-col items-center gap-1 ${currentTab===m.id?'text-[#0A1628]':'text-gray-300'}`}><m.icon size={20}/><span className="text-[10px] font-black">{m.l}</span></button>
        ))}
        {isAdmin && <button onClick={()=>setCurrentTab('admin')} className={`flex flex-col items-center gap-1 ${currentTab==='admin'?'text-blue-600':'text-gray-300'}`}><Settings size={20}/><span className="text-[10px] font-black">관리</span></button>}
      </nav>

      {showDetail && selectedProgram && <ProgramDetailSheet program={selectedProgram} myApplications={myApplications} colorMap={colorMap} onClose={()=>setShowDetail(false)} onApply={()=>setShowConfirm(true)} />}
      {showConfirm && <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-[100] a-fade backdrop-blur-sm"><div className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm text-center shadow-2xl"><h3 className="text-[20px] font-black mb-4">신청하시겠습니까?</h3><div className="bg-gray-50 p-4 rounded-2xl text-[14px] font-bold text-gray-600 mb-6">{selectedProgram.title}<br/>{formatDate(selectedProgram.date)}</div><div className="flex gap-2"><button onClick={()=>setShowConfirm(false)} className="flex-1 py-4 font-black bg-gray-100 rounded-2xl">취소</button><button onClick={applyProgram} className="flex-[2] py-4 font-black bg-[#0A1628] text-white rounded-2xl shadow-lg">확인</button></div></div></div>}
      {showSuccess && <div className="fixed inset-0 bg-white/90 flex items-center justify-center z-[200] a-fade"><div className="text-center"><div className="w-20 h-20 bg-green-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"><Check size={40} strokeWidth={4}/></div><h2 className="text-[28px] font-black text-[#0A1628]">신청 완료!</h2></div></div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// 하위 컴포넌트들
// ══════════════════════════════════════════════════════════
const StatCard = ({ icon:Icon, label, value, suffix, color }) => (
  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"><div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{backgroundColor: color+'15'}}><Icon size={16} style={{color}}/></div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p><div className="flex items-baseline gap-1"><span className="text-[22px] font-black text-[#0A1628]">{value}</span><span className="text-[11px] font-bold text-gray-400">{suffix}</span></div></div>
);

const FeaturedCard = ({ program, colorMap, onClick }) => {
  const c = colorMap[program?.color] || colorMap.orange;
  const pct = Math.min(100, ((program?.applied||0) / (program?.capacity||1)) * 100);
  return (
    <button onClick={onClick} className="w-full text-left bg-white p-7 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden hover:shadow-xl transition-all group">
      <div className={`absolute inset-0 bg-gradient-to-br ${c.soft} opacity-30`}/>
      <div className="relative">
        <div className="flex justify-between mb-8"><span className={`text-[10px] font-black px-3 py-1 rounded-full ${c.bg} ${c.text}`}>{program?.category || '테라피'}</span><StatusBadge status={getProgramStatus(program)}/></div>
        <h3 className="text-[24px] font-black text-[#0A1628] leading-tight mb-4 line-clamp-2">{program?.title}</h3>
        <div className="space-y-1.5 text-[12px] text-gray-500 font-bold mb-8"><div className="flex gap-2"><MapPin size={12}/>{program?.location}</div><div className="flex gap-2"><Calendar size={12}/>{formatDate(program?.date)}</div></div>
        <div className="flex items-center gap-3 mb-6"><div className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center font-black text-[12px]" style={{backgroundColor: c.solid, color: 'white'}}>{program?.therapist?.avatar}</div><div><p className="text-[13px] font-black text-[#0A1628]">{program?.therapist?.name}</p><p className="text-[11px] text-gray-400">{program?.therapist?.role}</p></div></div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full transition-all duration-700" style={{width: pct+'%', backgroundColor: c.solid}}/></div>
      </div>
    </button>
  );
};

const CompactCard = ({ program, colorMap, onClick }) => {
  const c = colorMap[program?.color] || colorMap.orange;
  return (
    <button onClick={onClick} className="w-full text-left bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-lg transition-all shadow-sm">
      <div className="flex justify-between mb-4"><span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${c.bg} ${c.text}`}>{program?.category}</span><StatusBadge status={getProgramStatus(program)}/></div>
      <h3 className="font-black text-[#0A1628] leading-tight mb-4">{program?.title}</h3>
      <div className="flex justify-between items-center text-[11px] text-gray-400 font-bold"><span>{program?.location}</span><span>{formatDate(program?.date)}</span></div>
    </button>
  );
};

const ProgramDetailSheet = ({ program, colorMap, onClose, onApply, myApplications }) => {
  const isApplied = myApplications?.some(a => a.id === program.id);
  const status = getProgramStatus(program);
  
  let btnText = "이 프로그램 신청하기";
  let isDisabled = status !== '모집중';
  
  if (isApplied) {
    btnText = "이미 신청 완료한 프로그램입니다 💖";
    isDisabled = true;
  } else if (status === '모집마감') {
    btnText = "모집이 마감되었습니다 🔒";
  } else if (status === '추첨완료') {
    btnText = "추첨이 완료되었습니다 🎉";
  } else if (status === '종료') {
    btnText = "종료된 프로그램입니다";
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center a-fade" onClick={onClose}>
      <div className="bg-white w-full max-w-xl rounded-t-[3rem] p-8 pb-12 overflow-y-auto max-h-[90vh] a-slide-up shadow-2xl" onClick={e=>e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
        <div className="flex justify-between mb-6"><StatusBadge status={status} /><button onClick={onClose}><X size={24}/></button></div>
        <h2 className="text-[32px] font-black text-[#0A1628] leading-tight mb-4">{program?.title}</h2>
        <p className="text-gray-500 font-medium mb-8 leading-relaxed">{program?.desc}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-gray-50 p-5 rounded-2xl shadow-inner">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 flex items-center gap-1"><MapPin size={12}/> 장소</p>
            <p className="font-black text-[#0A1628]">{program?.location}</p>
          </div>
          <div className="bg-blue-50 p-5 rounded-2xl shadow-inner border border-blue-100">
            <p className="text-[10px] font-black text-blue-400 uppercase mb-2 flex items-center gap-1"><Calendar size={12}/> 실시 예정일</p>
            <p className="font-black text-blue-900">{formatDate(program?.date)}</p>
          </div>
          <div className="bg-gray-50 p-5 rounded-2xl shadow-inner">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 flex items-center gap-1"><Clock size={12}/> 신청 마감일</p>
            <p className="font-black text-[#0A1628]">{formatDate(program?.deadline)}</p>
          </div>
          <div className="bg-gray-50 p-5 rounded-2xl shadow-inner">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 flex items-center gap-1"><Users size={12}/> 현재 신청 현황</p>
            <p className="font-black text-[#0A1628]"><span className={program?.applied >= program?.capacity ? 'text-red-500' : 'text-blue-600'}>{program?.applied}명</span> / {program?.capacity}명</p>
          </div>
        </div>
        
        <button onClick={onApply} disabled={isDisabled} className={`w-full text-white py-5 rounded-3xl font-black shadow-xl active:scale-95 transition-transform ${isDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#0A1628]'}`}>
          {btnText}
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// 관리자 패널
// ══════════════════════════════════════════════════════════
const AdminPanel = ({ programs, users, onLottery, colorMap }) => {
  const [form, setForm] = useState({ titleType: '근골격계 테라피', customTitle: '', category: '물리치료', location: '부천사업소', date: '', deadline: '', capacity: '', therapistName: '', desc: '' });
  const [newUser, setNewUser] = useState({ name: '', empId: '' });
  const [editingId, setEditingId] = useState(null);
  
  const [viewingApplicants, setViewingApplicants] = useState(null);
  const [applicantsList, setApplicantsList] = useState([]);

  const handleCreateOrUpdate = async () => {
    const title = form.titleType === '기타' ? form.customTitle : form.titleType;
    const payload = {
      title, location: form.location, category: form.category, date: form.date, deadline: form.deadline,
      capacity: parseInt(form.capacity), therapist_name: form.therapistName, description: form.desc || '테라피 세션',
      color: form.location.includes('안양') ? 'orange' : form.location.includes('부천') ? 'blue' : 'green'
    };
    
    if (editingId) {
      const { error } = await supabase.from('programs').update(payload).eq('id', editingId);
      if (error) return alert('수정 실패 (DB오류): ' + error.message);
      alert('수정 완료!');
    } else {
      payload.applied = 0;
      const { error } = await supabase.from('programs').insert([payload]);
      if (error) return alert('게시 실패 (DB오류): ' + error.message);
      alert('게시 완료!');
    }
    window.location.reload();
  };

  const handleEditClick = (p) => {
    setEditingId(p.id);
    setForm({
      titleType: (p.title==='근골격계 테라피' || p.title==='스트레칭 클래스') ? p.title : '기타',
      customTitle: (p.title!=='근골격계 테라피' && p.title!=='스트레칭 클래스') ? p.title : '',
      category: p.category, location: p.location, date: p.date, deadline: p.deadline, capacity: p.capacity, therapistName: p.therapist?.name || '', desc: p.desc
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchApplicants = async (program) => {
    setViewingApplicants(program);
    if (supabaseUrl !== 'https://placeholder.supabase.co') {
      const { data } = await supabase.from('applications').select('*').eq('program_id', program.id).order('created_at', { ascending: true });
      if (data) setApplicantsList(data);
      else setApplicantsList([]);
    }
  };

  const inputCls = "w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 font-black outline-none focus:bg-white focus:border-[#0A1628] transition-all";

  return (
    <div className="space-y-12 pb-20">
      <h1 className="text-[32px] font-black text-[#0A1628]">운영자 센터</h1>
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <h3 className="font-black mb-6 flex items-center gap-2"><UserPlus size={20}/> 임직원 권한 관리</h3>
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <input value={newUser.name} onChange={e=>setNewUser({...newUser, name:e.target.value})} placeholder="성함" className={inputCls} />
          <input value={newUser.empId} onChange={e=>setNewUser({...newUser, empId:e.target.value})} placeholder="사번" className={inputCls} />
          <button onClick={async()=>{await supabase.from('registered_users').insert([{name:newUser.name, emp_id:newUser.empId.toUpperCase()}]); window.location.reload();}} className="bg-[#0A1628] text-white px-8 py-4 rounded-2xl font-black shadow-lg">등록</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto hide-scrollbar">
          {Array.isArray(users) && users.map((u, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center"><div className="font-bold text-[13px]">{u.name} <span className="text-gray-300 text-[10px]">{u.empId}</span></div><button onClick={async()=>{await supabase.from('registered_users').delete().eq('emp_id', u.empId); window.location.reload();}}><X size={14}/></button></div>
          ))}
        </div>
      </div>
      
      <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${editingId?'border-orange-400 bg-orange-50/30':'border-gray-100 bg-white shadow-sm'}`}>
        <h3 className="font-black mb-6 flex items-center gap-2">{editingId?<Pencil size={20}/>:<Plus size={20}/>} {editingId?'내용 수정하기':'새 프로그램 개설'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="프로그램명"><select value={form.titleType} onChange={e=>setForm({...form, titleType:e.target.value})} className={inputCls}><option>근골격계 테라피</option><option>스트레칭 클래스</option><option>기타</option></select></Field>
          {form.titleType==='기타' && <Field label="직접 입력"><input value={form.customTitle} onChange={e=>setForm({...form, customTitle:e.target.value})} className={inputCls} /></Field>}
          <Field label="장소"><select value={form.location} onChange={e=>setForm({...form, location:e.target.value})} className={inputCls}><option>부천사업소</option><option>안양사업소</option><option>서울사업소</option></select></Field>
          <Field label="실시일"><input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} className={inputCls} /></Field>
          <Field label="마감일"><input type="date" value={form.deadline} onChange={e=>setForm({...form, deadline:e.target.value})} className={inputCls} /></Field>
          <Field label="정원"><input type="number" value={form.capacity} onChange={e=>setForm({...form, capacity:e.target.value})} className={inputCls} /></Field>
          <Field label="강사명"><input value={form.therapistName} onChange={e=>setForm({...form, therapistName:e.target.value})} className={inputCls} /></Field>
        </div>
        <div className="flex gap-2 mt-8">
          {editingId && <button onClick={()=>window.location.reload()} className="flex-1 bg-gray-200 py-5 rounded-3xl font-black">취소</button>}
          <button onClick={handleCreateOrUpdate} className={`py-5 rounded-3xl font-black shadow-xl ${editingId?'flex-[2] bg-orange-500 text-white':'w-full bg-[#0A1628] text-white'}`}>{editingId?'수정 내용 저장하기':'프로그램 게시하기'}</button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-black text-[#0A1628]">운영 현황</h3>
        {Array.isArray(programs) && programs.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="font-black text-[18px] text-[#0A1628]">{p?.title}</h4>
                <StatusBadge status={getProgramStatus(p)}/>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 text-[12px] font-bold text-gray-500 bg-gray-50 p-4 rounded-2xl">
                <div className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400"/> {p?.location}</div>
                <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400"/> 실시: {formatDate(p?.date)}</div>
                <div className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400"/> 마감: {formatDate(p?.deadline)}</div>
                <div className="flex items-center gap-1.5"><UserPlus size={14} className="text-gray-400"/> 강사: {p?.therapist?.name}</div>
                <div className="flex items-center gap-1.5 col-span-2 lg:col-span-1"><Users size={14} className="text-gray-400"/> 현황: <span className={p?.applied >= p?.capacity ? 'text-red-500' : 'text-blue-500'}>{p?.applied}</span> / {p?.capacity}명 신청</div>
              </div>
            </div>
            
            <div className="flex gap-2 items-center flex-wrap md:flex-nowrap w-full md:w-auto justify-end mt-2 md:mt-0">
              {getProgramStatus(p) === '모집마감' && <button onClick={()=>onLottery(p.id)} className="bg-orange-500 text-white px-5 py-3 rounded-xl font-black text-[12px] shadow-lg active:scale-95">추첨 실행</button>}
              <button onClick={()=>fetchApplicants(p)} className="bg-green-50 text-green-700 px-5 py-3 rounded-xl font-black text-[12px] flex items-center gap-1"><FileText size={14}/>명단보기</button>
              <button onClick={()=>handleEditClick(p)} className="bg-blue-50 text-blue-600 px-5 py-3 rounded-xl font-black text-[12px]">수정</button>
              <button onClick={async()=>{
                if(confirm('정말 삭제하시겠습니까?')){
                  const { error } = await supabase.from('programs').delete().eq('id', p.id); 
                  if (error) alert('삭제 실패 (DB오류): ' + error.message);
                  else window.location.reload();
                }
              }} className="bg-red-50 text-red-500 px-5 py-3 rounded-xl font-black text-[12px]">삭제</button>
            </div>
          </div>
        ))}
      </div>
      
      {viewingApplicants && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 a-fade">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl a-zoom max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-[20px] text-[#0A1628]">신청자 명단</h3>
              <button onClick={() => setViewingApplicants(null)} className="p-2 bg-gray-50 rounded-xl"><X size={20}/></button>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl mb-4">
              <p className="font-black text-[#0A1628] text-[14px]">{viewingApplicants.title}</p>
              <p className="text-[12px] text-gray-500 font-bold">{formatDate(viewingApplicants.date)} · 총 {applicantsList.length}명 신청</p>
            </div>
            <div className="overflow-y-auto hide-scrollbar space-y-2 flex-1">
              {applicantsList.length === 0 ? (
                <p className="text-center text-gray-400 font-bold py-10">신청자가 없습니다.</p>
              ) : (
                applicantsList.map((app, idx) => (
                  <div key={app.id} className="bg-white border border-gray-100 p-4 rounded-xl flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#0A1628] text-white rounded-lg flex items-center justify-center font-black text-[12px]">{idx + 1}</div>
                      <div>
                        <p className="font-black text-[14px] text-[#0A1628] leading-tight">{app.user_name}</p>
                        <p className="text-[10px] text-gray-400 font-bold">{app.emp_id}</p>
                      </div>
                    </div>
                    {/* 🔥 관리자 명단보기 화면에 당첨/대기(탈락) 뱃지 띄워주기! */}
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${app.status === '당첨' ? 'bg-blue-500 text-white' : app.status === '대기(탈락)' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      {app.status || '신청완료'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="w-full">
    <label className="text-[10px] font-black text-gray-400 mb-2 block ml-1 uppercase">{label}</label>
    {children}
  </div>
);
