import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, 
  MapPin, 
  User, 
  Settings, 
  Trees, 
  TrendingUp, 
  QrCode, 
  Clock, 
  Droplets, 
  ChevronRight, 
  LogOut, 
  Shield, 
  Building2, 
  Users, 
  Plus, 
  Camera, 
  Navigation, 
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Smartphone
} from 'lucide-react';
import { auth, db, googleProvider, messaging, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, getDocs, where, onSnapshot } from 'firebase/firestore';
import { getToken, onMessage } from 'firebase/messaging';
import { UserRole, User as AppUser, Tree, Subscription, TreeUpdate } from './types';
import MapComponent from './components/MapComponent';
import { cn } from './lib/utils';

// --- Assets ---
const DUMMY_FARMS = [
  {
    id: 'farm_01',
    name: 'Kumbhalgarh Organic Range',
    description: 'Our primary estate in the heart of Aravallis, specializing in high-yield organic Papayas and Mangoes.',
    location: { lat: 25.1481, lng: 73.5873 },
    boundary: [
      { lat: 25.1500, lng: 73.5850 },
      { lat: 25.1500, lng: 73.5900 },
      { lat: 25.1450, lng: 73.5900 },
      { lat: 25.1450, lng: 73.5850 },
    ]
  },
  {
    id: 'farm_02',
    name: 'Aravalli Valley View',
    description: 'High-altitude organic cultivation with mineral-rich soil, perfect for late-harvest Mangoes.',
    location: { lat: 25.1440, lng: 73.5880 },
    boundary: [
      { lat: 25.1448, lng: 73.5875 },
      { lat: 25.1448, lng: 73.5895 },
      { lat: 25.1430, lng: 73.5895 },
      { lat: 25.1430, lng: 73.5875 },
    ]
  }
];

const DUMMY_TREES: Tree[] = [
  { id: 'tree_101', type: 'Papaya', location: { lat: 25.1485, lng: 73.5870 }, status: 'available', price: 1500, plantedDate: '2025-01-15', growthStage: 45, health: 'Optimal' },
  { id: 'tree_102', type: 'Mango', location: { lat: 25.1480, lng: 73.5875 }, status: 'available', price: 2500, plantedDate: '2024-11-20', growthStage: 60, health: 'Optimal' },
  { id: 'tree_103', type: 'Papaya', location: { lat: 25.1490, lng: 73.5865 }, status: 'rented', price: 1500, plantedDate: '2025-02-10', growthStage: 30, health: 'Warning' },
  { id: 'tree_201', type: 'Mango', location: { lat: 25.1440, lng: 73.5885 }, status: 'available', price: 3000, plantedDate: '2024-10-01', growthStage: 85, health: 'Optimal' },
];

const STAGES = [
  { label: 'Estate Sapling', threshold: 0, icon: Leaf, description: 'Estate sapling positioned in Aravalli soil.' },
  { label: 'First Flowering', threshold: 30, icon: FlowerIcon, description: 'First organic blooms detected by farm mangers.' },
  { label: 'First Fruit', threshold: 50, icon: AppleIcon, description: 'Organic fruit sets are appearing on branches.' },
  { label: 'Maturation', threshold: 75, icon: TrendingUp, description: 'Fruit reaching peak nutrient density.' },
  { label: 'Harvest Ready', threshold: 95, icon: CheckCircle2, description: 'Peak organic ripeness achieved.' },
];

function SeedlingIcon(props: any) { return <Leaf {...props} className={cn(props.className, 'rotate-180')} />; }
function FlowerIcon(props: any) { return <div className={cn(props.className, "w-4 h-4 rounded-full border-2 border-current")} />; }
function AppleIcon(props: any) { return <Leaf {...props} />; }

// --- UI Components ---

const Card = ({ children, className, delay = 0, onClick }: { children: React.ReactNode; className?: string; delay?: number; onClick?: () => void; key?: string | number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    onClick={onClick}
    className={cn("bg-white p-5 rounded-[2rem] organic-shadow border border-white/50", className)}
  >
    {children}
  </motion.div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  disabled
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  disabled?: boolean;
}) => {
  const variants = {
    primary: 'bg-treekart-green text-white shadow-lg shadow-green-900/20',
    secondary: 'bg-harvest-gold text-treekart-green shadow-lg shadow-orange-500/20',
    outline: 'border-2 border-treekart-green text-treekart-green'
  };

  return (
    <motion.button 
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={cn(
        'px-6 py-4 rounded-full font-bold flex items-center justify-center gap-3 transition-all',
        variants[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </motion.button>
  );
};

const Header = ({ title, subtitle, showProfile = true, onProfileClick, notificationCount = 0, onNotificationClick }: { title: string; subtitle?: string; showProfile?: boolean; onProfileClick?: () => void; notificationCount?: number; onNotificationClick?: () => void }) => (
  <header className="flex justify-between items-start px-6 pt-12 pb-8 sticky top-0 bg-sand/80 backdrop-blur-lg z-30">
    <div>
      <h1 className="font-serif text-5xl font-black text-treekart-green leading-none">{title}</h1>
      {subtitle && <p className="text-[10px] font-black text-treekart-green/30 uppercase tracking-[0.2em] mt-2">{subtitle}</p>}
    </div>
    <div className="flex gap-3">
      {showProfile && (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={onNotificationClick}
          className="w-14 h-14 rounded-2xl bg-white organic-shadow border border-white flex items-center justify-center text-treekart-green shrink-0 relative group"
        >
          <div className="absolute inset-0 bg-treekart-green opacity-0 group-hover:opacity-5 transition-opacity" />
          <Settings size={24} strokeWidth={1.5} className={notificationCount > 0 ? "animate-pulse text-harvest-gold" : ""} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-harvest-gold text-treekart-green text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">
              {notificationCount}
            </span>
          )}
        </motion.button>
      )}
      {showProfile && (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={onProfileClick}
          className="w-14 h-14 rounded-2xl bg-white organic-shadow border border-white flex items-center justify-center text-treekart-green shrink-0 overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-treekart-green opacity-0 group-hover:opacity-5 transition-opacity" />
          <User size={28} strokeWidth={1.5} />
        </motion.button>
      )}
    </div>
  </header>
);

const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any; label: string; active?: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 transition-all",
      active ? "text-treekart-green scale-110" : "text-treekart-green/30"
    )}
  >
    <div className={cn(
      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
      active ? "bg-treekart-green text-white shadow-lg" : "bg-transparent"
    )}>
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);

