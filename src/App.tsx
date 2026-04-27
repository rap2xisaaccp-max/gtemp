import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User, 
  Wallet, 
  Search, 
  LogOut, 
  Settings, 
  BarChart2, 
  Heart, 
  Star, 
  Download, 
  ChevronDown,
  Filter,
  DollarSign,
  X,
  AlertCircle,
  Mail,
  Lock
} from 'lucide-react';
import { isVariableStatement } from 'typescript';

// Types
// App.tsx
interface Project {
  id: string;
  title: string;
  owner: {
    username: string;
    profilePicUrl?: string;
  };
  description: string;
  downloadCount: number;
  ratingCount: number;
  ratingAvg: number;
  price: number;
  genres: string[]; // This already matches Project.java @ElementCollection
  engine: string;
  releaseDate: string;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  color?: string;
}

const COLORS = {
  primary: '#082032',
  secondary: '#2C394B',
  accent1: '#334756',
  accent2: '#6B728E',
  text: '#FFFFFF',
  highlight: '#60a5fa',
};

// Mock Data
// const INITIAL_PROJECTS: Project[] = [
//   { id: 1, title: 'Cyberpunk City Kit', creator: 'NeoAssets', description: 'High-quality sci-fi environment modules.', downloads: 1200, raters: 45, rating: 4.8, price: 45.00, genre: ['RPG', 'Sci-Fi'], engine: 'Unreal', date: '2023-11-15' },
//   { id: 2, title: 'Pixel Platformer Base', creator: 'RetroJoy', description: 'Smooth movement scripts and assets.', downloads: 5400, raters: 120, rating: 4.5, price: 0, genre: ['Platformer'], engine: 'Unity3D', date: '2024-01-10' },
//   { id: 3, title: 'Realistic Forest Pack', creator: 'NatureGen', description: 'Optimized foliage and terrain textures.', downloads: 800, raters: 12, rating: 4.2, price: 29.99, genre: ['Simulation'], engine: 'Unity3D', date: '2023-12-05' },
//   { id: 4, title: 'Obby Master Kit', creator: 'RbxDev', description: 'Everything you need for a professional Obby.', downloads: 15000, raters: 890, rating: 4.9, price: 0, genre: ['Parkour'], engine: 'Roblox Studio', date: '2024-02-20' },
//   { id: 5, title: 'Low Poly Dungeon', creator: 'SimpleShapes', description: 'Modular dungeon pieces for mobile.', downloads: 3200, raters: 56, rating: 4.0, price: 15.00, genre: ['RPG'], engine: 'Godot', date: '2024-02-01' },
//   { id: 6, title: 'Horror Ghost AI', creator: 'SpookyCodes', description: 'Advanced AI behavior for horror games.', downloads: 450, raters: 8, rating: 3.8, price: 12.50, genre: ['Horror'], engine: 'Unreal', date: '2023-10-30' },
//   { id: 7, title: 'Anime Shader Pack', creator: 'VfxKing', description: 'Cell shading for any model.', downloads: 2100, raters: 34, rating: 4.7, price: 19.00, genre: ['Visuals'], engine: 'Unity3D', date: '2024-01-25' },
//   { id: 8, title: 'Spaceship Controller', creator: 'GalacticDev', description: 'Newtonian physics flight script.', downloads: 110, raters: 3, rating: 4.1, price: 5.00, genre: ['Sci-Fi'], engine: 'Godot', date: '2024-02-14' },
// ];

