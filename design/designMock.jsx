import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Settings, 
  LogOut, 
  Coffee, 
  Play, 
  Square, 
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Bell,
  Menu,
  User,
  Edit3,
  X,
  JapaneseYen, // アイコン追加
  TrendingUp   // アイコン追加
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workStatus, setWorkStatus] = useState('offline'); // offline, working, break
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  
  // 設定（モック用）
  const [hourlyWage, setHourlyWage] = useState(3000); // 時給設定

  // 時計の更新
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 時間フォーマット
  const formatTime = (date) => {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
  };

  // 金額フォーマット
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  // モックデータ: 勤怠履歴（副業用にステータスなどを調整）
  const historyData = [
    { date: '11/01 (金)', start: '19:00', end: '22:00', break: '00:00', total: 3.0, status: '稼働' },
    { date: '11/02 (土)', start: '13:00', end: '18:00', break: '00:00', total: 5.0, status: '稼働' },
    { date: '11/05 (火)', start: '20:00', end: '23:30', break: '00:00', total: 3.5, status: '稼働' },
    { date: '11/06 (水)', start: '19:30', end: '21:30', break: '00:00', total: 2.0, status: '稼働' },
    { date: '11/07 (木)', start: '20:00', end: '22:00', break: '00:00', total: 2.0, status: '稼働' },
  ];

  // 今月の合計計算（モック）
  const currentMonthTotalHours = 15.5; // 上記データの合計など
  const currentMonthEarnings = currentMonthTotalHours * hourlyWage;

  // 手動打刻モーダルコンポーネント
  const ManualEntryModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Edit3 size={18} className="text-blue-600" />
            手動打刻入力
          </h3>
          <button 
            onClick={() => setIsManualEntryOpen(false)}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">日付</label>
            <input 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">時刻</label>
              <input 
                type="time" 
                defaultValue="19:00"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">打刻種別</label>
              <select className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white">
                <option>業務開始</option>
                <option>業務終了</option>
                <option>休憩開始</option>
                <option>休憩終了</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">備考（作業内容など）</label>
            <textarea 
              rows="2"
              placeholder="LPデザイン修正、MTGなど"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-none"
            ></textarea>
          </div>
        </div>

        <div className="p-5 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
          <button 
            onClick={() => setIsManualEntryOpen(false)}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            キャンセル
          </button>
          <button 
            onClick={() => {
              setIsManualEntryOpen(false);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md shadow-blue-200 transition-all active:scale-95"
          >
            登録する
          </button>
        </div>
      </div>
    </div>
  );

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors duration-200 ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const Dashboard = () => (
    <div className="space-y-6 animate-fade-in relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 打刻エリア */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock size={120} />
          </div>
          
          <div>
            <h2 className="text-slate-500 font-medium mb-1">現在の時刻</h2>
            <div className="text-4xl md:text-6xl font-bold text-slate-800 tracking-tight font-mono">
              {formatTime(currentTime)}
              <span className="text-xl md:text-2xl text-slate-400 ml-3 font-normal">
                 {currentTime.getSeconds().toString().padStart(2, '0')}
              </span>
            </div>
            <p className="text-slate-400 mt-2">{formatDate(currentTime)}</p>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              {workStatus === 'offline' && (
                <button 
                  onClick={() => setWorkStatus('working')}
                  className="flex-1 min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 flex flex-col items-center justify-center gap-2"
                >
                  <Play size={24} />
                  業務開始
                </button>
              )}

              {workStatus === 'working' && (
                <>
                  <button 
                    onClick={() => setWorkStatus('break')}
                    className="flex-1 min-w-[140px] bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all active:scale-95 flex flex-col items-center justify-center gap-2"
                  >
                    <Coffee size={24} />
                    休憩開始
                  </button>
                  <button 
                    onClick={() => setWorkStatus('offline')}
                    className="flex-1 min-w-[140px] bg-slate-700 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-slate-300 transition-all active:scale-95 flex flex-col items-center justify-center gap-2"
                  >
                    <Square size={24} />
                    業務終了
                  </button>
                </>
              )}

              {workStatus === 'break' && (
                <button 
                  onClick={() => setWorkStatus('working')}
                  className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 transition-all active:scale-95 flex flex-col items-center justify-center gap-2"
                >
                  <Play size={24} />
                  休憩終了
                </button>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsManualEntryOpen(true)}
                className="text-sm text-slate-400 hover:text-blue-600 font-medium flex items-center gap-1.5 transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
              >
                <Edit3 size={14} />
                時間を指定して打刻（修正・後日入力）
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-2">
             <span className={`h-3 w-3 rounded-full ${
               workStatus === 'working' ? 'bg-green-500 animate-pulse' : 
               workStatus === 'break' ? 'bg-orange-400' : 'bg-slate-300'
             }`}></span>
             <span className="text-sm text-slate-500 font-medium">
               ステータス: {
                 workStatus === 'working' ? '稼働中' : 
                 workStatus === 'break' ? '休憩中' : '稼働外'
               }
             </span>
          </div>
        </div>

        {/* 統計カード（業務委託・時給制向けに変更） */}
        <div className="space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full flex flex-col justify-center">
             <h3 className="text-sm font-medium text-slate-500 mb-6 flex items-center gap-2">
               <TrendingUp size={16} />
               今月の実績サマリー
             </h3>
             <div className="space-y-8">
               
               {/* 総稼働時間 */}
               <div>
                 <div className="text-slate-500 text-sm mb-1">総稼働時間</div>
                 <div className="flex items-end gap-2">
                   <span className="text-4xl font-bold text-slate-800 tracking-tight">{currentMonthTotalHours}</span>
                   <span className="text-lg text-slate-400 font-medium mb-1">時間</span>
                 </div>
               </div>

               <div className="h-px bg-slate-100"></div>

               {/* 概算報酬 */}
               <div>
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-slate-500 text-sm">概算報酬額</span>
                   <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">時給 {hourlyWage.toLocaleString()}円</span>
                 </div>
                 <div className="flex items-center gap-2 text-blue-600">
                   <JapaneseYen size={28} />
                   <span className="text-3xl font-bold tracking-tight">
                     {currentMonthEarnings.toLocaleString()}
                   </span>
                 </div>
                 <p className="text-xs text-slate-400 mt-2 text-right">※あくまで概算（税込/抜 未考慮）です</p>
               </div>

             </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">直近の稼働</h3>
          <button 
            onClick={() => setActiveTab('history')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            すべて見る
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">日付</th>
                <th className="px-6 py-3 font-medium">ステータス</th>
                <th className="px-6 py-3 font-medium">開始</th>
                <th className="px-6 py-3 font-medium">終了</th>
                <th className="px-6 py-3 font-medium">実働時間</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyData.slice(0, 3).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{row.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{row.start}</td>
                  <td className="px-6 py-4 text-slate-600">{row.end}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{row.total}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const HistoryView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 animate-fade-in">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="text-blue-600" />
          月次稼働実績
        </h2>
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          <button className="p-2 hover:bg-white rounded-md transition-shadow hover:shadow-sm text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 font-bold text-slate-700">2023年 11月</span>
          <button className="p-2 hover:bg-white rounded-md transition-shadow hover:shadow-sm text-slate-500">
            <ChevronRight size={20} />
          </button>
        </div>
        <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors">
          CSV出力
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">日付</th>
              <th className="px-6 py-4 font-medium">ステータス</th>
              <th className="px-6 py-4 font-medium">開始</th>
              <th className="px-6 py-4 font-medium">終了</th>
              <th className="px-6 py-4 font-medium">休憩</th>
              <th className="px-6 py-4 font-medium">実働時間</th>
              <th className="px-6 py-4 font-medium">備考</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {historyData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{row.date}</td>
                <td className="px-6 py-4">
                   <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                      {row.status}
                    </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{row.start}</td>
                <td className="px-6 py-4 text-slate-600">{row.end}</td>
                <td className="px-6 py-4 text-slate-600">{row.break}</td>
                <td className="px-6 py-4 font-bold text-slate-700">{row.total}h</td>
                <td className="px-6 py-4 text-slate-400 text-xs">
                  {idx === 0 ? '定例MTG参加' : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {isManualEntryOpen && <ManualEntryModal />}

      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Briefcase size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">My<span className="text-blue-600">Kintai</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem id="dashboard" icon={Clock} label="打刻・ホーム" />
          <SidebarItem id="history" icon={Calendar} label="月次実績" />
          <SidebarItem id="settings" icon={Settings} label="設定" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">副業 太郎</p>
              <p className="text-xs text-slate-500 truncate">フリーランス</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8">
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'history' && <HistoryView />}
            {activeTab === 'settings' && (
              <div className="bg-white p-8 rounded-xl border border-slate-100 max-w-lg mx-auto mt-8">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Settings className="text-blue-600" />
                  環境設定
                </h3>
                <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">現在の時給設定 (円)</label>
                     <div className="flex items-center gap-2">
                       <input 
                         type="number" 
                         value={hourlyWage}
                         onChange={(e) => setHourlyWage(Number(e.target.value))}
                         className="flex-1 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                       />
                       <span className="text-slate-500">円 / 時間</span>
                     </div>
                     <p className="text-xs text-slate-400 mt-1">ダッシュボードの概算報酬計算に使用されます。</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;