// --- Core App ---

export default function App() {
  const [view, setView] = useState<'splash' | 'login' | 'role_select' | 'home' | 'tree_selector' | 'dashboard' | 'delivery' | 'manager' | 'subscriptions'>('splash');
  const [user, setUser] = useState<AppUser | null>(null);
  const [selectedTree, setSelectedTree] = useState<Tree>(DUMMY_TREES[0]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (view === 'splash') setView('login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [view]);

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.uid !== 'demo_user' && messaging) {
      const setupNotifications = async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const token = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY_IF_NEEDED' });
            if (token) {
              const path = `fcm_tokens/${user.uid}`;
              try {
                await setDoc(doc(db, 'fcm_tokens', user.uid), {
                  token,
                  updatedAt: new Date().toISOString()
                });
              } catch (error) {
                handleFirestoreError(error, OperationType.WRITE, path);
              }
            }
          }
        } catch (error) {
          console.warn('Push registration failed - usually happens in iframe browser:', error);
        }
      };

      setupNotifications();

      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received in foreground: ', payload);
        setNotifications(prev => [{
          id: Date.now(),
          title: payload.notification?.title || 'Notification',
          body: payload.notification?.body || '',
          timestamp: new Date().toLocaleTimeString()
        }, ...prev]);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    // Listen for events that would trigger notifications in a real app
    // For demo purposes, we simulate delivery/health updates via Firestore listeners
    if (user && db) {
      const path = 'system_updates';
      const q = query(collection(db, path), where('recipientId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            setNotifications(prev => [{
              id: change.doc.id,
              ...data,
              timestamp: new Date().toLocaleTimeString()
            }, ...prev]);
          }
        });
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, 'users', result.user.uid);
      const path = `users/${result.user.uid}`;
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }

      if (userSnap?.exists()) {
        setUser(userSnap.data() as AppUser);
        setView('home');
      } else {
        // First time login
        const newUser: AppUser = {
          uid: result.user.uid,
          name: result.user.displayName || 'Guest User',
          email: result.user.email || '',
          role: 'subscriber', // Default role
          photoURL: result.user.photoURL || ''
        };
        try {
          await setDoc(userRef, newUser);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
        }
        setUser(newUser);
        setView('role_select');
      }
    } catch (error: any) {
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        console.warn('Auth popup was closed by the user.');
        return;
      }
      if (error.code === 'auth/cancelled-popup-request') {
        console.warn('Auth popup request was cancelled.');
        return;
      }

      console.error('Auth Error:', error);
      // Fallback for preview if auth isn't configured
      handleDemoLogin('subscriber'); 
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    setUser({
      uid: 'demo_user',
      name: 'Demo Treekart',
      email: 'demo@treekart.in',
      role: role
    });
    setView('home');
  };

  const handleTreeSelect = (tree: Tree) => {
    setSelectedTree(tree);
    if (view !== 'dashboard') setView('dashboard');
  };

  return (
    <div className="mobile-container overflow-hidden">
      <div className="texture-overlay" />
      <AnimatePresence mode="wait">
        {view === 'splash' && <SplashScreen />}
        {view === 'login' && <LoginScreen onLogin={handleGoogleLogin} onDemo={handleDemoLogin} />}
        {view === 'role_select' && <RoleSelectScreen onSelect={(role) => {
          if (user) {
            const updatedUser = { ...user, role };
            const path = `users/${user.uid}`;
            try {
              setDoc(doc(db, 'users', user.uid), updatedUser);
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, path);
            }
            setUser(updatedUser);
            setView('home');
          }
        }} />}
        {view === 'home' && user && <HomeScreen user={user} onNavigate={setView} onTreeSelect={handleTreeSelect} notificationCount={notifications.length} onNotificationClick={() => setView('subscriptions')} />}
        {view === 'tree_selector' && <TreeSelectorScreen onTreeSelect={handleTreeSelect} onBack={() => setView('home')} />}
        {view === 'dashboard' && <TreeDashboard tree={selectedTree} onBack={() => setView('home')} />}
        {view === 'subscriptions' && <SubscriptionsScreen user={user!} onBack={() => setView('home')} onTreeSelect={handleTreeSelect} />}
      </AnimatePresence>
    </div>
  );
}

// --- Helpers ---
const getHealthInfo = (health: Tree['health']) => {
  switch (health) {
    case 'Optimal':
      return { 
        color: 'text-treekart-green', 
        bg: 'bg-sage/20', 
        border: 'border-sage/30',
        advice: 'Tree is thriving with perfect soil balance. Next misting scheduled for 4 PM.'
      };
    case 'Warning':
      return { 
        color: 'text-orange-700', 
        bg: 'bg-harvest-gold/10', 
        border: 'border-harvest-gold/30',
        advice: 'Soil pH slightly high. Our team is applying organic neutralizing mulch today.'
      };
    case 'Critical':
      return { 
        color: 'text-red-700', 
        bg: 'bg-desert-clay/10', 
        border: 'border-desert-clay/30',
        advice: 'Minor infection detected. Emergency organic spray application in progress.'
      };
    default:
      return { 
        color: 'text-treekart-green', 
        bg: 'bg-white/20', 
        border: 'border-white/30',
        advice: 'Health check in progress.'
      };
  }
};


// --- Screens ---

