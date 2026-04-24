'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // 위에서 만든 supabase 클라이언트

export default function TherapySystem() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Supabase에서 데이터 불러오기
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    // 실제 Supabase 연결 전 UI 테스트용 더미 데이터 (연결 후 삭제)
    const dummyData = [
      { id: 1, location: "안양사업소", date: "2026-05-20", capacity: 20, applied: 25, status: "추첨 대기" },
      { id: 2, location: "부천사업소", date: "2026-05-15", capacity: 15, applied: 12, status: "모집 중" },
    ];
    
    // 실제 Supabase DB 호출 (주석 해제 후 사용)
    // const { data, error } = await supabase.from('sessions').select('*').order('date', { ascending: true });
    // if (!error) setSessions(data);

    setSessions(dummyData);
    setLoading(false);
  };

  // 관리자 로그인 처리
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

  // UI 컴포넌트: 하이엔드 카드
  const SessionCard = ({ session, isAdmin }) => {
    const isOverflow = session.applied > session.capacity;
    const progress = Math.min(100, (session.applied / session.capacity) * 100);

    return (
      <div className="group relative bg-white/70 backdrop-blur-2xl rounded-3xl p-8 border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1">
        <div className="flex justify-between items-start mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-widest text-[#003366] uppercase mb-2">Location</span>
            <span className="text-2xl font-black text-gray-900 tracking-tight">{session.location}</span>
          </div>
          <span className="text-sm font-semibold text-gray-400 bg-gray-50 px-4 py-1.5 rounded-full">{session.date}</span>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-end mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Applied</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black ${isOverflow ? 'text-[#FF6600]' : 'text-[#003366]'}`}>
                {session.applied}
              </span>
              <span className="text-sm font-semibold text-gray-300">/ {session.capacity}</span>
            </div>
          </div>
          {/* 애플 스타일 프로그레스 바 */}
          <div className="w-full bg-gray-100/80 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isOverflow ? 'bg-[#FF6600]' : 'bg-[#003366]'}`} 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {isAdmin ? (
          isOverflow ? (
            <button className="w-full bg-gradient-to-r from-[#FF6600] to-[#E65C00] text-white py-4 rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/20">
              추첨 알고리즘 실행
            </button>
          ) : (
            <button className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-bold text-sm cursor-not-allowed">
              추첨 대기 중
            </button>
          )
        ) : (
          <button className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${isOverflow ? 'bg-gray-100 text-gray-400' : 'bg-[#003366] text-white shadow-lg shadow-blue-900/20 hover:bg-[#002244]'}`}>
            {isOverflow ? '신청 마감' : '지금 신청하기'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans selection:bg-[#FF6600] selection:text-white">
      {/* 관리자 로그인 모달 (image_0.png 스타일 완벽 반영) */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#003366]/95 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="bg-white p-12 rounded-[2.5rem] w-full max-w-md text-center shadow-2xl">
            <div className="flex justify-center items-center gap-1 mb-8">
              <span className="text-3xl font-black text-[#003366]">GS</span>
              <span className="text-3xl font-black text-[#FF6600]">POWER</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">관리자 인증</h2>
            <p className="text-sm text-gray-500 mb-10">근골격계 테라피 프로그램 관리 시스템에 접속합니다.</p>
            
            <form onSubmit={handleLogin}>
              <input 
                type="password" 
                autoFocus
                placeholder="비밀번호 입력" 
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-100 p-5 rounded-2xl mb-6 text-center text-lg focus:ring-2 focus:ring-[#FF6600] outline-none transition-all"
              />
              <button type="submit" className="w-full bg-[#003366] text-white p-5 rounded-2xl font-bold text-lg hover:bg-[#002244] transition-colors shadow-xl shadow-blue-900/10 mb-4">
                접속하기
              </button>
              <button type="button" onClick={() => setShowLogin(false)} className="text-sm text-gray-400 font-medium hover:text-gray-600">
                취소
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 글로벌 네비게이션 바 */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* GS파워 공식 로고 자리 (이미지 파일명 교체 필요) */}
            <span className="text-xl font-black text-[#003366] tracking-tighter">GS</span>
            <span className="text-xl font-black text-[#FF6600] tracking-tighter">POWER</span>
            <div className="h-4 w-px bg-gray-300 mx-3"></div>
            <span className="text-sm font-semibold text-gray-500">
              {isAdminMode ? '어드민 워크스페이스' : '임직원 테라피 신청'}
            </span>
          </div>
          {isAdminMode ? (
            <button onClick={() => setIsAdminMode(false)} className="text-sm font-bold text-red-500 hover:text-red-600 bg-red-50 px-4 py-2 rounded-full">
              로그아웃
            </button>
          ) : (
            <button onClick={() => setShowLogin(true)} className="text-xs font-bold text-gray-400 hover:text-gray-600">
              관리자 로그인
            </button>
          )}
        </div>
      </nav>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <header className="mb-20">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 text-gray-900 leading-tight">
            {isAdminMode ? '테라피 프로그램 관리' : '당신의 건강을 위한\n테라피 프로그램'}
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
            {isAdminMode 
              ? '안전보건팀의 DX를 완성하는 관리자 대시보드입니다. 공정한 추첨과 일정 관리를 한 곳에서 처리하세요.' 
              : 'GS파워 임직원들의 근골격계 질환 예방 및 관리를 위한 전문 테라피를 지금 신청하세요.'}
          </p>
        </header>

        {/* 세션 카드 그리드 (반응형) */}
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