const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!text) return null; 
  if (!highlight.trim()) return <>{text}</>;

  // 'gi' flag ensures global and case-insensitive matching
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} style={{ color: COLORS.highlight }} className="font-bold">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; profilePicUrl?: string; walletBalance?: number;} | null>(null);
  const [authModal, setAuthModal] = useState({ isOpen: false, tab: 'login' as 'login' | 'register' });
  const [authForm, setAuthForm] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [formError, setFormError] = useState('');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [engineFilter, setEngineFilter] = useState<string>('All');
  const [genreFilter, setGenreFilter] = useState<string>('All');
  const [priceSort, setPriceSort] = useState<string>('Any');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [isHeaderHovered, setIsHeaderHovered] = useState<boolean>(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const API_URL = process.env.REACT_APP_API_URL;
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('https://gtemp-backend.onrender.com/api/projects')
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Filter Logic
  const filteredData = useMemo(() => {
    let list = [...projects];
    const searchLower = searchQuery.toLowerCase();
    
    return list.filter(item => {
      const itemGenres = item.genres || [];
      const matchesSearchLetters = item.title.toLowerCase().includes(searchLower) || 
                                    // item.creator.toLowerCase().includes(searchLower) ||
                                    item.engine.toLowerCase().includes(searchLower) ||
                                    itemGenres.some(g => g.toLowerCase().includes(searchLower));
      const matchesSearchWords = itemGenres.some(g => g.toLowerCase() === searchLower) ||
                                  // item.creator.toLowerCase().includes(searchLower) ||
                                  item.engine.toLowerCase() === searchLower ||
                                  item.price.toString() === searchLower;

      const matchesEngine = engineFilter === 'All' || item.engine === engineFilter;
      const matchesGenre = genreFilter === 'All' || itemGenres.includes(genreFilter);
      const matchesPriceRange = item.price >= minPrice && item.price <= maxPrice;

      return (matchesSearchLetters || matchesSearchWords) && matchesEngine && matchesGenre && matchesPriceRange;
    }).sort((a, b) => {
      if (priceSort === 'High to Low') return b.price - a.price;
      if (priceSort === 'Low to High') return a.price - b.price;
      if (activeTab === 'Top Rated') return b.ratingAvg - a.ratingAvg;
      if (activeTab === 'Popular') return b.downloadCount - a.downloadCount;
      if (activeTab === 'Recently Updated') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      return 0;
    });
  }, [projects, searchQuery, engineFilter, genreFilter, priceSort, minPrice, maxPrice, activeTab]);

  //keep user log in
  useEffect(() => {
    // Check if user data exists in local storage on startup
    const savedUser = localStorage.getItem('gtemp_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.loggedIn) {
        setIsLoggedIn(true);
        setCurrentUser({ username: parsedUser.username, profilePicUrl: parsedUser.profilePicUrl, walletBalance: parsedUser.walletBalance || 0 }); // Set the username here
      }
    }
  }, []); // Empty array means this runs once when the app starts

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const endpoint = authModal.tab === 'login' ? '/api/login' : '/api/register';
    
    const payload = authModal.tab === 'login' 
      ? { username: authForm.email, password: authForm.password } 
      : { username: authForm.username, email: authForm.email, password: authForm.password };

    try {
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (authModal.tab === 'register') {
        const result = await response.text();
        if (response.ok && result === "User registered successfully") {
          setAuthModal({ ...authModal, tab: 'login' });
          alert("Registration successful! Please sign in.");
          setAuthForm({ username: '', email: '', password: '', confirmPassword: '' });
        } else {
          setFormError(result);
        }
        return;
      }

      // 2. Handle Login (Returns JSON Profile)
      if (authModal.tab === 'login') {
        if (response.ok) {
          const userProfile = await response.json(); // Parse the JSON object from AuthController
          
          const userData = { 
            loggedIn: true, 
            username: userProfile.username, 
            profilePicUrl: userProfile.profilePicUrl,
            walletBalance: userProfile.walletBalance || 0
          };

          localStorage.setItem('gtemp_user', JSON.stringify(userData));
          setCurrentUser(userData);
          setIsLoggedIn(true);
          setAuthModal({ ...authModal, isOpen: false });
          setAuthForm({ username: '', email: '', password: '', confirmPassword: '' });
        } else {
          const errorText = await response.text();
          setFormError(errorText || "Invalid credentials");
        }
      }
    } catch (error) {
      setFormError("Server connection failed. Is the backend running?");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gtemp_user');
    setIsLoggedIn(false);
    setIsProfileOpen(false);
  };
  // Specific Result Counter Logic

  const resultCount = useMemo(() => {
    if (!searchQuery.trim() && engineFilter === 'All' && genreFilter === 'All' && minPrice === 0 && maxPrice === 1000) {
      return projects.length;
    }

    const searchLower = searchQuery.toLowerCase().trim();
    
    return projects.filter(item => {
      const itemGenres = item.genres || [];
      const itemEngine = item.engine || '';
      const itemTitle = item.title || '';

      const matchesSearch = !searchLower || 
        itemTitle.toLowerCase().includes(searchLower) ||
        itemEngine.toLowerCase().includes(searchLower) ||
        itemGenres.some(g => g.toLowerCase().includes(searchLower));

      const matchesEngine = engineFilter === 'All' || itemEngine === engineFilter;
      const matchesGenre = genreFilter === 'All' || itemGenres.includes(genreFilter);
      const matchesPrice = item.price >= minPrice && item.price <= maxPrice;

      return matchesSearch && matchesEngine && matchesGenre && matchesPrice;
    }).length;
  }, [projects, searchQuery, engineFilter, genreFilter, minPrice, maxPrice]);

  const handleMinChange = (val: string) => {
    const num = Number(val);
    setMinPrice(num);
    if (num > maxPrice) setMaxPrice(num);
  };

  const handleMaxChange = (val: string) => {
    const num = Number(val);
    setMaxPrice(num);
    if (num < minPrice) setMinPrice(num);
  };

  const profileItems: NavItem[] = [
    { icon: <Settings size={16}/>, label: 'Customize Profile' },
    { icon: <BarChart2 size={16}/>, label: 'Uploads Statistics' },
    { icon: <Heart size={16}/>, label: 'Wishlisted Projects' },
    { icon: <Star size={16}/>, label: 'Reviewed Projects' },
    { icon: <Download size={16}/>, label: 'Purchased Projects' },
    { icon: <LogOut size={16}/>, label: 'Log out', color: 'text-red-400' },
  ];

  return (
    <div className="min-h-screen font-sans text-white pb-10" style={{ backgroundColor: COLORS.primary }}>
      {authModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div 
            className="w-full max-w-[400px] rounded-3xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in duration-200"
            style={{ backgroundColor: COLORS.secondary, borderColor: COLORS.accent1 }}
          >
            {/* Header / Tabs */}
            <div className="relative pt-8 px-8">
              <button 
                onClick={() => setAuthModal({ ...authModal, isOpen: false })}
                className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex gap-6 mb-8 border-b border-white/5">
                <button 
                  onClick={() => { setAuthModal({ ...authModal, tab: 'login' }); setFormError(''); }}
                  className={`pb-3 text-sm font-bold transition-all relative ${authModal.tab === 'login' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Sign In
                  {authModal.tab === 'login' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full" />}
                </button>
                <button 
                  onClick={() => { setAuthModal({ ...authModal, tab: 'register' }); setFormError(''); }}
                  className={`pb-3 text-sm font-bold transition-all relative ${authModal.tab === 'register' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Create Account
                  {authModal.tab === 'register' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full" />}
                </button>
              </div>
            </div>

            <form onSubmit={handleAuthAction} className="px-8 pb-8 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-in slide-in-from-top-1">
                  <AlertCircle size={14} />
                  {formError}
                </div>
              )}

              {authModal.tab === 'register' && (
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5 block">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      required
                      type="text" 
                      className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-colors" 
                      placeholder="Gamer123"
                      value={authForm.username}
                      onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    required
                    type="email" 
                    className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-colors" 
                    placeholder="name@email.com" 
                    value={authForm.email}
                    onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    required
                    type="password" 
                    className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-colors" 
                    placeholder="••••••••" 
                    value={authForm.password}
                    onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  />
                </div>
              </div>

              {authModal.tab === 'register' && (
                <div className="animate-in fade-in slide-in-from-top-1">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1.5 block">Repeat Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                      required
                      type="password" 
                      className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-colors" 
                      placeholder="••••••••" 
                      value={authForm.confirmPassword}
                      onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {authModal.tab === 'login' && (
                <div className="flex justify-end">
                  <button type="button" className="text-[11px] text-blue-400 hover:underline">Forgot password?</button>
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-3.5 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98] mt-2"
              >
                {authModal.tab === 'login' ? 'Sign In' : 'Join Gtemp'}
              </button>

              <p className="text-center text-[12px] text-gray-500 pt-2">
                {authModal.tab === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button 
                  type="button"
                  onClick={() => { setAuthModal({ ...authModal, tab: authModal.tab === 'login' ? 'register' : 'login' }); setFormError(''); }}
                  className="ml-1.5 text-white hover:underline font-bold"
                >
                  {authModal.tab === 'login' ? 'Register' : 'Sign In'}
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
      <div 
        className="sticky top-0 z-50 group/header"
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        {/* HEADER */}
        <header className="sticky top-0 z-50 shadow-xl" style={{ backgroundColor: COLORS.secondary }}>
          <div className="mmax-w-[1800px] mx-auto px-4 h-11 flex items-center justify-between gap-3">
            
            {/* Logo Section - Hidden on Mobile Width (< 640px) */}
            <div className="hidden sm:flex items-center gap-2 cursor-pointer flex-shrink-0 transition-all">
              <div className="w-7 h-7 rounded flex items-center justify-center font-bold text-sm" style={{ backgroundColor: COLORS.accent2 }}>G</div>
              <span className="text-lg font-bold tracking-tight">Gtemp</span>
            </div>

            {/* Search Box Section - Centered and Expandable */}
             <div className="flex-grow flex justify-center min-w-0">
              <div className="w-full max-w-xl relative group">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5 group-focus-within:text-white" />
                <input 
                  type="text" 
                  placeholder="Search genre, engine, keywords..."
                  className="w-full pl-8 pr-3 py-1 rounded-full outline-none text-[11px] transition-all"
                  style={{ backgroundColor: COLORS.primary, border: `1px solid ${COLORS.accent1}` }}
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {!isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setAuthModal({ isOpen: true, tab: 'login' })}
                    className="px-4 py-1.5 text-[11px] font-bold text-gray-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => setAuthModal({ isOpen: true, tab: 'register' })}
                    className="px-4 py-1.5 text-[11px] font-bold bg-white text-black rounded-full hover:bg-gray-200 transition-all"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-[10px] font-medium text-gray-400 hidden lg:block whitespace-nowrap">
                    <span className="text-white font-bold">{resultCount}</span> Results
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-900/20 text-emerald-400 border border-emerald-800/30">
                    <Wallet size={12} className="flex-shrink-0" />
                    <span className="font-mono text-[10px]">${currentUser?.walletBalance?.toFixed(2) || '0.00'}</span>
                  </div>

                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-1.5 p-0.5 pr-2 rounded-full hover:bg-white/5 transition-all"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-white/10 overflow-hidden">
                        <img 
                          src={currentUser?.profilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username}`}
                          alt="Profile" 
                        />
                      </div>
                      {/* Username - Hidden on Mobile Width (< 640px) */}
                      <span className="hidden sm:block text-[11px] font-medium">
                        {currentUser?.username || 'User'}
                      </span>
                      
                      <ChevronDown size={12} className={`transition-transform text-gray-400 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && ( 
                      <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-2xl border overflow-hidden z-50" style={{ backgroundColor: COLORS.accent1, borderColor: COLORS.accent2 }}>
                        <div className="p-2">
                          <button 
                            onClick={() => { setAuthModal({ isOpen: true, tab: 'login' }); setFormError(''); }}
                            className="px-4 py-1.5 text-[11px] font-bold text-gray-300 hover:text-white"
                          >
                            Sign In
                          </button>
                          {profileItems.map((item, i) => (
                            <button 
                              key={i} 
                              onClick={item.label === 'Log out' ? handleLogout : undefined}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[11px] hover:bg-white/5 rounded ${item.color || ''}`}
                            >
                              {item.icon}
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* SUB HEADER / FILTERS */}
        <div 
          className={`
            transition-all duration-200 ease-in-out border-b border-white/5 overflow-hidden
            sm:absolute sm:w-full sm:left-0 sm:top-11 sm:z-10
            ${isHeaderHovered ? 'sm:translate-y-0 sm:opacity-100 sm:max-h-8' : 'sm:-translate-y-2 sm:opacity-0 sm:max-h-0 sm:pointer-events-none'}
            max-h-8 opacity-100 translate-y-0 pointer-events-auto
          `} 
          style={{ backgroundColor: COLORS.secondary }}
        >
          <div className="max-w-[1800px] mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar h-8 px-4">
            <Filter size={10} className="text-gray-500 flex-shrink-0 mr-1" />
              {['All', 'Popular', 'Recently Updated', 'Top Rated'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[9px] font-medium transition-all ${activeTab === tab ? 'bg-white text-black' : 'hover:bg-white/10'}`}
                  style={{ border: activeTab === tab ? 'none' : `1px solid ${COLORS.accent1}` }}
                >
                  {tab}
                </button>
              ))}

            <div className="h-3 w-[1px] bg-white/10 mx-1 flex-shrink-0" />

            <select 
              className="bg-transparent border rounded-full px-3 py-1.5 text-[9px] outline-none cursor-pointer"
              style={{ borderColor: COLORS.accent1 }}
              value={engineFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEngineFilter(e.target.value)}
            >
              <option className="bg-slate-900" value="All">All Engines</option>
              <option className="bg-slate-900" value="Unity3D">Unity3D</option>
              <option className="bg-slate-900" value="Unreal">Unreal</option>
              <option className="bg-slate-900" value="Godot">Godot</option>
              <option className="bg-slate-900" value="Roblox Studio">Roblox Studio</option>
            </select>

            <select 
              className="bg-transparent border rounded-full px-3 py-1.5 text-[9px] outline-none cursor-pointer"
              style={{ borderColor: COLORS.accent1 }}
              value={priceSort}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriceSort(e.target.value)}
            >
              <option className="bg-slate-900" value="Any">Any Price</option>
              <option className="bg-slate-900" value="High to Low">Price: High to Low</option>
              <option className="bg-slate-900" value="Low to High">Price: Low to High</option>
            </select>

            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
              <span className="text-[8px] text-gray-400 uppercase tracking-tighter">Price Range</span>
              <input 
                type="number" 
                placeholder="Min"
                className="w-14 px-1 py-1 rounded text-[9px] outline-none"
                style={{ backgroundColor: COLORS.primary, border: `1px solid ${COLORS.accent1}` }}
                value={minPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMinChange(e.target.value)}
              />
              <input 
                type="number" 
                placeholder="Max"
                className="w-14 px-1 py-1 rounded text-[9px] outline-none"
                style={{ backgroundColor: COLORS.primary, border: `1px solid ${COLORS.accent1}` }}
                value={maxPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMaxChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BODY / PROJECT CARDS */}
      <main className="max-w-[1800px] mx-auto px-4 py-8">
        
        <div className="mb-6 lg:hidden flex justify-between items-center text-sm">
          <p className="text-gray-400"><span className="text-white font-bold">{resultCount}</span> matched criteria</p>
          <p className="text-gray-400">Displaying {filteredData.length} items</p>
        </div>

        {/* Grid System - Scaled for high density & prevention of stretching */}
        {/* Mobile: 2-3 columns | Tablet: 3-4 columns | PC Wide: 4-6 columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {filteredData.map((project) => (
            <div 
              key={project.id}
              className="group rounded-xl overflow-hidden transition-all hover:-translate-y-1.5 hover:shadow-2xl flex flex-col h-full transform-gpu"
              style={{ 
                backgroundColor: COLORS.secondary, 
                border: `1px solid ${COLORS.accent1}`,
                fontSize: '0.85rem' // Scale down content slightly to fit more
              }}
            >
              {/* Image Preview - Fixed aspect ratio to prevent stretching */}
              <div className="relative aspect-video bg-slate-800 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <button className="w-full py-1.5 bg-white text-black font-bold text-[10px] rounded-md transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    View
                  </button>
                </div>
                <img 
                  src={`https://picsum.photos/seed/${project.id}/400/225`} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider">
                  <HighlightedText text={project.engine.split(' ')[0]} highlight={searchQuery} /> {/* Shorten engine name for small cards */}
                </div>
              </div>

              {/* Card Content - Scaled down */}
              <div className="p-3 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="font-bold text-sm leading-tight group-hover:text-blue-400 transition-colors line-clamp-1" title={project.title}>
                    <HighlightedText text={project.title} highlight={searchQuery} />
                  </h3>
                  <div className="text-[11px] font-bold ml-1 flex-shrink-0">
                    {project.price === 0 ? (
                      <span className="text-emerald-400">FREE</span>
                    ) : (
                      <span style={{ color: COLORS.accent2 }}>${project.price.toFixed(0)}</span>
                    )}
                  </div>
                </div>
                
                {/* App.tsx - Updated Line ~535 */}
                <p className="text-[10px] text-gray-400 mb-1.5">
                  by <span className="text-gray-300 hover:underline cursor-pointer">
                    {/* Access owner.username instead of project.ownerId */}
                    <HighlightedText text={project.owner?.username || 'Unknown'} highlight={searchQuery} />
                  </span>
                </p>
                                
                <p className="text-[10px] text-gray-400 line-clamp-2 mb-3 leading-tight opacity-80">
                  {project.description}
                </p>

                <div className="mt-auto">
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-2 pb-2 border-b border-white/5">
                    <div className="flex items-center gap-1">
                      <Download size={10} className="text-gray-500" />
                      {project.downloadCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={10} className="text-yellow-500 fill-yellow-500" />
                      {project.ratingAvg}
                      <span className="text-gray-500 text-[9px]">({project.ratingCount})</span>
                    </div>
                  </div>

                  {/* App.tsx - Line ~550 */}
                  <div className="flex flex-wrap gap-1 mb-1">
                    {project.genres?.map((g, i) => ( 
                      <span key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] border border-white/10 whitespace-nowrap">
                        <HighlightedText text={g} highlight={searchQuery} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="py-32 text-center">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <h2 className="text-xl font-bold opacity-50">No projects found</h2>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search keywords.</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setEngineFilter('All');
                setMinPrice(0);
                setMaxPrice(1000);
              }}
              className="mt-6 px-6 py-2 rounded-full border border-white/20 hover:bg-white/5 transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 480px) {
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}} />
    </div>
  );
};

export default App;
