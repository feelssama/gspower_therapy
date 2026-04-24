'use client';
// @ts-nocheck

import { useState, useEffect } from 'react';

export default function TherapySystem() {
  // --- [1. 상태 관리 스테이트] ---
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  // 임직원 사용자 정보
  const [user, setUser] = useState(null); // { name: '', empId: '' }
  const [showUserLogin, setShowUserLogin] = useState(true);
  const [loginInput, setLoginInput] = useState({ name: '', empId: '' });

  // 신청 프로세스 관련
  const [selectedSession, setSelectedSession] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  
  // 데이터베이스 대용 상태
  const [sessions, setSessions] = useState([
    { id: 1, location: "안양사업소", date: "2026-05-20", capacity: 20, applied: 18, status: "모집 중" },
    { id: 2, location: "부천사업소", date: "2026-05-15", capacity: 15, applied: 14, status: "모집 중" },
    { id: 3, location: "서울사업소", date: "2026-05-25", capacity: 10, applied: 5, status: "모집 중" },
  ]);

  // 관리자 신규 개설용
  const [newSession, setNewSession] = useState({ loc: '부천사업소', date: '', capa: '' });

  // --- [2. 핵심 로직 함수] ---

  // 임직원 식별 (로그인)
  const handleUserLogin = (e) => {
    e.preventDefault();
    if (!loginInput.name || !loginInput.empId) return alert("성함과 사번을 입력해주세요.");
    setUser({ ...loginInput });
    setShowUserLogin(false);
  };

  // 관리자 인증
  const handleAdminAuth = (e) => {
    e.preventDefault();
    if (adminPassword === 'gspower1234') {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setAdminPassword('');
    } else { alert('비밀번호가 틀렸습니다.'); }
  };

  // 신청 단계 1: 세션 선택
  const openConfirm = (session) => {
    if (session.applied >= session.capacity) return alert("정원이 마감되었습니다.");
    setSelectedSession(session);
    setShowConfirmModal(true);
  };

  // 신청 단계 2: 최종 확인 후 DB 업데이트
  const finalApply = () => {
    setSessions(sessions.map(s => 
      s.id === selectedSession.id ? { ...s, applied: s.applied + 1 } : s
    ));
    setShowConfirmModal(false);
    setShowResultModal(true); // 결과창 노출
  };

  // 세션 개설
  const createSession = () => {
    if (!newSession.date || !newSession.capa) return alert("정보를 입력하세요.");
    const ns = { id: Date.now(), location: newSession.loc, date: newSession.date, capacity: parseInt(newSession.capa), applied: 0, status: "모집 중" };
    setSessions([ns, ...sessions]);
    setNewSession({ loc: '부천사업소', date: '', capa: '' });
  };

  // --- [3. UI 컴포넌트] ---

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-[#FF6600] selection:text-white">
      
      {/* A. 임직원 식별 모달 (최초 진입) */}
      {showUserLogin && !isAdminMode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white p-6 animate-in fade-in zoom-in duration-300">
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center gap-1 mb-8">
              <span className="text-4xl font-black text-[#003366]">GS</span><span className="text-4xl font-black text-[#FF6600]">POWER</span>
            </div>
            <h2 className="text-2xl font-bold mb-10 tracking-tight">임직원 인증 후 이용 가능합니다.</h2>
            <form onSubmit={handleUserLogin} className="space-y-4">
              <input type="text" placeholder="성함" value={loginInput.name} onChange={e=>setLoginInput({...loginInput, name: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#003366] text-center" />
              <input type="text" placeholder="사번" value={loginInput.empId} onChange={e=>setLoginInput({...loginInput, empId: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#003366] text-center" />
              <button className="w-full p-5 bg-[#003366] text-white rounded-2xl font-bold text-xl shadow-xl shadow-blue-900/20 active:scale-95 transition-all">프로그램 조회하기</button>
            </form>
          </div>
        </div>
      )}

      {/* B. 관리자 로그인 모달 */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#003366]/95 backdrop-blur-xl p-6">
          <div className="bg-white p-12 rounded-[3rem] w-full max-w-md text-center shadow-2xl">
            <h2 className="text-2xl font-bold mb-10">관리자 보안 인증</h2>
            <form onSubmit={handleAdminAuth}>
              <input type="password" placeholder="Admin Password" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} className="w-full p-5 bg-gray-50 rounded-2xl mb-6 text-center outline-none focus:ring-2 focus:ring-[#FF6600]" />
              <button className="w-full p-5 bg-[#003366] text-white rounded-2xl font-bold text-lg mb-4">대시보드 접속</button>
              <button type="button" onClick={()=>setShowAdminLogin(false)} className="text-gray-400 text-sm">닫기</button>
            </form>
          </div>
        </div>
      )}

      {/* C. 신청 확인 모달 (Causality Step) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-8">
            <h3 className="text-2xl font-bold mb-6 text-center text-[#003366]">신청 정보를 확인하세요.</h3>
            <div className="space-y-4 mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm">
              <div className="flex justify-between"><span>신청자</span><span className="font-bold">{user?.name} ({user?.empId})</span></div>
              <div className="flex justify-between"><span>프로그램</span><span className="font-bold">{selectedSession?.location}</span></div>
              <div className="flex justify-between"><span>일시</span><span className="font-bold">{selectedSession?.date}</span></div>
            </div>
            <button onClick={finalApply} className="w-full p-5 bg-[#FF6600] text-white rounded-2xl font-bold text-xl shadow-lg mb-4">최종 신청하기</button>
            <button onClick={()=>setShowConfirmModal(false)} className="w-full p-5 bg-gray-100 text-gray-400 rounded-2xl font-bold">취소</button>
          </div>
        </div>
      )}

      {/* D. 신청 완료 결과 모달 */}
      {showResultModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white p-6 animate-in zoom-in duration-300">
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tight">신청이 완료되었습니다!</h2>
            <p className="text-gray-500 mb-12">선정 결과는 추후 공지사항을 통해 확인해주세요.</p>
            <button onClick={()=>setShowResultModal(false)} className="px-12 py-5 bg-[#003366] text-white rounded-2xl font-bold text-xl">메인으로 돌아가기</button>
          </div>
        </div>
      )}

      {/* E. 글로벌 네비게이션 */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-[#003366]">GS</span><span className="text-xl font-black text-[#FF6600]">POWER</span>
            <div className="h-4 w-px bg-gray-300 mx-3"></div>
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Therapy Portal</span>
          </div>
          <div className="flex items-center gap-4">
            {!isAdminMode && user && <span className="text-sm font-bold text-[#003366]">{user.name} 님 환영합니다</span>}
            {isAdminMode ? (
              <button onClick={()=>setIsAdminMode(false)} className="bg-orange-50 text-[#FF6600] px-5 py-2 rounded-full text-xs font-black">USER MODE SWITCH</button>
            ) : (
              <button onClick={()=>setShowAdminLogin(true)} className="text-gray-300 hover:text-gray-900 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></button>
            )}
          </div>
        </div>
      </nav>

      {/* F. 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto p-6 lg:p-12">
        <header className="mb-20">
          <h1 className="text-5xl font-black tracking-tighter mb-4">{isAdminMode ? '관리자 대시보드' : '임직원 맞춤형 테라피'}</h1>
          <p className="text-lg text-gray-500 font-medium">{isAdminMode ? '프로그램 일정 개설 및 실시간 신청 현황 관리' : '전문 의료진과 함께하는 건강 관리 프로그램을 신청하세요.'}</p>
        </header>

        {isAdminMode && (
          <section className="bg-white p-10 rounded-[2.5rem] shadow-sm mb-16 border border-gray-100 flex flex-col md:flex-row gap-6 items-end animate-in slide-in-from-top-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Location</label>
              <select value={newSession.loc} onChange={e=>setNewSession({...newSession, loc: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-none">
                <option>부천사업소</option><option>서울사업소</option><option>안양사업소</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Date</label>
              <input type="date" value={newSession.date} onChange={e=>setNewSession({...newSession, date: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-none" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-gray-400 mb-2 block uppercase">Capacity</label>
              <input type="number" placeholder="명" value={newSession.capa} onChange={e=>setNewSession({...newSession, capa: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-none" />
            </div>
            <button onClick={createSession} className="bg-[#003366] text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-all">세션 게시</button>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessions.map(s => {
            const isFull = s.applied >= s.capacity;
            return (
              <div key={s.id} className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all border border-gray-50 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <span className="bg-[#003366] text-white px-4 py-1 rounded-full text-[10px] font-black">{s.location}</span>
                    <span className="text-sm font-bold text-gray-300">{s.date}</span>
                  </div>
                  <h4 className="text-xl font-bold mb-10 leading-tight">근골격계 질환 예방 및<br/>전문의 1:1 상담 테라피</h4>
                  <div className="mb-10">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-xs font-bold text-gray-400 uppercase">Applied</span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-black ${isFull ? 'text-[#FF6600]' : 'text-[#003366]'}`}>{s.applied}</span>
                        <span className="text-sm text-gray-300 font-bold">/ {s.capacity}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${isFull ? 'bg-[#FF6600]' : 'bg-[#003366]'}`} style={{ width: `${(s.applied/s.capacity)*100}%` }} />
                    </div>
                  </div>
                </div>
                {isAdminMode ? (
                  <button className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl text-xs font-bold uppercase tracking-widest cursor-default">관리 모드 활성</button>
                ) : (
                  <button onClick={()=>openConfirm(s)} disabled={isFull} className={`w-full py-5 rounded-2xl font-bold text-sm shadow-lg transition-all ${isFull ? 'bg-gray-100 text-gray-300' : 'bg-[#003366] text-white hover:bg-black active:scale-95'}`}>
                    {isFull ? '모집 마감' : '신청하기'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