const SplashScreen = () => (
  <motion.div 
    key="splash"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
    className="absolute inset-0 bg-treekart-green flex flex-col items-center justify-center text-white overflow-hidden"
  >
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 0.1, y: 0 }}
      className="absolute top-20 -left-20 text-[20vw] font-serif font-black italic select-none"
    >
      Organic
    </motion.div>
    <motion.div 
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 0.1, y: 0 }}
      className="absolute bottom-20 -right-20 text-[20vw] font-serif font-black italic select-none"
    >
      Rajasthan
    </motion.div>

    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 15, delay: 0.2 }}
      className="relative z-10 flex flex-col items-center"
    >
      <div className="w-24 h-24 bg-harvest-gold rounded-[2.5rem] shadow-2xl mb-8 flex items-center justify-center">
        <Trees size={48} strokeWidth={2.5} className="text-treekart-green" />
      </div>
      <h1 className="font-serif text-6xl font-black italic tracking-tight">Treekart</h1>
      <div className="h-0.5 w-12 bg-harvest-gold/30 mt-4 mb-2" />
      <p className="text-harvest-gold/60 font-bold uppercase tracking-[0.4em] text-[10px]">Harvesting Trust</p>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
      className="absolute bottom-12 flex flex-col items-center gap-2"
    >
      <div className="w-1 h-12 rounded-full bg-gradient-to-b from-harvest-gold/50 to-transparent" />
      <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Rural Collective</span>
    </motion.div>
  </motion.div>
);

const LoginScreen = ({ onLogin, onDemo }: { onLogin: () => void; onDemo: (role: UserRole) => void }) => (
  <motion.div 
    key="login"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    className="absolute inset-0 flex flex-col bg-sand"
  >
    <div className="h-[65%] relative overflow-hidden">
      <motion.img 
        initial={{ scale: 1.2, filter: 'grayscale(0.2)' }}
        animate={{ scale: 1, filter: 'grayscale(0)' }}
        transition={{ duration: 1.5 }}
        src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000" 
        className="w-full h-full object-cover" 
        alt="Rajasthan Farm" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-sand via-sand/0 to-black/20" />
      
      <div className="absolute bottom-16 left-10 right-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
             <div className="w-8 h-px bg-harvest-gold/50" />
             <span className="text-[10px] font-black text-harvest-gold uppercase tracking-[0.4em]">Managed Organic Estates</span>
          </div>
          <h2 className="font-serif text-6xl font-black text-treekart-green leading-[0.85] tracking-tighter">Your Fruit.<br/>Our Roots.</h2>
        </motion.div>
      </div>
    </div>
    
    <div className="flex-1 px-10 pt-4 pb-12 flex flex-col justify-between relative">
      <div className="absolute top-0 left-10 right-10 h-px bg-treekart-green/10" />
      
      <div className="space-y-6">
        <p className="text-treekart-green/50 font-medium leading-relaxed font-serif italic text-lg pr-4">
          Own a piece of the Aravalli range. Track your tree's life journey and receive the pure harvest of Rajasthan.
        </p>
        <Button onClick={onLogin} className="w-full py-6 text-xl rounded-[2rem] gap-4">
          <Smartphone size={24} strokeWidth={1.5} />
          Continue to Farm
        </Button>
      </div>

      <div className="flex flex-col gap-4 mt-8">
        <div className="flex items-center gap-4 px-2">
           <div className="h-px flex-1 bg-treekart-green/10" />
           <p className="text-[8px] font-black text-treekart-green/20 uppercase tracking-[0.3em]">Internal Systems</p>
           <div className="h-px flex-1 bg-treekart-green/10" />
        </div>
        <div className="flex gap-3">
          <button onClick={() => onDemo('farm_manager')} className="flex-1 py-4 glass rounded-2xl text-[9px] font-black text-treekart-green/50 uppercase tracking-widest hover:bg-white transition-all">Manager</button>
          <button onClick={() => onDemo('corporate_admin')} className="flex-1 py-4 glass rounded-2xl text-[9px] font-black text-treekart-green/50 uppercase tracking-widest hover:bg-white transition-all">Corp</button>
          <button onClick={() => onDemo('admin')} className="flex-1 py-4 glass rounded-2xl text-[9px] font-black text-treekart-green/50 uppercase tracking-widest hover:bg-white transition-all">Admin</button>
        </div>
      </div>
    </div>
  </motion.div>
);

const RoleSelectScreen = ({ onSelect }: { onSelect: (role: UserRole) => void }) => (
  <motion.div 
    key="role_select"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="absolute inset-0 bg-sand p-8 flex flex-col justify-center gap-6"
  >
    <div className="mb-8">
      <span className="text-[10px] font-black text-harvest-gold uppercase tracking-[0.3em] mb-2 block">Step 1 of 2</span>
      <h2 className="font-display text-4xl font-black text-treekart-green">WHO ARE YOU?</h2>
      <p className="text-treekart-green/60 mt-2">Select how you'll be using Treekart.</p>
    </div>

    <Card onClick={() => onSelect('subscriber')} delay={0.1} className="flex gap-5 items-center p-6 border-2 border-transparent hover:border-harvest-gold transition-all cursor-pointer group">
      <div className="w-16 h-16 bg-sand rounded-2xl flex items-center justify-center text-treekart-green">
        <Users size={32} />
      </div>
      <div>
        <h4 className="font-display text-xl font-bold text-treekart-green">Subscriber</h4>
        <p className="text-xs text-treekart-green/50 font-medium">Rent a tree for yourself or family</p>
      </div>
      <ChevronRight size={24} className="ml-auto text-treekart-green/20 group-hover:text-harvest-gold" />
    </Card>

    <Card onClick={() => onSelect('corporate_admin')} delay={0.2} className="flex gap-5 items-center p-6 border-2 border-transparent hover:border-harvest-gold transition-all cursor-pointer group">
      <div className="w-16 h-16 bg-sand rounded-2xl flex items-center justify-center text-treekart-green">
        <Building2 size={32} />
      </div>
      <div>
        <h4 className="font-display text-xl font-bold text-treekart-green">Corporate</h4>
        <p className="text-xs text-treekart-green/50 font-medium">Bulk gifting for employees</p>
      </div>
      <ChevronRight size={24} className="ml-auto text-treekart-green/20 group-hover:text-harvest-gold" />
    </Card>

    <Card onClick={() => onSelect('farm_manager')} delay={0.3} className="flex gap-5 items-center p-6 border-2 border-transparent hover:border-harvest-gold transition-all cursor-pointer group">
      <div className="w-16 h-16 bg-sand rounded-2xl flex items-center justify-center text-treekart-green">
        <Shield size={32} />
      </div>
      <div>
        <h4 className="font-display text-xl font-bold text-treekart-green">Internal Team</h4>
        <p className="text-xs text-treekart-green/50 font-medium">Operations & farm management</p>
      </div>
      <ChevronRight size={24} className="ml-auto text-treekart-green/20 group-hover:text-harvest-gold" />
    </Card>
  </motion.div>
);

