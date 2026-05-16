import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trees, 
  Map as MapIcon, 
  LayoutDashboard, 
  Truck, 
  Settings, 
  LogOut, 
  Bell, 
  Camera, 
  QrCode, 
  Users, 
  PieChart, 
  AlertCircle,
  ChevronRight,
  Droplets,
  Timer,
  ExternalLink,
  Plus,
  ArrowRight,
  Leaf,
  Sprout,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { db, auth } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import MapComponent from './components/MapComponent';
import { User, Tree, Subscription, Delivery, UserRole } from './types';
import { DUMMY_TREES, DUMMY_FARM, DUMMY_USER, DUMMY_SUB, DUMMY_DELIVERY } from './constants';
import { cn } from './lib/utils';

// --- Premium Components ---

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'glass';
  className?: string;
}) => {
  const variants = {
    primary: 'bg-[#1a4d2e] text-white shadow-lg shadow-green-900/10',
    secondary: 'bg-[#e78b39] text-white shadow-lg shadow-orange-900/10',
    glass: 'glass text-[#1a4d2e] font-semibold',
    outline: 'border-2 border-[#1a4d2e] text-[#1a4d2e] bg-transparent'
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        'px-6 py-3 rounded-full font-medium transition-colors duration-300 flex items-center justify-center gap-2',
        variants[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
};

const Card = ({ children, className, onClick, delay = 0 }: { children: React.ReactNode; className?: string; onClick?: () => void; delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={onClick ? { translateY: -4, shadow: '0 20px 40px rgb(0,0,0,0.06)' } : {}}
    onClick={onClick}
    className={cn(
      'bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden transition-shadow duration-300', 
      onClick && 'cursor-pointer',
      className
    )}
  >
    {children}
  </motion.div>
);

const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any; label: string; active?: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      'flex flex-col items-center gap-1.5 transition-all duration-500 relative',
      active ? 'text-[#1a4d2e]' : 'text-gray-300 hover:text-gray-400'
    )}
  >
    <div className={cn(
      "p-2 rounded-2xl transition-all duration-500",
      active && "bg-[#1a4d2e]/10"
    )}>
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span className="text-[10px] font-bold tracking-wider uppercase">{label}</span>
    {active && (
      <motion.div 
        layoutId="activeTab"
        className="absolute -bottom-2 w-1 h-1 bg-[#1a4d2e] rounded-full"
      />
    )}
  </button>
);

// --- Main App ---

type View = 'splash' | 'login' | 'role_select' | 'home' | 'dashboard' | 'map' | 'track' | 'farm' | 'corporate';

