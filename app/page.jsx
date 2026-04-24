'use client';
// @ts-nocheck

import { useState, useEffect } from 'react';

export default function TherapySystem() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(true);
  
  // 관리자 신규 개설용 상태(State)
  const [newLoc, setNewLoc] = useState('부천사업소');
  const [newDate, setNewDate] = useState('');
  const [newCapa, setNewCapa] = useState('');

  // 추첨 결과 모달 상태
  const [lotteryResult, setLotteryResult] = useState(null);

  // 세션 데이터 상태
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // 초기 더미 데이터 로드
    setSessions([
      { id: 1, location: "안양사업소", date: "2026-05-20", capacity: 20, applied: 25, status: "추첨 대기" },
      { id: 2, location: "부천사업소", date: "2026-05-15", capacity: 15, applied: 12, status: "모집 중" },
    ]);
    setLoading(false);
  }, []);

  // [기능 1] 관리자 로그인
  const handleLogin = (e) => {
    e.preventDefault();
    if (adminPassword === 'gspower1234') {
      setIsAdminMode(true);
      setShowLogin(false);
      setAdminPassword('');
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  // [기능 2] 임직원 테라피 신청
  const handleApply = (id) => {
    setSessions(sessions.map(s => {
      if (s.id === id) {
        if (s.applied >= s.capacity) {
          alert('이미 정원이 마감되었습니다.');
          return s;
        }
        alert('테라피 신청이 완료되었습니다!');
        return { ...s, applied: s.applied + 1 };
      }
      return s;
    }));
  };

  // [기능 3] 관리자 신규 세션 개설
  const handleCreateSession = () => {
    if (!newDate || !newCapa) {
      alert("실시 일자와 참여 정원을 모두 입력해주세요.");
      return;
    }
    const newSession = {
      id: Date.now(),
      location: newLoc,
      date: newDate,
      capacity: parseInt(newCapa),
      applied: 0,
      status: "모집 중"
    };
    setSessions([newSession, ...sessions]); // 목록 맨 앞에 추가
    setNewDate('');
    setNewCapa('');
    alert('신규 테라피 프로그램이 게시되었습니다!');
  };

  // [기능 4] 관리자 자동 추첨 실행
  const handleRunLottery = (id) => {
    const session = sessions.find(s => s.id === id);
    const penaltyCount = Math.floor(session.applied * 0.3); // 직전 참여자 (가상 데이터)
    const newCount = session.applied - penaltyCount;

    let msg = `<b style="color:#003366; font-size:1.2rem;">${session.location} (${session.date})</b><br><br>`;
    msg += `총 신청: <b>${session.applied}명</b> (정원 ${session.capacity}명)<br>`;
    msg += `직전 참여 제외: <span style="color:#FF6600"><b>${penaltyCount}명</b></span><br>`;
    msg += `1순위 신청자: <b style="color:#003366">${newCount}명</b><br><br>`;
    
    if(newCount >= session.capacity) {
      msg += `=> 공정한 알고리즘에 따라 1순위 대상자 중 무작위로 <b>${session.capacity}명을 선정 완료</b>했습니다.`;
    } else {
      msg += `=> 1순위 신청자 전원 선발 후, 부족한 인원은 직전 참여자 중 <b>추가 추첨</b>하여 채웠습니다.`;
    }

    setLotteryResult(msg);
    setSessions(sessions.map(s => s.id === id ? { ...s, status: "결과 확정" } : s));
  };

  // --- UI 컴포넌트: 하이엔드 카드 ---
  const SessionCard = ({ session, isAdmin }) => {
    const isOverflow = session.applied > session.capacity;
    const isFull = session.applied >= session.capacity;
    const progress = session.capacity === 0 ? 0 : Math.min(100, (session.applied / session.capacity) * 100);

    return (
      <div className={`group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border ${isOverflow && isAdmin ? 'border-[#FF6600]/50' : 'border-gray-100/50'} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between`}>
        <div>
          <div className="flex justify-between items-start mb-6">
            <span className="bg-[#003366] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">{session.location}</span>
            <span className="text-sm font-semibold text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">{session.date}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-8 leading-tight">근골격계 전문의 상담 및<br/>맞춤형 체형 교정</h3>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-3">
              <span className="text-xs font-bold text-gray-400">신청 현황</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black ${isOverflow ? 'text-[#FF6600]' : 'text-[#003366]'}`}>{session.applied}</span>
                <span className="text-sm font-semibold text-gray-400">/ {session.capacity} 명</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ease-out ${isOverflow ? 'bg-[#FF6600]' : 'bg-[#003366]'}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {isAdmin ? (
          session.status === "결과 확정" ? (
             <button className="w-full bg-gray-100 text-gray-400 py-4 rounded-2xl font-bold text-sm cursor-not-allowed">결과 공지 완료</button>
          ) : isOverflow ? (
            <button onClick={() => handleRunLottery(session.id)} className="w-full bg-gradient-to-r from-[#FF6600] to-[#E65C00] text-white py-4 rounded-2xl font-bold text-sm shadow-lg hover:shadow-orange-500/30 transition-all hover:-translate-y-0.5">추첨 알고리즘 실행</button>
          ) : (
            <button className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-bold text-sm cursor-not-allowed border border-gray-200">모집 대기 중</button>
          )
        ) : (
          <button 
            onClick={() => handleApply(session.id)}
            disabled={isFull}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#003366] text-white shadow-lg hover:bg-[#002244] hover:-translate-y-0.5'}`}
          >
            {isFull ? '신청 마감' : '지금 신청하기'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans selection:bg-[#FF6600] selection:text-white">
      
      {/* 1. 관리자 로그인 모달 */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/95 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="bg-white p-10 md:p-12 rounded-[2.5rem] w-full max-w-md text-center shadow-2xl">
            <div className="flex justify-center items-center gap-1 mb-8">
              <span className="text-3xl font-black text-[#003366]">GS</span><span className="text-3xl font-black text-[#FF6600]">POWER</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">관리자 인증</h2>
            <p className="text-sm text-gray-500 mb-10">근골격계 테라피 관리 시스템 접속</p>
            <form onSubmit={handleLogin}>
              <input type="password" autoFocus placeholder="비밀번호 입력" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl mb-6 text-center text-lg focus:ring-2 focus:ring-[#FF6600] outline-none transition-all" />
              <button type="submit" className="w-full bg-[#003366] text-white p-5 rounded-2xl font-bold text-lg hover:bg-[#002244] transition-colors shadow-xl mb-4">접속하기</button>
              <button type="button" onClick={() => setShowLogin(false)} className="text-sm text-gray-400 font-medium hover:text-gray-600">취소</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. 추첨 결과 모달 */}
      {lotteryResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[2rem] w-full max-w-lg shadow-2xl text-center">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-3xl font-black mb-6 text-gray-900 tracking-tight">추첨 완료</h2>
            <div className="bg-gray-50 rounded-2xl p-6 text-left text-gray-700 leading-relaxed mb-8 border border-gray-100" dangerouslySetInnerHTML={{ __html: lotteryResult }}></div>
            <button onClick={() => setLotteryResult(null)} className="w-full bg-gray-900 text-white p-4 rounded-2xl font-bold hover:bg-black transition-colors">확인</button>
          </div>
        </div>
      )}

      {/* 3. 상단 네비게이션 */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-[#003366] tracking-tighter">GS</span><span className="text-xl font-black text-[#FF6600] tracking-tighter">POWER</span>
            <div className="h-4 w-px bg-gray-300 mx-3"></div>
            <span className="text-sm font-semibold text-gray-500">{isAdminMode ? '어드민 워크스페이스' : '임직원 테라피 신청'}</span>
          </div>
          {isAdminMode ? (
            <button onClick={() => setIsAdminMode(false)} className="text-sm font-bold text-red-500 bg-red-50 px-4 py-2 rounded-full hover:bg-red-100 transition-colors">로그아웃</button>
          ) : (
            <button onClick={() => setShowLogin(true)} className="text-xs font-bold text-gray-400 hover:text-gray-600">관리자 로그인</button>
          )}
        </div>
      </nav>

      {/* 4. 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-gray-900">
            {isAdminMode ? '프로그램 관리 시스템' : '당신의 건강을 위한 테라피'}
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            {isAdminMode ? '공정한 추첨과 신규 일정 개설을 한 곳에서 관리하세요.' : 'GS파워 임직원들의 근골격계 질환 예방을 위한 전문 테라피를 신청하세요.'}
          </p>
        </header>

        {/* [관리자 전용] 신규 세션 개설 폼 */}
        {isAdminMode && (
          <div className="bg-white rounded-[2rem] p-8 mb-16 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-end animate-in slide-in-from-bottom-4">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-bold text-gray-700 mb-2">대상 사업소</label>
              <select value={newLoc} onChange={(e) => setNewLoc(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#003366]">
                <option>부천사업소</option><option>서울사업소</option><option>안양사업소</option>
              </select>
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-bold text-gray-700 mb-2">실시 일자</label>
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#003366]" />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-bold text-gray-700 mb-2">참여 정원 (명)</label>
              <input type="number" placeholder="예: 15" value={newCapa} onChange={(e) => setNewCapa(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#003366]" />
            </div>
            <div className="w-full md:w-auto">
              <button onClick={handleCreateSession} className="w-full md:w-auto bg-[#003366] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-[#002244] hover:-translate-y-0.5 transition-all whitespace-nowrap">
                신규 게시
              </button>
            </div>
          </div>
        )}

        {/* 세션 리스트 렌더링 */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#003366] border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sessions.map(session => (
              <SessionCard key={session.id} session={session} isAdmin={isAdminMode} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