const HomeScreen = ({ user, onNavigate, onTreeSelect, notificationCount, onNotificationClick }: { user: AppUser; onNavigate: (v: any) => void; onTreeSelect: (t: Tree) => void; notificationCount: number; onNotificationClick: () => void }) => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <motion.div 
      key="home"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-screen overflow-y-auto pb-24"
    >
      <Header 
        title="TREES" 
        subtitle={`Namaste, ${user.name.split(' ')[0]}`} 
        notificationCount={notificationCount}
        onNotificationClick={onNotificationClick}
      />
      
      <div className="px-6 space-y-10">
        <SubscriberHome onNavigate={onNavigate} onTreeSelect={onTreeSelect} />
      </div>

      {/* Navigation */}
      <div className="fixed bottom-8 left-6 right-6 h-20 glass rounded-[2.5rem] organic-shadow border border-white flex justify-around items-center px-4 z-50">
        <NavItem icon={Trees} label="Assets" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavItem icon={Navigation} label="Map" active={activeTab === 'map'} onClick={() => { setActiveTab('map'); onNavigate('tree_selector'); }} />
        <NavItem icon={QrCode} label="Scan" active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} />
        <NavItem icon={Settings} label="Ops" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>
    </motion.div>
  );
};

const SubscriberHome = ({ onNavigate, onTreeSelect }: { onNavigate: (v: any) => void; onTreeSelect: (t: Tree) => void }) => {
  const myTree = DUMMY_TREES[2]; // Simulating a rented tree

  return (
    <div className="space-y-12">
      {/* Featured Asset Card */}
      <div className="relative group">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-treekart-green text-white overflow-hidden rounded-[3rem] h-[340px] relative organic-shadow"
        >
          <img 
            src="https://images.unsplash.com/photo-1596701062351-be5f6a200a45?auto=format&fit=crop&q=80&w=800" 
            className="w-full h-full object-cover opacity-40 contrast-125 scale-110 group-hover:scale-100 transition-transform duration-700" 
            alt="My Tree" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-treekart-green via-treekart-green/40 to-transparent" />
          
          <div className="absolute top-8 left-8 flex flex-col">
            <div className="flex justify-between items-center w-[calc(100vw-88px)] max-w-[340px]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-harvest-gold animate-pulse" />
                <span className="text-[10px] font-black text-harvest-gold uppercase tracking-[0.3em]">Managed Asset</span>
              </div>
              <button 
                onClick={() => onNavigate('subscriptions')} 
                className="text-[8px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 transition-all"
              >
                Portfolio
              </button>
            </div>
            <h3 className="font-serif text-5xl font-black italic mt-4 text-white leading-tight">Amrapali<br/>#304</h3>
          </div>

          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <TrendingUp size={20} className="text-harvest-gold" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Maturity</p>
                    <p className="text-xl font-serif font-black text-harvest-gold">65%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <Shield size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Vitality</p>
                    <p className={cn("text-xl font-serif font-black italic", myTree.health === 'Optimal' ? 'text-white' : myTree.health === 'Warning' ? 'text-harvest-gold' : 'text-red-400')}>
                      {myTree.health}
                    </p>
                  </div>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: -45 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTreeSelect(myTree)} 
                className="w-16 h-16 rounded-[2rem] bg-harvest-gold text-treekart-green flex items-center justify-center shadow-xl shadow-orange-950/20 active:scale-95 transition-all"
              >
                <ArrowRight size={28} />
              </motion.button>
            </div>
          </div>
        </motion.div>
        
        {/* Subtle decorative elements */}
        <div className="absolute -bottom-4 -right-2 w-24 h-24 bg-sage/10 rounded-full blur-2xl -z-10" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col gap-6 p-7 border-none bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <Droplets size={48} className="text-treekart-green" />
          </div>
          <div className="w-10 h-10 bg-sage rounded-xl flex items-center justify-center text-treekart-green">
            <Droplets size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-treekart-green/30 uppercase tracking-[0.2em] mb-1">Moisture</p>
            <p className="text-3xl font-serif font-black text-treekart-green italic">24.5<span className="text-base font-bold opacity-30 not-italic ml-1">%</span></p>
          </div>
        </Card>
        <Card className="flex flex-col gap-6 p-7 border-none bg-harvest-gold relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={48} className="text-treekart-green" />
          </div>
          <div className="w-10 h-10 bg-white/30 rounded-xl flex items-center justify-center text-treekart-green">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-treekart-green/60 uppercase tracking-[0.2em] mb-1">Harvest</p>
            <p className="text-3xl font-serif font-black text-treekart-green italic">42<span className="text-base font-bold opacity-30 not-italic ml-1">Days</span></p>
          </div>
        </Card>
      </div>

      <div className="space-y-8 pb-10">
        <div className="flex justify-between items-baseline">
          <h3 className="font-serif text-3xl font-black italic text-treekart-green">Daily Log</h3>
          <button className="text-[10px] font-black text-harvest-gold uppercase tracking-[0.2em] border-b border-harvest-gold/20 pb-0.5">Explore Feed</button>
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="w-20 h-20 rounded-[2rem] bg-white organic-shadow border border-white p-1 shrink-0 group overflow-hidden">
                <img 
                  src={`https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=200&sig=${i}`} 
                  className="w-full h-full object-cover rounded-[1.8rem] group-hover:scale-110 transition-transform duration-500" 
                  alt="Update" 
                />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black text-treekart-green/30 uppercase tracking-widest">Village Pali</span>
                  <div className="w-1 h-1 rounded-full bg-treekart-green/10" />
                  <span className="text-[9px] font-black text-harvest-gold uppercase tracking-widest">Live</span>
                </div>
                <p className="font-bold text-treekart-green leading-tight">Soil moisture optimized. Mist irrigation cycle complete.</p>
                <p className="text-[10px] font-black text-treekart-green/20 uppercase tracking-widest mt-2">{i}h ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ManagerHome = ({ onNavigate }: { onNavigate: (v: any) => void }) => (
  <div className="space-y-6">
    <Card className="bg-treekart-green text-white p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-display text-3xl font-black italic">MANAGER PANEL</h3>
          <p className="text-[10px] font-bold text-harvest-gold uppercase tracking-widest mt-1">Village: District Pali</p>
        </div>
        <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center">
          <Plus size={24} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-display font-black">42</span>
          <span className="text-[8px] font-bold opacity-50 uppercase tracking-widest">Total</span>
        </div>
        <div className="flex flex-col items-center border-x border-white/10">
          <span className="text-2xl font-display font-black text-harvest-gold">12</span>
          <span className="text-[8px] font-bold opacity-50 uppercase tracking-widest">Available</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-display font-black">30</span>
          <span className="text-[8px] font-bold opacity-50 uppercase tracking-widest">Rented</span>
        </div>
      </div>
    </Card>

    <div className="grid grid-cols-2 gap-4">
      <Button className="h-32 flex-col !rounded-[2rem] gap-2">
        <Camera size={32} />
        <span className="text-[10px]">Log Update</span>
      </Button>
      <Button variant="secondary" className="h-32 flex-col !rounded-[2rem] gap-2">
        <MapPin size={32} />
        <span className="text-[10px]">Tree Scan</span>
      </Button>
    </div>
  </div>
);

const CorporateHome = ({ onNavigate }: { onNavigate: (v: any) => void }) => (
  <div className="space-y-8">
    <Card className="p-8">
      <Building2 className="text-desert-clay mb-4" size={32} />
      <h3 className="font-display text-2xl font-black text-treekart-green">Google Cloud Ops</h3>
      <p className="text-xs font-bold text-treekart-green/40 uppercase tracking-widest mt-1">B2B Dashboard</p>
      
      <div className="mt-8 flex items-baseline gap-2">
        <span className="text-5xl font-display font-black text-treekart-green">50</span>
        <span className="text-sm font-bold opacity-40 uppercase">Trees Gifted</span>
      </div>
    </Card>
    
    <div className="flex gap-4 items-center glass p-5 rounded-[2rem] border-white cursor-pointer hover:bg-white transition-all">
      <div className="w-12 h-12 bg-harvest-gold rounded-2xl flex items-center justify-center text-treekart-green">
        <Users size={24} />
      </div>
      <div>
        <h4 className="font-bold text-treekart-green">Manage Employees</h4>
        <p className="text-[10px] text-treekart-green/40 uppercase font-black">48 Assigned • 2 Pending</p>
      </div>
      <ArrowRight size={20} className="ml-auto text-treekart-green/30" />
    </div>
  </div>
);

const TreeSelectorScreen = ({ onTreeSelect, onBack }: { onTreeSelect: (t: Tree) => void; onBack: () => void }) => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'Papaya' | 'Mango'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'rented'>('all');
  const [viewType, setViewType] = useState<'map' | 'list'>('map');
  const [selectedFarm, setSelectedFarm] = useState<any | null>(null);

  const filteredTrees = DUMMY_TREES.filter(t => 
    (typeFilter === 'all' || t.type === typeFilter) &&
    (statusFilter === 'all' || t.status === statusFilter)
  );

  const farmTrees = selectedFarm ? DUMMY_TREES.filter(t => {
     const dist = Math.sqrt(Math.pow(t.location.lat - selectedFarm.location.lat, 2) + Math.pow(t.location.lng - selectedFarm.location.lng, 2));
     return dist < 0.003; 
  }) : [];

  return (
    <motion.div 
      key="tree_selector"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 bg-sand flex flex-col"
    >
      <div className="px-6 pt-12 pb-6 flex justify-between items-center z-10 sticky top-0 bg-sand/80 backdrop-blur-xl border-b border-treekart-green/5">
        <button onClick={onBack} className="w-14 h-14 glass rounded-[1.5rem] flex items-center justify-center text-treekart-green border-white">
          <ArrowRight size={24} className="rotate-180" />
        </button>
        <div className="flex bg-white/50 p-1.5 rounded-[1.5rem] organic-shadow border border-white">
          <button 
            onClick={() => setViewType('map')}
            className={cn("px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all", viewType === 'map' ? "bg-treekart-green text-white shadow-lg" : "text-treekart-green/40")}
          >Map View</button>
          <button 
            onClick={() => setViewType('list')}
            className={cn("px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all", viewType === 'list' ? "bg-treekart-green text-white shadow-lg" : "text-treekart-green/40")}
          >Grid</button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="px-6 pb-6 pt-4 overflow-x-auto flex gap-4 no-scrollbar z-10 bg-sand/80 backdrop-blur-xl shrink-0">
        <div className="flex gap-2 pr-6 border-r border-treekart-green/10">
          {(['all', 'Papaya', 'Mango'] as const).map(t => (
            <button 
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                typeFilter === t ? "bg-harvest-gold text-treekart-green shadow-md" : "bg-white/40 text-treekart-green/40 border border-white"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2 pl-2">
          {(['all', 'available', 'rented'] as const).map(s => (
            <button 
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                statusFilter === s ? "bg-treekart-green text-white shadow-md" : "bg-white/40 text-treekart-green/40 border border-white"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {viewType === 'map' ? (
          <MapComponent 
            trees={filteredTrees} 
            farms={DUMMY_FARMS} 
            onTreeClick={onTreeSelect} 
            onFarmClick={setSelectedFarm}
            selectedFarmId={selectedFarm?.id}
          />
        ) : (
          <div className="px-6 space-y-6 pb-32 h-full overflow-y-auto">
            {filteredTrees.map(tree => (
              <Card key={tree.id} onClick={() => onTreeSelect(tree)} className="flex items-center gap-6 p-7 border-none bg-white hover:bg-white/80 transition-all">
                 <div className={cn("w-18 h-18 rounded-[2rem] flex items-center justify-center text-treekart-green organic-shadow border border-white/50", tree.type === 'Mango' ? 'bg-orange-50' : 'bg-green-50')}>
                    <Trees size={32} strokeWidth={1.5} />
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h5 className="font-serif text-2xl font-black text-treekart-green tracking-tight">{tree.type} <span className="text-treekart-green/30 italic text-sm">#{tree.id.split('_')[1]}</span></h5>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={cn(
                         "text-[7px] px-2.5 py-1 rounded-full font-black uppercase tracking-[0.2em] shadow-sm",
                         tree.status === 'available' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                       )}>
                         {tree.status}
                       </span>
                       <p className={cn("text-[9px] font-black uppercase tracking-[0.1em]", getHealthInfo(tree.health).color)}>{tree.health} Vitality</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="font-serif text-2xl font-black text-treekart-green italic leading-none">₹{tree.price}</p>
                    <p className="text-[8px] font-black text-harvest-gold uppercase tracking-[0.2em] mt-1">/ season</p>
                 </div>
              </Card>
            ))}
            {filteredTrees.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center opacity-20">
                <Search size={64} strokeWidth={1} className="mb-6" />
                <p className="font-serif text-3xl font-black italic">Nothing found</p>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black mt-2">Adjust your estate filters</p>
              </div>
            )}
          </div>
        )}

        {/* Farm Detail Overlay */}
        <AnimatePresence>
          {selectedFarm && viewType === 'map' && (
            <motion.div 
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 p-6 z-20 pointer-events-none"
            >
              <div className="bg-white rounded-[2.5rem] organic-shadow border border-white p-8 pointer-events-auto max-h-[50vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-harvest-gold" />
                       <span className="text-[10px] font-black text-harvest-gold uppercase tracking-[0.3em]">Estate Site</span>
                    </div>
                    <h3 className="font-serif text-3xl font-black text-treekart-green leading-none">{selectedFarm.name}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedFarm(null)}
                    className="w-10 h-10 bg-sand rounded-xl flex items-center justify-center text-treekart-green/40"
                  >
                    <Plus className="rotate-45" size={20} />
                  </button>
                </div>

                <p className="text-xs font-medium text-treekart-green/60 mb-8 leading-relaxed italic">
                  {selectedFarm.description}
                </p>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-treekart-green/30 uppercase tracking-[0.2em]">Trees in this sector ({farmTrees.length})</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {farmTrees.map(tree => (
                      <div 
                        key={tree.id} 
                        onClick={() => onTreeSelect(tree)}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-sand/30 border border-white cursor-pointer hover:bg-sand/50 transition-all"
                      >
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", tree.type === 'Mango' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600')}>
                          <Leaf size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-treekart-green italic">{tree.type} #{tree.id.split('_')[1]}</p>
                          <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-harvest-gold" />
                            <p className="text-[8px] font-black text-treekart-green/40 uppercase tracking-widest">{tree.health} Vitality</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-serif font-black text-treekart-green">₹{tree.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Search (only show if no farm selected or hide it) */}
        {!selectedFarm && (
          <div className="absolute bottom-10 left-6 right-6 flex gap-4 pointer-events-none">
            <div className="flex-1 h-18 glass rounded-[2rem] organic-shadow border border-white flex items-center px-8 gap-4 pointer-events-auto backdrop-blur-2xl">
              <Search size={22} className="text-treekart-green/20" />
              <input type="text" placeholder="Locate plot..." className="bg-transparent border-none outline-none text-base font-bold text-treekart-green placeholder:text-treekart-green/20 w-full" />
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="w-18 h-18 bg-harvest-gold rounded-[2rem] organic-shadow flex items-center justify-center text-treekart-green shadow-xl pointer-events-auto"
            >
              <RefreshCw size={26} onClick={() => {setTypeFilter('all'); setStatusFilter('all');}} />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const MilestoneTimeline = ({ growthStage }: { growthStage: number }) => (
  <Card className="p-8 border-none bg-white organic-shadow">
    <div className="flex justify-between items-baseline mb-8">
      <h3 className="font-serif text-2xl font-black italic text-treekart-green">Life Journey</h3>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-harvest-gold animate-pulse" />
        <span className="text-[10px] font-black text-treekart-green/40 uppercase tracking-widest">{growthStage}% Maturity</span>
      </div>
    </div>
    
    <div className="space-y-10 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-sand">
      {STAGES.map((s, i) => {
        const isCompleted = growthStage >= s.threshold;
        const isNext = !isCompleted && (i === 0 || growthStage >= STAGES[i-1].threshold);
        
        return (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -10 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "flex gap-6 items-start relative z-10 transition-all",
              !isCompleted && !isNext ? "opacity-20 grayscale" : "opacity-100"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-[1.2rem] flex items-center justify-center border-2 transition-all duration-500 organic-shadow",
              isCompleted ? "bg-treekart-green border-treekart-green text-white" : 
              isNext ? "bg-white border-harvest-gold text-harvest-gold scale-110 shadow-xl shadow-orange-500/20" : 
              "bg-sand border-white text-treekart-green/30"
            )}>
              <s.icon size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2">
                <h4 className={cn(
                  "font-black text-[11px] uppercase tracking-widest", 
                  isCompleted ? "text-treekart-green" : isNext ? "text-harvest-gold" : "text-treekart-green/20"
                )}>
                  {s.label}
                </h4>
                {isCompleted && <CheckCircle2 size={12} className="text-harvest-gold" />}
              </div>
              { (isCompleted || isNext) && (
                <p className="text-[10px] font-medium text-treekart-green/50 mt-1 leading-relaxed pr-6">{s.description}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  </Card>
);

const TreeDashboard = ({ tree, onBack }: { tree: Tree; onBack: () => void }) => {
  const [subModel, setSubModel] = useState<'individual' | 'shared' | 'b2b'>('individual');
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRent = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setShowConfirm(false);
    onBack();
    // In a real app, we would update Firestore here
  };

  return (
    <motion.div 
      key="tree_dashboard"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="absolute inset-0 bg-sand flex flex-col z-[100] h-screen overflow-y-auto"
    >
      <div className="h-[45vh] relative overflow-hidden">
        <motion.img 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
          src={tree.type === 'Mango' 
            ? "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000" 
            : "https://images.unsplash.com/photo-1596701062351-be5f6a200a45?auto=format&fit=crop&q=80&w=800"} 
          className="w-full h-full object-cover" 
          alt={tree.type} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sand via-transparent to-black/30" />
        
        <div className="absolute top-12 left-6 right-6 flex justify-between">
          <button onClick={onBack} className="w-14 h-14 glass rounded-[1.5rem] flex items-center justify-center text-white border-white/30 backdrop-blur-xl">
            <ArrowRight size={24} className="rotate-180" />
          </button>
          <button className="w-14 h-14 glass rounded-[1.5rem] flex items-center justify-center text-white border-white/30 backdrop-blur-xl">
            <RefreshCw size={24} />
          </button>
        </div>
        
        <div className="absolute bottom-10 left-8 right-8">
           <div className="flex items-center gap-3 mb-4">
             <div className="px-4 py-1.5 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 text-[10px] font-black text-white uppercase tracking-[0.2em]">{tree.type} Collective</div>
             <div className="w-2 h-2 rounded-full bg-harvest-gold animate-pulse shadow-[0_0_10px_#FFB302]" />
           </div>
           <h2 className="font-serif text-6xl font-black text-white leading-none tracking-tight">{tree.id.split('_')[1]}</h2>
           <p className="font-serif text-xl font-bold text-harvest-gold/80 italic mt-2">Certified Organic Asset</p>
        </div>
      </div>

      <div className="px-8 pt-10 space-y-12 pb-32">
        <MilestoneTimeline growthStage={tree.growthStage} />

        <div className="grid grid-cols-2 gap-4">
          <Card className="flex flex-col gap-6 p-8 border-none relative overflow-hidden group">
            <div className="w-12 h-12 bg-harvest-gold rounded-2xl flex items-center justify-center text-treekart-green shadow-lg shadow-orange-900/10">
               <Droplets size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-treekart-green/30 uppercase tracking-[0.2em] mb-1">Ecosystem</p>
               <p className="text-3xl font-serif font-black text-treekart-green italic leading-none">Optimal</p>
            </div>
          </Card>
          <Card className={cn("flex flex-col gap-6 p-8 border-none relative overflow-hidden group transition-colors", getHealthInfo(tree.health).bg)}>
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-green-950/20", tree.health === 'Optimal' ? 'bg-treekart-green text-white' : tree.health === 'Warning' ? 'bg-harvest-gold text-treekart-green' : 'bg-desert-clay text-white')}>
               <TrendingUp size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-treekart-green/30 uppercase tracking-[0.2em] mb-1">Vitality</p>
               <p className={cn("text-3xl font-serif font-black italic leading-none", getHealthInfo(tree.health).color)}>{tree.health}</p>
            </div>
          </Card>
        </div>

        <Card className={cn("p-8 border-none relative overflow-hidden", getHealthInfo(tree.health).bg, "border-l-4", tree.health === 'Optimal' ? 'border-sage' : tree.health === 'Warning' ? 'border-harvest-gold' : 'border-desert-clay')}>
          <div className="flex gap-4 items-start">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", tree.health === 'Optimal' ? 'bg-sage/20 text-treekart-green' : tree.health === 'Warning' ? 'bg-harvest-gold/20 text-orange-700' : 'bg-desert-clay/20 text-red-700')}>
              <Shield size={20} />
            </div>
            <div>
              <h4 className={cn("font-serif text-xl font-black italic", getHealthInfo(tree.health).color)}>Advisor's Note</h4>
              <p className="text-xs font-medium text-treekart-green/70 mt-2 leading-relaxed">
                {getHealthInfo(tree.health).advice}
              </p>
            </div>
          </div>
        </Card>

        {tree.status === 'available' && (
          <div className="space-y-6 pt-4">
             <div className="space-y-3">
               <p className="text-[10px] font-black text-treekart-green/30 uppercase tracking-widest">Subscription Model</p>
               <div className="flex gap-2">
                 {(['individual', 'shared', 'b2b'] as const).map(m => (
                    <button 
                      key={m} 
                      onClick={() => setSubModel(m)}
                      className={cn("flex-1 py-3 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest", subModel === m ? "border-treekart-green bg-treekart-green text-white shadow-lg" : "border-treekart-green/5 text-treekart-green/40 hover:border-treekart-green/10")}
                    >{m}</button>
                 ))}
               </div>
             </div>
             
             <div className="flex items-center justify-between p-6 glass rounded-[2.5rem] border-white">
                <div>
                   <p className="text-[10px] font-black text-treekart-green/30 uppercase tracking-widest">Yearly Rent</p>
                   <p className="text-3xl font-display font-black text-treekart-green">₹{subModel === 'shared' ? tree.price / 2 : tree.price}</p>
                </div>
                <Button className="!px-8 h-18" onClick={() => setShowConfirm(true)}>Rent Tree</Button>
             </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => !isProcessing && setShowConfirm(false)}
              className="absolute inset-0 bg-treekart-green/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-sand w-full max-w-sm rounded-[3rem] organic-shadow border border-white p-8 relative z-10"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-harvest-gold/10 rounded-[2rem] flex items-center justify-center text-harvest-gold mx-auto mb-4">
                  <Trees size={40} />
                </div>
                <h3 className="font-display text-2xl font-black text-treekart-green">CONFIRM RENTAL</h3>
                <p className="text-xs text-treekart-green/50 font-bold uppercase tracking-widest mt-2">{tree.type} #{tree.id.split('_')[1]}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-white">
                  <span className="text-[10px] font-black text-treekart-green/30 uppercase tracking-widest">Model</span>
                  <span className="font-bold text-treekart-green uppercase">{subModel}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-white">
                  <span className="text-[10px] font-black text-treekart-green/30 uppercase tracking-widest">Total Cost</span>
                  <div className="text-right">
                    <span className="text-2xl font-display font-black text-treekart-green">₹{subModel === 'shared' ? tree.price / 2 : tree.price}</span>
                    <p className="text-[8px] font-black text-harvest-gold uppercase tracking-widest mt-[-2px]">Per Year</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConfirm(false)}
                  disabled={isProcessing}
                  className="flex-1 py-4 text-[10px] font-black text-treekart-green/40 uppercase tracking-widest"
                >Cancel</button>
                <Button 
                  onClick={handleRent}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" size={20} /> : 'Confirm'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SubscriptionsScreen = ({ user, onBack, onTreeSelect }: { user: AppUser; onBack: () => void; onTreeSelect: (t: Tree) => void }) => {
  const activeSubs: Subscription[] = [
    { id: 'sub_01', treeId: 'tree_101', type: 'individual', startDate: '2025-01-15', amount: 1500, paymentStatus: 'paid' },
    { id: 'sub_02', treeId: 'tree_103', type: 'shared', startDate: '2025-02-10', amount: 750, coOwnerEmail: 'partner@example.com', paymentStatus: 'paid' },
  ];

  const historySubs: Subscription[] = [
    { id: 'sub_old', treeId: 'tree_prev', type: 'individual', startDate: '2024-01-15', amount: 1200, paymentStatus: 'paid' },
  ];

  return (
    <motion.div 
      key="subscriptions"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="absolute inset-0 bg-sand flex flex-col h-screen overflow-y-auto"
    >
      <div className="px-6 pt-12 pb-6 flex items-center gap-6 sticky top-0 bg-sand/80 backdrop-blur-lg z-10 transition-all">
        <button onClick={onBack} className="w-14 h-14 glass rounded-[1.5rem] flex items-center justify-center text-treekart-green border-white">
          <ArrowRight size={24} className="rotate-180" />
        </button>
        <div>
          <h2 className="font-serif text-4xl font-black text-treekart-green leading-none tracking-tight">Portfolio</h2>
          <p className="text-[9px] font-black text-treekart-green/30 uppercase tracking-[0.2em] mt-1">Estate Asset Management</p>
        </div>
      </div>

      <div className="px-6 space-y-12 pb-32">
        {/* Active Subscriptions */}
        <section className="space-y-8">
          <div className="flex justify-between items-baseline">
            <h3 className="font-serif text-2xl font-black italic text-treekart-green">Current Assets</h3>
            <span className="text-[10px] font-black text-harvest-gold uppercase tracking-widest">{activeSubs.length} Active</span>
          </div>
          <div className="space-y-6">
            {activeSubs.map(sub => {
              const tree = DUMMY_TREES.find(t => t.id === sub.treeId) || DUMMY_TREES[0];
              const latestMilestone = [...STAGES].reverse().find(s => tree.growthStage >= s.threshold) || STAGES[0];
              const daysSincePlanting = tree.plantedDate ? Math.floor((new Date().getTime() - new Date(tree.plantedDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
              
              return (
                <Card key={sub.id} className="p-8 relative overflow-hidden group border-none bg-white">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Trees size={64} />
                  </div>
                  <div className="flex gap-6 items-center">
                    <div className="w-20 h-20 bg-sand rounded-[2rem] flex items-center justify-center text-treekart-green organic-shadow border border-white">
                      <Trees size={40} strokeWidth={1} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-serif text-2xl font-black text-treekart-green tracking-tight">{tree.type} <span className="text-harvest-gold font-normal">#{tree.id.split('_')[1]}</span></h4>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-treekart-green/20" />
                              <p className="text-[9px] font-black text-treekart-green/40 uppercase tracking-widest">{sub.type} Plan</p>
                            </div>
                            <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest", getHealthInfo(tree.health).border, getHealthInfo(tree.health).bg, getHealthInfo(tree.health).color)}>
                              <div className={cn("w-1 h-1 rounded-full", tree.health === 'Optimal' ? 'bg-treekart-green' : tree.health === 'Warning' ? 'bg-harvest-gold' : 'bg-desert-clay')} />
                              {tree.health}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-serif text-2xl font-black text-treekart-green italic leading-none">₹{sub.amount}</p>
                          <p className="text-[8px] font-black text-harvest-gold uppercase tracking-widest mt-1">Success</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-sand/50 border border-white">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-treekart-green/30" />
                        <span className="text-[8px] font-black text-treekart-green/40 uppercase tracking-widest">Latest Milestone</span>
                      </div>
                      <p className="text-xs font-black text-treekart-green uppercase tracking-tight truncate">{latestMilestone.label}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-sand/50 border border-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={14} className="text-treekart-green/30" />
                        <span className="text-[8px] font-black text-treekart-green/40 uppercase tracking-widest">Season Progress</span>
                      </div>
                      <p className="text-xs font-black text-treekart-green uppercase tracking-tight">{daysSincePlanting} Days Live</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-treekart-green/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sand flex items-center justify-center">
                        <Clock size={14} className="text-treekart-green/40" />
                      </div>
                      <span className="text-[9px] font-black text-treekart-green/30 uppercase tracking-widest">Update 2h ago</span>
                    </div>
                    <button 
                      onClick={() => onTreeSelect(tree)}
                      className="px-6 py-3 bg-treekart-green text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all"
                    >
                      Audit
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Renewal & Shared Options */}
        <section className="space-y-6">
          <h3 className="font-serif text-2xl font-black italic text-treekart-green">Renewal Options</h3>
          <Card className="bg-harvest-gold border-none p-8">
            <div className="flex gap-4 items-center mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-treekart-green">
                <RefreshCw size={24} />
              </div>
              <h4 className="font-serif text-xl font-black text-treekart-green">Auto-Renewal</h4>
            </div>
            <p className="text-xs text-treekart-green/60 font-medium mb-6 leading-relaxed">
              Enable auto-renewal to keep your tree rights indefinitely and save 5% on next year's harvest.
            </p>
            <div className="flex items-center justify-between p-4 bg-white/30 rounded-2xl backdrop-blur-md">
              <span className="text-[10px] font-black text-treekart-green uppercase tracking-widest">Enabled</span>
              <div className="w-12 h-6 bg-treekart-green rounded-full relative p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
              </div>
            </div>
          </Card>
        </section>

        {/* Rental History */}
        <section className="space-y-6">
          <h3 className="font-serif text-2xl font-black italic text-treekart-green">Estate Archives</h3>
          <div className="space-y-3">
            {historySubs.map(sub => (
              <div key={sub.id} className="flex items-center gap-6 p-6 glass rounded-[2rem] border-white opacity-60">
                <div className="w-12 h-12 bg-treekart-green/10 rounded-xl flex items-center justify-center text-treekart-green">
                  <CheckCircle2 size={24} />
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-treekart-green uppercase text-xs tracking-widest">Season 2024</h5>
                  <p className="text-[10px] text-treekart-green/40 uppercase font-black tracking-widest mt-1">Completed • Harvested 24kg</p>
                </div>
                <ChevronRight size={20} className="text-treekart-green/20" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};