export default function App() {
  const [view, setView] = useState<View>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [selectedTree, setSelectedTree] = useState<Tree>(DUMMY_TREES[0]);

  useEffect(() => {
    const timer = setTimeout(() => setView('login'), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser({
        uid: result.user.uid,
        email: result.user.email || '',
        name: result.user.displayName || 'Friend',
        role: 'subscriber'
      });
      setView('home');
    } catch (error) {
      console.error(error);
      handleDemoLogin('subscriber'); // Fallback
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    setUser({ ...DUMMY_USER, role });
    if (role === 'farm_manager') setView('farm');
    else if (role === 'corporate_admin') setView('corporate');
    else setView('home');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setView('login');
  };

  return (
    <div className="max-w-[440px] mx-auto h-screen bg-[#fdfdfb] flex flex-col relative overflow-hidden font-sans selection:bg-green-100">
      <AnimatePresence mode="wait">
        {view === 'splash' && (
          <motion.div 
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col items-center justify-center bg-[#1a4d2e] p-12 text-center"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
               {Array.from({ length: 6 }).map((_, i) => (
                 <motion.div 
                   key={i}
                   animate={{ 
                    y: [0, -20, 0], 
                    rotate: [0, 5, 0],
                    scale: [1, 1.1, 1] 
                   }}
                   transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute"
                   style={{ 
                    top: `${Math.random() * 80}%`, 
                    left: `${Math.random() * 80}%` 
                   }}
                 >
                   <Leaf size={120} className="text-white" />
                 </motion.div>
               ))}
            </div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative z-10"
            >
              <div className="bg-white/10 p-4 rounded-[40px] backdrop-blur-xl mb-6 inline-block">
                <Sprout size={60} className="text-[#a8e063]" />
              </div>
              <h1 className="font-display text-5xl font-bold text-white tracking-tight mb-2">Treekart</h1>
              <div className="h-0.5 w-12 bg-[#a8e063] mx-auto mb-4" />
              <p className="text-green-100/60 font-light tracking-[0.2em] uppercase text-[10px]">Pure Organic Haven</p>
            </motion.div>
          </motion.div>
        )}

        {view === 'login' && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col p-10 bg-[#fdfdfb]"
          >
            <div className="mt-16 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShieldCheck size={32} className="text-[#1a4d2e]" />
              </div>
              <h2 className="font-display text-4xl font-bold text-[#1a4d2e] leading-tight mb-6 italic">Empowering Farms, Delivering Purity.</h2>
              <p className="text-gray-400 text-sm leading-relaxed px-4">Connect with nature by renting your own organic fruit tree in the heart of Rajasthan.</p>
              
              <div className="mt-16 space-y-4">
                <Button 
                  className="w-full py-4 text-sm font-semibold rounded-2xl" 
                  onClick={handleGoogleLogin}
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5 rounded-full" alt="G" />
                  Continue with Google
                </Button>
                
                <div className="flex items-center gap-4 py-8">
                  <div className="h-px bg-gray-100 flex-1"></div>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Internal Portal</span>
                  <div className="h-px bg-gray-100 flex-1"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="text-[11px] rounded-2xl py-3" onClick={() => handleDemoLogin('farm_manager')}>Farm Manager</Button>
                  <Button variant="outline" className="text-[11px] rounded-2xl py-3" onClick={() => handleDemoLogin('corporate_admin')}>Corporate</Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {user && (
          <div className="flex-1 flex flex-col h-full bg-[#fdfdfb] overflow-y-auto pb-32">
            {/* Elegant Header */}
            <header className="px-8 pt-12 pb-6 sticky top-0 bg-[#fdfdfb]/80 backdrop-blur-xl z-30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center border border-green-200/50 overflow-hidden">
                  <span className="font-display text-xl font-bold text-[#1a4d2e]">{user.name[0]}</span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-[#1a4d2e]">Hello, {user.name.split(' ')[0]}</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="bg-white w-10 h-10 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm text-gray-400 relative">
                  <Bell size={18} />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#e78b39] rounded-full border border-white"></span>
                </button>
                <button onClick={handleLogout} className="bg-white w-10 h-10 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm text-gray-400">
                  <LogOut size={18} />
                </button>
              </div>
            </header>

            {/* View Content */}
            <main className="flex-1">
              {view === 'home' && <SubscriberHome user={user} onTreeSelect={(t) => { setSelectedTree(t); setView('dashboard'); }} onTrack={() => setView('track')} />}
              {view === 'dashboard' && <TreeDashboard tree={selectedTree} onBack={() => setView('home')} />}
              {view === 'map' && <FullMapView />}
              {view === 'track' && <DeliveryTrackingView onBack={() => setView('home')} />}
              {view === 'farm' && <FarmManagerHome />}
              {view === 'corporate' && <CorporateAdminHome />}
            </main>

            {/* Premium Floating Navigation */}
            <nav className="fixed bottom-8 left-8 right-8 z-40">
              <div className="glass rounded-[32px] p-4 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
                <NavItem icon={LayoutDashboard} label="Home" active={view === 'home'} onClick={() => setView('home')} />
                <NavItem icon={MapIcon} label="Farm" active={view === 'map'} onClick={() => setView('map')} />
                <button className="bg-[#1a4d2e] w-14 h-14 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-green-900/40 -translate-y-2 active:scale-90 transition-all">
                  <QrCode size={24} />
                </button>
                <NavItem icon={Truck} label="Track" active={view === 'track'} onClick={() => setView('track')} />
                <NavItem icon={Settings} label="Ops" active={false} onClick={() => {}} />
              </div>
            </nav>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Screens ---

function SubscriberHome({ user, onTreeSelect, onTrack }: { user: User; onTreeSelect: (t: Tree) => void; onTrack: () => void }) {
  const myTree = DUMMY_TREES[0];
  
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="px-8 pb-12 space-y-8"
    >
      {/* Featured Location Card */}
      <Card className="!p-0 h-[320px] shadow-2xl relative" delay={0.1}>
        <MapComponent trees={DUMMY_TREES} farm={DUMMY_FARM} userTree={myTree} />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 text-[10px] font-bold text-[#1a4d2e] uppercase tracking-widest flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 bg-[#a8e063] rounded-full animate-pulse" />
            Live Farm Status
          </div>
          <div className="bg-[#1a4d2e]/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-3 shadow-sm">
            <div className="flex items-center gap-1.5 border-r border-white/20 pr-3">
              <LogOut size={12} className="rotate-90 text-[#a8e063]" />
              <span>32°C</span>
            </div>
            <span>Sunny</span>
          </div>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
           <motion.div 
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.5 }}
             className="glass p-5 rounded-[24px] shadow-2xl"
           >
              <div className="flex justify-between items-center text-[#1a4d2e]">
                 <div>
                   <h4 className="font-display font-bold text-lg leading-tight">My {myTree.type.charAt(0).toUpperCase() + myTree.type.slice(1)} Tree</h4>
                   <div className="flex items-center gap-2 mt-1">
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Plot 14 • Kumbhalgarh</p>
                     <span className="w-1 h-1 bg-gray-300 rounded-full" />
                     <p className="text-[10px] text-[#e78b39] font-bold uppercase tracking-widest leading-none">Health: 98%</p>
                   </div>
                 </div>
                 <button onClick={() => onTreeSelect(myTree)} className="bg-[#1a4d2e] p-3 rounded-2xl text-white shadow-lg shadow-green-900/20 active:scale-95 transition-all group overflow-hidden relative">
                    <motion.div 
                      className="absolute inset-0 bg-[#a8e063]/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"
                    />
                    <ArrowRight size={20} className="relative z-10" />
                 </button>
              </div>
           </motion.div>
        </div>
      </Card>

      {/* Statistics Section */}
      <div className="grid grid-cols-2 gap-4">
        <Card delay={0.2} className="flex flex-col gap-4 bg-gradient-to-br from-white to-blue-50/30">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Droplets size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Hydration</p>
            <p className="text-3xl font-bold font-display">42.8%</p>
          </div>
        </Card>
        
        <Card delay={0.3} className="flex flex-col gap-4 bg-gradient-to-br from-white to-orange-50/30" onClick={onTrack}>
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#e78b39] flex items-center justify-center">
            <Truck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Logistics</p>
            <p className="text-3xl font-bold font-display">SHIPPED</p>
          </div>
        </Card>
      </div>

      {/* Harvest Timeline */}
      <Card delay={0.4} className="bg-[#1a4d2e] text-white overflow-visible">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h4 className="font-display text-2xl font-bold italic mb-1">The Growing Season</h4>
              <p className="text-green-100/60 text-xs">Nature is doing its magic</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
              <Calendar size={20} className="text-[#a8e063]" />
            </div>
          </div>
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase">
              <span>Fruiting</span>
              <span className="text-[#a8e063]">Harvest: Oct 12</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
               <motion.div 
                 initial={{ width: 0 }} 
                 whileInView={{ width: '75%' }}
                 viewport={{ once: true }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className="h-full bg-gradient-to-r from-[#a8e063] to-[#56ab2f] rounded-full border border-white/20" 
               />
            </div>
          </div>
      </Card>

      {/* Updates Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-end mb-2">
           <h3 className="font-display text-2xl font-bold italic">Latest Updates</h3>
           <button className="text-[10px] font-bold text-[#1a4d2e] uppercase tracking-widest flex items-center gap-1.5 underline underline-offset-4 decoration-current/30">View All Updates</button>
        </div>
        {[
          { icon: Camera, title: "Morning Tree Profile", time: "2 hours ago", color: "text-[#1a4d2e]", bg: "bg-green-50" },
          { icon: ShieldCheck, title: "Fertility Audit Log", time: "Yesterday", color: "text-[#e78b39]", bg: "bg-orange-50" }
        ].map((item, i) => (
          <motion.button 
            key={i} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + (i * 0.1) }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onTreeSelect(myTree)}
            className="w-full bg-white border border-gray-100/50 p-6 rounded-[28px] flex items-center justify-between group hover:shadow-xl hover:shadow-black/5 transition-all duration-300 transform"
          >
            <div className="flex items-center gap-5">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", item.bg, item.color)}>
                <item.icon size={22} />
              </div>
              <div className="text-left">
                <h5 className="font-bold text-[#1a4d2e] transition-colors group-hover:text-green-700">{item.title}</h5>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">{item.time}</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-[#1a4d2e] group-hover:border-[#1a4d2e]/20 transition-all">
              <ChevronRight size={16} />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function TreeDashboard({ tree, onBack }: { tree: Tree; onBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-8 pb-32 space-y-8">
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#1a4d2e] shadow-sm">
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1a4d2e]">Profile • {tree.id}</span>
        <div className="w-12" />
      </header>

      <div className="relative rounded-[48px] overflow-hidden aspect-[4/5] shadow-2xl border-4 border-white group">
        <img 
          src={tree.lastPhotoUrl} 
          alt="Tree Live" 
          className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        
        {/* Scanning Animation */}
        <motion.div 
          initial={{ top: '0%' }}
          animate={{ top: '100%' }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#a8e063] to-transparent shadow-[0_0_20px_#a8e063] z-10 pointer-events-none opacity-40"
        />

        <div className="absolute top-6 left-6 flex flex-col gap-2">
           <div className="glass px-4 py-2 rounded-full text-[10px] font-bold text-[#1a4d2e] uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#a8e063] rounded-full animate-pulse" /> Live Analysis
           </div>
        </div>

        <div className="absolute top-6 right-6">
           <div className="glass px-4 py-2 rounded-full text-[10px] font-bold text-[#1a4d2e] uppercase tracking-widest flex items-center gap-2">
              <Sprout size={14} className="animate-bounce" /> Verified
           </div>
        </div>
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#a8e063] text-[#1a4d2e] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">PREMIUM</span>
            <span className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">{DUMMY_FARM.name}</span>
          </div>
          <h4 className="font-display text-4xl font-bold italic tracking-tight">{tree.type.charAt(0).toUpperCase() + tree.type.slice(1)} Archive</h4>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <Card delay={0.3} className="bg-green-50/50 border-none">
            <h5 className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-2">Nitrogen Level</h5>
            <p className="text-2xl font-bold font-display italic">Optimal</p>
         </Card>
         <Card delay={0.4} className="bg-orange-50/50 border-none">
            <h5 className="text-[10px] font-bold text-[#cf7b2f] uppercase tracking-widest mb-2">Soil Temp</h5>
            <p className="text-2xl font-bold font-display italic">24.5°C</p>
         </Card>
      </div>

      <div className="space-y-6">
        <h4 className="font-display text-2xl font-bold italic border-b border-gray-100 pb-4">Daily Logs</h4>
        {[
          { icon: Droplets, task: "Automated Drip Feed", detail: "14 Liters Supplied", time: "06:00 AM Today" },
          { icon: Plus, task: "Organic Enrichment", detail: "Micro-Nutrient Mix", time: "Yesterday, 04:30 PM" }
        ].map((log, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + (i * 0.1) }}
            className="flex gap-6 items-start"
          >
             <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#1a4d2e] shrink-0 shadow-sm">
               <log.icon size={20} />
             </div>
             <div>
               <h5 className="font-bold text-[#1a4d2e]">{log.task}</h5>
               <p className="text-sm text-gray-500 mb-1">{log.detail}</p>
               <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{log.time}</span>
             </div>
          </motion.div>
        ))}
      </div>

      <Card delay={0.7} className="bg-gray-50/50 border-dashed border-2 flex flex-col items-center gap-4 text-center p-8">
        <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-inner">
          <ExternalLink size={24} className="text-[#a8e063]" />
        </div>
        <div>
          <h5 className="text-[11px] font-bold text-[#1a4d2e] uppercase tracking-[0.2em] mb-2 leading-none">Blockchain Provenance</h5>
          <p className="font-mono text-[10px] text-gray-400 break-all leading-relaxed px-4 opacity-70 italic whitespace-nowrap overflow-hidden text-ellipsis w-full">0x71C765...3b7E</p>
        </div>
        <p className="text-[10px] text-gray-400 leading-relaxed max-w-[200px]">Each watering and harvest event is cryptographically verified for complete transparency.</p>
      </Card>
    </motion.div>
  );
}

function FullMapView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full px-8 pb-32 flex flex-col space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h3 className="font-display text-4xl font-bold italic leading-none">Farm Scope</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Rajasthan Organic Haven</p>
        </div>
        <div className="glass px-3 py-1.5 rounded-full text-xs font-bold text-[#1a4d2e] border border-[#1a4d2e]/10">142 Trees</div>
      </header>
      
      <Card className="!p-0 flex-1 relative min-h-[400px] group shadow-2xl">
        <MapComponent farm={DUMMY_FARM} trees={DUMMY_TREES} />
        <div className="absolute top-6 left-6 right-6 flex gap-3">
          <button className="flex-1 glass py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.15em] text-[#1a4d2e] hover:bg-white transition-all shadow-xl">Detailed Plan</button>
          <button className="flex-1 glass py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.15em] text-[#1a4d2e] hover:bg-white transition-all shadow-xl">Vital Overlay</button>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
           <div className="bg-[#1a4d2e] p-6 rounded-[28px] text-white flex items-center justify-between shadow-2xl">
              <div>
                 <h5 className="font-display text-xl leading-none italic">Kumbhalgarh #14</h5>
                 <p className="text-white/50 text-[10px] mt-1 uppercase font-bold tracking-widest">Main Production Unit</p>
              </div>
              <Button variant="glass" className="py-2 text-[10px] px-4">Farm Details</Button>
           </div>
        </div>
      </Card>
    </motion.div>
  );
}

function DeliveryTrackingView({ onBack }: { onBack: () => void }) {
  const [delivery, setDelivery] = useState<Delivery>(DUMMY_DELIVERY);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const destination = { lat: 26.75, lng: 74.95 };
    const origin = DUMMY_FARM.location;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 1) return 1;
        const nextProgress = prev + 0.05;
        const currentLat = origin.lat + (destination.lat - origin.lat) * nextProgress;
        const currentLng = origin.lng + (destination.lng - origin.lng) * nextProgress;
        
        let status = delivery.status;
        if (nextProgress > 0.1 && nextProgress < 0.4) status = 'packed';
        if (nextProgress >= 0.4 && nextProgress < 0.9) status = 'shipped';
        if (nextProgress >= 0.9) status = 'delivered';

        setDelivery(d => ({
          ...d,
          status: status as any,
          location: { lat: currentLat, lng: currentLng },
          eta: nextProgress >= 1 ? 'ARRIVED' : `${Math.round((1 - nextProgress) * 30)}M REMAINING`
        }));
        return nextProgress;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const statuses = [
    { key: 'picked', label: 'ORG' },
    { key: 'packed', label: 'PACK' },
    { key: 'shipped', label: 'MOVE' },
    { key: 'delivered', label: 'LUXE' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-8 pb-32 space-y-8">
       <header className="flex items-center gap-6">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#1a4d2e] shadow-sm">
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <h3 className="font-display text-4xl font-bold italic tracking-tight uppercase">Trace Transit</h3>
      </header>

      <Card className="aspect-square !p-0 shadow-2xl relative border-4 border-white">
        <MapComponent 
          farm={DUMMY_FARM} 
          deliveryLocation={delivery.location} 
          destination={{ lat: 26.75, lng: 74.95 }}
        />
         <div className="absolute top-6 left-6">
           <div className="bg-[#e78b39] px-4 py-2 rounded-2xl text-[10px] font-bold text-white uppercase tracking-widest shadow-xl">
              Moving Transit
           </div>
        </div>
      </Card>

      <Card className="bg-[#1a4d2e] text-white !p-8 relative overflow-visible">
          <div className="absolute -top-10 right-8">
            <div className="w-20 h-20 rounded-[32px] border-4 border-white bg-white overflow-hidden shadow-2xl rotate-6">
              <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <div className="mb-10">
            <p className="text-[#a8e063] font-bold text-[10px] uppercase tracking-widest mb-2 italic">Official Carrier</p>
            <h4 className="font-display text-3xl font-bold tracking-tight italic mb-3">{delivery.driverName}</h4>
            <div className="flex gap-4">
              <a href={`tel:${delivery.driverPhone}`} className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl backdrop-blur-md transition-all">
                <Bell size={20} />
              </a>
              <div className="flex-1 glass border-white/10 flex items-center justify-center font-display font-bold italic tracking-wider">
                {delivery.eta}
              </div>
            </div>
          </div>
          
          <div className="space-y-6 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center relative">
               <div className="absolute top-0 bottom-0 left-[11px] w-0.5 bg-white/10" />
               <motion.div 
                 className="absolute top-0 left-[11px] w-0.5 bg-[#a8e063]"
                 animate={{ height: `${progress * 100}%` }}
               />
               
               <div className="space-y-8 w-full">
                  {statuses.map((s, i) => {
                    const isActive = statuses.findIndex(x => x.key === delivery.status) >= i;
                    return (
                      <div key={s.key} className="flex items-center gap-6 relative z-10">
                        <div className={cn(
                          "w-6 h-6 rounded-full border-4 transition-all duration-700 flex items-center justify-center",
                          isActive ? "bg-[#a8e063] border-[#1a4d2e] scale-125" : "bg-green-950 border-green-900"
                        )}>
                          {isActive && <div className="w-1.5 h-1.5 bg-[#1a4d2e] rounded-full" />}
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                          <span className={cn(
                            "text-[10px] font-bold tracking-widest transition-colors duration-500",
                            isActive ? "text-white" : "text-white/20"
                          )}>{s.label === 'ORG' ? 'PICKED FROM SOURCE' : s.label === 'PACK' ? 'SECURELY PACKED' : s.label === 'SHIP' ? 'IN TRANSIT' : 'LUXE DELIVERY COMPLETED'}</span>
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>
          </div>
      </Card>
    </motion.div>
  );
}

function FarmManagerHome() {
  return (
    <div className="px-8 pb-32 space-y-10">
       <Card className="bg-[#1a4d2e] text-white !p-10 relative shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-20"><Sprout size={100} /></div>
        <h4 className="font-display text-5xl font-bold italic tracking-tight mb-4">Operations Hub</h4>
        <p className="text-green-100/60 font-light leading-relaxed mb-8">Welcome, Farm Custodian. You have 14 tree units awaiting health audit logs.</p>
        <div className="flex gap-4">
          <Button variant="glass" className="flex-1 py-4">Quick Audit</Button>
          <Button variant="outline" className="flex-1 !border-white/20 !text-white/80 py-4 font-bold text-[11px] uppercase tracking-widest">Relay Sync</Button>
        </div>
      </Card>

      <div className="space-y-6">
        <div className="flex items-end justify-between">
           <h3 className="font-display text-2xl font-bold italic">Audit Queue</h3>
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">3 Units Priority</span>
        </div>
        {DUMMY_TREES.map((tree, i) => (
          <motion.button 
            key={tree.id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            whileHover={{ scale: 1.01 }}
            className="w-full bg-white p-6 rounded-[32px] flex items-center justify-between group hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 border border-transparent hover:border-green-100"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden relative border border-gray-100">
                 {tree.lastPhotoUrl && <img src={tree.lastPhotoUrl} className="w-full h-full object-cover transition-transform group-hover:scale-125" />}
                 <div className="absolute inset-0 bg-black/5" />
              </div>
              <div className="text-left">
                <h5 className="font-display text-xl font-bold italic tracking-tight">{tree.id.toUpperCase()}</h5>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Status: {tree.status}</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl border border-gray-100 flex items-center justify-center text-[#1a4d2e] group-hover:bg-[#1a4d2e] group-hover:text-white transition-all duration-300">
               <Camera size={20} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function CorporateAdminHome() {
  return (
    <div className="px-8 pb-32 space-y-12">
       <div className="grid grid-cols-2 gap-6">
         <Card className="bg-[#1a4d2e] text-white !p-8 relative">
            <div className="absolute -top-4 -right-4 pointer-events-none opacity-20"><Users size={80} /></div>
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-green-100/50 mb-3 leading-none">Beneficiaries</h5>
            <p className="font-display text-6xl font-bold italic tracking-tight">42</p>
         </Card>
         <Card className="bg-white border-2 border-gray-100 !p-8 shadow-2xl">
            <div className="absolute -top-4 -right-4 pointer-events-none opacity-5 text-[#a8e063]"><Trees size={80} /></div>
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-300 mb-3 leading-none">Asset Units</h5>
            <p className="font-display text-6xl font-bold italic tracking-tight text-[#1a4d2e]">120</p>
         </Card>
       </div>

       <div className="relative">
          <div className="flex justify-between items-end mb-8 pl-4">
             <div>
                <h4 className="font-display text-4xl font-bold italic leading-none">Sustainability Audit</h4>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-2">Fiscal Reporting Q2 2025</p>
             </div>
             <PieChart className="text-[#a8e063]" size={40} />
          </div>
          
          <Card delay={0.2} className="space-y-10 !p-10 bg-gradient-to-br from-white to-[#fdfdfb]/50 shadow-2xl">
             <div>
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Carbon Sequestration</span>
                  <span className="font-display text-3xl font-bold italic text-green-700">8.4 Tons</span>
                </div>
                <div className="h-2 bg-gray-50 rounded-full overflow-hidden p-0.5 ring-1 ring-gray-100">
                   <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: '85%' }}
                     viewport={{ once: true }}
                     transition={{ duration: 1.2, delay: 0.4 }}
                     className="h-full bg-gradient-to-r from-green-300 to-green-600 rounded-full shadow-[0_0_15px_rgba(22,163,74,0.3)]" 
                   />
                </div>
             </div>
             <div>
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Resource Optimization</span>
                  <span className="font-display text-3xl font-bold italic text-blue-700">12.4k L</span>
                </div>
                <div className="h-2 bg-gray-50 rounded-full overflow-hidden p-0.5 ring-1 ring-gray-100">
                   <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: '60%' }}
                     viewport={{ once: true }}
                     transition={{ duration: 1.2, delay: 0.6 }}
                     className="h-full bg-gradient-to-r from-blue-300 to-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                   />
                </div>
             </div>
             <Button variant="primary" className="w-full py-5 text-sm font-semibold mt-4">Download ESG Certificate</Button>
          </Card>
       </div>

       <button className="w-full py-12 border-2 border-dashed border-gray-200 rounded-[40px] flex flex-col items-center gap-4 text-gray-300 hover:border-[#1a4d2e]/30 hover:text-[#1a4d2e] transition-all group">
         <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-green-50 shadow-sm">
            <Plus size={32} />
         </div>
         <span className="font-bold text-xs uppercase tracking-[0.2em]">Bulk Bulk Import Staff Assets</span>
       </button>
    </div>
  );
}
