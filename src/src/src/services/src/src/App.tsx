import React, { useState, useEffect, useCallback } from 'react';
import { UserStats, Task, PaymentMethod } from './types';
import { INITIAL_STATS, MIN_WITHDRAWAL, FIXED_TASKS, ADSTERRA_LINK, DAILY_TASK_LIMIT, SHOP_ITEMS } from './constants';
import { generateTasks, verifyTaskAnswer } from './services/geminiService';
import { db } from './firebaseConfig';
import { doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const App: React.FC = () => {
  const [userId] = useState<string>(localStorage.getItem('uid') || `u_${Date.now()}`);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState('dashboard');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [answerInput, setAnswerInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNumber, setWithdrawNumber] = useState('');
  const [msg, setMsg] = useState<{t:string, c:'g'|'r'} | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('uid')) localStorage.setItem('uid', userId);
    const unsub = onSnapshot(doc(db, "users", userId), (d) => {
      if (d.exists()) setStats(d.data() as UserStats);
      else setDoc(doc(db, "users", userId), { ...INITIAL_STATS, referralCode: 'R'+userId.slice(-4) });
    });
    return () => unsub();
  }, [userId]);

  const updateDB = (s: UserStats) => updateDoc(doc(db, "users", userId), { ...s });

  const showMsg = (t: string, c: 'g'|'r') => {
    setMsg({t, c}); setTimeout(() => setMsg(null), 3000);
  };

  const loadTasks = useCallback(async () => {
    if (stats.dailyTasksDone >= DAILY_TASK_LIMIT) return;
    const ai = await generateTasks(stats.level);
    setTasks([...FIXED_TASKS, ...ai]);
  }, [stats.level, stats.dailyTasksDone]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  useEffect(() => {
    const t = setInterval(() => {
      setStats(p => ({...p, energy: Math.min(p.maxEnergy, p.energy + 1)}));
    }, 15000);
    return () => clearInterval(t);
  }, []);

  const submitTask = async () => {
    if (!activeTask) return;
    
    if (activeTask.type === 'CPA') {
       window.open(activeTask.actionLink, '_blank');
       showMsg('যাচাই করা হচ্ছে... ২ সেকেন্ড অপেক্ষা করুন', 'g');
       setTimeout(() => complete(activeTask.reward), 4000);
       return;
    }

    if (stats.energy < activeTask.energyCost) { showMsg('এনার্জি নেই!', 'r'); return; }
    
    const ok = await verifyTaskAnswer(activeTask, answerInput);
    if (ok) complete(activeTask.reward);
    else {
        showMsg('ভুল উত্তর!', 'r');
        const ns = { ...stats, energy: Math.max(0, stats.energy - 5) };
        setStats(ns); updateDB(ns);
    }
  };

  const complete = (r: number) => {
      const ns = {
          ...stats,
          balance: stats.balance + r,
          energy: stats.energy - (activeTask?.energyCost || 0),
          dailyTasksDone: stats.dailyTasksDone + 1,
          experience: stats.experience + 10
      };
      setStats(ns); updateDB(ns);
      showMsg(`৳${r} জমা হয়েছে!`, 'g');
      setActiveTask(null); setAnswerInput('');
      setTasks(p => p.filter(t => t.id !== activeTask?.id));
  };

  const handleWithdraw = async () => {
      const amt = parseFloat(withdrawAmount);
      if (amt < MIN_WITHDRAWAL) { showMsg(`মিনিমাম ৳${MIN_WITHDRAWAL}`, 'r'); return; }
      if (amt > stats.balance) { showMsg('ব্যালেন্স নেই', 'r'); return; }
      
      const ns = { ...stats, balance: stats.balance - amt };
      setStats(ns); await updateDB(ns);
      
      await setDoc(doc(db, "withdrawals", `w_${Date.now()}`), {
          userId, amount: amt, number: withdrawNumber, status: 'pending', date: new Date().toISOString()
      });
      showMsg('উইথড্র রিকোয়েস্ট সফল!', 'g');
      setWithdrawAmount('');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pb-20 font-sans">
      <header className="p-4 bg-slate-800 flex justify-between items-center sticky top-0 z-10 shadow-md">
         <div>
             <div className="text-xs text-slate-400">ব্যালেন্স</div>
             <div className="text-2xl font-bold text-yellow-400">৳{stats.balance.toFixed(2)}</div>
         </div>
         <div className="text-right">
             <div className="text-xs text-slate-400">এনার্জি</div>
             <div className="font-bold text-cyan-400">{stats.energy}/{stats.maxEnergy}</div>
         </div>
      </header>

      {msg && <div className={`fixed top-20 left-10 right-10 p-3 rounded-xl text-center z-50 ${msg.c === 'g' ? 'bg-green-600' : 'bg-red-600'}`}>{msg.t}</div>}

      <main className="p-4 space-y-4">
        {view === 'dashboard' && (
            <div className="grid gap-4">
                <div onClick={() => window.open(ADSTERRA_LINK, '_blank')} className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-2xl cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-2">HOT</div>
                    <h2 className="text-xl font-bold"> বোনাস নিন </h2>
                    <p className="text-sm opacity-80">এখানে ক্লিক করে স্পেশাল অফার দেখুন।</p>
                </div>
                <div onClick={() => setView('tasks')} className="bg-blue-600 p-6 rounded-2xl">
                    <h2 className="text-xl font-bold">টাস্ক পূরণ করুন</h2>
                    <p className="text-sm opacity-80">প্রতিদিন আয় করুন।</p>
                </div>
            </div>
        )}

        {view === 'tasks' && (
            <div className="space-y-3">
                {tasks.map(t => (
                    <div key={t.id} className="bg-slate-800 p-4 rounded-xl flex justify-between items-center border border-slate-700">
                        <div>
                            <div className="font-bold">{t.title}</div>
                            <div className="text-xs text-slate-400">{t.reward} টাকা | {t.energyCost} এনার্জি</div>
                        </div>
                        <button onClick={() => setActiveTask(t)} className="bg-blue-500 px-4 py-2 rounded-lg text-sm">করুন</button>
                    </div>
                ))}
            </div>
        )}

        {view === 'withdraw' && (
            <div className="bg-slate-800 p-6 rounded-2xl space-y-4">
                <h2 className="text-xl font-bold">টাকা উত্তোলন</h2>
                <input type="number" placeholder="টাকার পরিমাণ" value={withdrawAmount} onChange={e=>setWithdrawAmount(e.target.value)} className="w-full bg-slate-900 p-3 rounded-lg outline-none"/>
                <input type="text" placeholder="বিকাশ/নগদ নম্বর" value={withdrawNumber} onChange={e=>setWithdrawNumber(e.target.value)} className="w-full bg-slate-900 p-3 rounded-lg outline-none"/>
                <button onClick={handleWithdraw} className="w-full bg-green-600 py-3 rounded-lg font-bold">সাবমিট</button>
            </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-4">
          {['dashboard', 'tasks', 'withdraw'].map(m => (
              <button key={m} onClick={()=>setView(m)} className={`text-2xl ${view===m?'text-blue-500':'text-slate-600'}`}>
                  <i className={`fa-solid ${m==='dashboard'?'fa-home':m==='tasks'?'fa-list':'fa-wallet'}`}></i>
              </button>
          ))}
      </nav>

      {activeTask && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-sm">
                  <h3 className="text-xl font-bold mb-2">{activeTask.title}</h3>
                  <p className="mb-4 text-slate-300">{activeTask.description}</p>
                  {activeTask.type !== 'CPA' && (
                      <input type="text" placeholder="উত্তর দিন" value={answerInput} onChange={e=>setAnswerInput(e.target.value)} className="w-full bg-slate-900 p-3 rounded-lg mb-4 outline-none"/>
                  )}
                  <div className="flex gap-2">
                      <button onClick={()=>setActiveTask(null)} className="flex-1 bg-red-500 py-2 rounded-lg">বন্ধ করুন</button>
                      <button onClick={submitTask} className="flex-1 bg-green-500 py-2 rounded-lg">{activeTask.type==='CPA'?'লিংক ওপেন':'জমা দিন'}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
