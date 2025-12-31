import { InventoryItem, UserStats, Task } from './types';

// সেটিংস (Admin Control)
export const MIN_WITHDRAWAL = 100; // ১০০ টাকা হলে তুলতে পারবে
export const REFERRAL_BONUS = 2.0; // রেফার বোনাস ২ টাকা
export const DAILY_TASK_LIMIT = 15; 

// আপনার Adsterra Smart Link
export const ADSTERRA_LINK = "https://www.effectivegatecpm.com/mprxt25j?key=ae66cb012d5e149cb729bea2aa2e615d";

// ফিক্সড টাস্ক (হাই ইনকাম - আপনার জন্য)
export const FIXED_TASKS: Task[] = [
  {
    id: 'smart-link-1',
    title: 'স্পেশাল বোনাস অফার',
    description: 'লিংকে ক্লিক করে ১ মিনিট অপেক্ষা করুন।',
    reward: 1.00, // ইউজার পাবে ১ টাকা, আপনার ইনকাম বেশি
    energyCost: 10,
    difficulty: 'সহজ',
    type: 'CPA',
    actionLink: ADSTERRA_LINK, 
    answer: 'done'
  }
];

export const SHOP_ITEMS: InventoryItem[] = [
  {
    id: 'energy-drink',
    name: 'এনার্জি প্যাক',
    description: '৫০ এনার্জি রিফিল।',
    price: 15,
    boostType: 'Energy',
    boostValue: 50,
    icon: 'fa-bolt'
  }
];

export const INITIAL_STATS: UserStats = {
  balance: 5.00, // সাইনআপ বোনাস ৫ টাকা
  energy: 50,
  maxEnergy: 100,
  level: 1,
  experience: 0,
  nextLevelExp: 500,
  referralCode: '',
  referralsCount: 0,
  dailyTasksDone: 0
};
