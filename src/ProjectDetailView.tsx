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
  Lock,
  MessageSquare,
  Share2,
  Calendar,
  Cpu,
  Shield,
  FileCode,
  Globe,
  Tag,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MessageCircle,
  ThumbsUp,
  Clock,
  ExternalLink,
  ChevronUp,
  FileCheck2,
  Bookmark
} from 'lucide-react';

// Types aligning with database schema
interface Project {
  id: string;
  title: string;
  owner: {
    username: string;
    profilePicUrl?: string;
    bio?: string;
    role?: string;
  };
  description: string;
  mainScreenshot?: string;
  downloadCount: number;
  ratingCount: number;
  ratingAvg: number;
  price: number;
  genres: string[];
  engine: string;
  releaseDate: string;
  lastUpdate?: string;
}

interface ProjectFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  version: string;
  uploadDate: string;
}

interface ProjectComment {
  id: string;
  username: string;
  profilePicUrl?: string;
  content: string;
  createdAt: string;
  rating?: number;
  likes: number;
  replies?: ProjectComment[];
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  color?: string;
  view?: string; 
  tab?: string;  
}

const COLORS = {
  primary: '#082032',
  secondary: '#2C394B',
  accent1: '#334756',
  accent2: '#6B728E',
  text: '#FFFFFF',
  highlight: '#60a5fa',
};

const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!text) return null; 
  if (!highlight.trim()) return <>{text}</>;

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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Profiles and views state
  const [activeView, setActiveView] = useState<string>('Home');
  const [collectionTab, setCollectionTab] = useState<string>('Wishlisted');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const FUND_OPTIONS = [5, 10, 20, 50, 100, 200, 500, 1000];
  const [isAddingFunds, setIsAddingFunds] = useState(false);

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
  const API_URL = 'https://gtemp-backend.onrender.com';

  // Fallback initial templates if backend isn't available immediately
  const INITIAL_PROJECTS_FALLBACK: Project[] = [
    { 
      id: '1', 
      title: 'Cyberpunk City Kit', 
      owner: { username: 'NeoAssets', profilePicUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=NeoAssets', bio: 'Creating futuristic cyber-scapes and tools.', role: 'Studio Developer' }, 
      description: 'An ultimate futuristic modular skyscraper assembly set containing high-fidelity game objects with custom, optimized textures and performance metrics. Includes complete atmospheric scene setups, pre-configured lighting rigs, and state-of-the-art parallax interior shaders to deliver cinematic 3D realism directly on mobile, VR, or desktop hardware layouts.\n\nKey Highlights:\n- Over 150+ Modular Building Elements\n- Custom Shader Graphs for Neon Shimmer Effects\n- Fully configured physics colliders and LOD presets\n- Low draw-call optimization ready for console deployment', 
      downloadCount: 1200, 
      ratingCount: 45, 
      ratingAvg: 4.8, 
      price: 45.00, 
      genres: ['RPG', 'Sci-Fi'], 
      engine: 'Unreal', 
      releaseDate: '2025-11-15',
      lastUpdate: '2026-03-01'
    },
    { 
      id: '2', 
      title: 'Pixel Platformer Base', 
      owner: { username: 'RetroJoy', profilePicUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroJoy', bio: '2D mechanics wizard.' }, 
      description: 'The definitive foundation kit for creating fluid 2D arcade platform games. It features pixel-perfect dynamic physics mechanics, interactive hazard configurations, enemy AI behavior trees, collectible management systems, and dual-layer parralax parallax backdrops. Optimized to work right out of the box with responsive controller mapping.', 
      downloadCount: 5400, 
      ratingCount: 120, 
      ratingAvg: 4.5, 
      price: 0, 
      genres: ['Platformer'], 
      engine: 'Unity3D', 
      releaseDate: '2026-01-10',
      lastUpdate: '2026-05-12'
    },
    { 
      id: '3', 
      title: 'Realistic Forest Pack', 
      owner: { username: 'NatureGen', profilePicUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=NatureGen' }, 
      description: 'Breathe pristine life into outdoor environments. This asset provides a comprehensive range of procedurally populated flora, organic terrain blueprints, wind wind-swaying particle systems, and micro-detailed displacement bark maps.', 
      downloadCount: 800, 
      ratingCount: 12, 
      ratingAvg: 4.2, 
      price: 29.99, 
      genres: ['Simulation'], 
      engine: 'Unity3D', 
      releaseDate: '2025-12-05',
      lastUpdate: '2025-12-20'
    },
    { 
      id: '4', 
      title: 'Obby Master Kit', 
      owner: { username: 'RbxDev', profilePicUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=RbxDev' }, 
      description: 'Construct top-trending Obby maps efficiently inside Roblox. This pack offers a rich package of customizable checkpoint blocks, lethal laser patterns, moving platform presets, and user-friendly visual leaderboard scripts.', 
      downloadCount: 15000, 
      ratingCount: 890, 
      ratingAvg: 4.9, 
      price: 0, 
      genres: ['Parkour'], 
      engine: 'Roblox Studio', 
      releaseDate: '2026-02-20',
      lastUpdate: '2026-05-02'
    },
    { 
      id: '5', 
      title: 'Low Poly Dungeon', 
      owner: { username: 'SimpleShapes', profilePicUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=SimpleShapes' }, 
      description: 'Explore dangerous dungeons with this stylized kit! Excellent collection of stylized treasure chests, iron grates, spooky torches with pre-made fire particle modules, and brick wall variations perfect for high frame rates.', 
      downloadCount: 3200, 
      ratingCount: 56, 
      ratingAvg: 4.0, 
      price: 15.00, 
      genres: ['RPG'], 
      engine: 'Godot', 
      releaseDate: '2026-02-01',
      lastUpdate: '2026-04-10'
    }
  ];

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
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/api/projects`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data.length > 0 ? data : INITIAL_PROJECTS_FALLBACK);
        } else {
          setProjects(INITIAL_PROJECTS_FALLBACK);
        }
      } catch (error) {
        console.error("Failed to fetch projects, using fallback:", error);
        setProjects(INITIAL_PROJECTS_FALLBACK);
      }
    };

    fetchProjects();
  }, [API_URL]);

  // Keep user logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('gtemp_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.loggedIn) {
        setIsLoggedIn(true);
        setCurrentUser({ username: parsedUser.username, profilePicUrl: parsedUser.profilePicUrl, walletBalance: parsedUser.walletBalance || 0 });
      }
    }
  }, []);

  // Sync hash navigation
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/project/')) {
        const projectId = hash.replace('#/project/', '');
        const match = projects.find(p => String(p.id) === projectId);
        if (match) {
          setSelectedProject(match);
        }
      } else {
        setSelectedProject(null);
      }
    };

    handleHashNavigation();
    window.addEventListener('hashchange', handleHashNavigation);
    return () => window.removeEventListener('hashchange', handleHashNavigation);
  }, [projects]);

  const navigateToProject = (id: string) => {
    window.location.hash = `#/project/${id}`;
  };

  const clearProjectNavigation = () => {
    window.location.hash = '';
  };

  // Auth processing
  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const endpoint = authModal.tab === 'login' ? '/api/login' : '/api/register';
    const payload = authModal.tab === 'login' 
      ? { username: authForm.email, password: authForm.password } 
      : { username: authForm.username, email: authForm.email, password: authForm.password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
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

      if (authModal.tab === 'login') {
        if (response.ok) {
          const userProfile = await response.json();
          const userData = { 
            loggedIn: true, 
            username: userProfile.username, 
            profilePicUrl: userProfile.profilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.username}`,
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
      // Offline fallback behavior
      if (authModal.tab === 'login') {
        const mockName = authForm.email.split('@')[0] || 'User';
        const userData = { 
          loggedIn: true, 
          username: mockName, 
          profilePicUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockName}`,
          walletBalance: 125.50
        };
        localStorage.setItem('gtemp_user', JSON.stringify(userData));
        setCurrentUser(userData);
        setIsLoggedIn(true);
        setAuthModal({ ...authModal, isOpen: false });
        alert("Demo Mode: Signed in locally!");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gtemp_user');
    setIsLoggedIn(false);
    setIsProfileOpen(false);
    setCurrentUser(null);
  };

  const handleAddFunds = async (amount: number) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${API_URL}/api/users/add-funds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, amount }),
      });

      if (response.ok) {
        const updatedBalance = (currentUser.walletBalance || 0) + amount;
        const updatedUser = { ...currentUser, walletBalance: updatedBalance };
        setCurrentUser(updatedUser);

        const localData = JSON.parse(localStorage.getItem('gtemp_user') || '{}');
        localStorage.setItem('gtemp_user', JSON.stringify({ ...localData, walletBalance: updatedBalance }));
        setIsAddingFunds(false);
        alert(`Successfully deposited $${amount}.00 to your wallet!`);
      } else {
        // Fallback simulated update offline
        const updatedBalance = (currentUser.walletBalance || 0) + amount;
        const updatedUser = { ...currentUser, walletBalance: updatedBalance };
        setCurrentUser(updatedUser);
        setIsAddingFunds(false);
        alert(`Offline Simulation: Added $${amount}.00 to your virtual wallet!`);
      }
    } catch (error) {
      const updatedBalance = (currentUser.walletBalance || 0) + amount;
      const updatedUser = { ...currentUser, walletBalance: updatedBalance };
      setCurrentUser(updatedUser);
      setIsAddingFunds(false);
      alert(`Offline Simulation: Added $${amount}.00 to your virtual wallet!`);
    }
  };

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    let list = [...projects];
    const searchLower = searchQuery.toLowerCase().trim();
    
    return list.filter(item => {
      const itemGenres = item.genres || [];
      const matchesSearchLetters = item.title.toLowerCase().includes(searchLower) || 
                                    item.engine.toLowerCase().includes(searchLower) ||
                                    itemGenres.some(g => g.toLowerCase().includes(searchLower));

      const matchesEngine = engineFilter === 'All' || item.engine === engineFilter;
      const matchesGenre = genreFilter === 'All' || itemGenres.includes(genreFilter);
      const matchesPriceRange = item.price >= minPrice && item.price <= maxPrice;

      return matchesSearchLetters && matchesEngine && matchesGenre && matchesPriceRange;
    }).sort((a, b) => {
      if (priceSort === 'High to Low') return b.price - a.price;
      if (priceSort === 'Low to High') return a.price - b.price;
      if (activeTab === 'Top Rated') return b.ratingAvg - a.ratingAvg;
      if (activeTab === 'Popular') return b.downloadCount - a.downloadCount;
      if (activeTab === 'Recently Updated') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      return 0;
    });
  }, [projects, searchQuery, engineFilter, genreFilter, priceSort, minPrice, maxPrice, activeTab]);

  const resultCount = filteredData.length;

  const handleMinChange = (val: string) => {
    const num = Number(val);
    setMinPrice(num);
  };

  const handleMaxChange = (val: string) => {
    const num = Number(val);
    setMaxPrice(num);
  };

  // ——————————————————————————————————————————————————————————
  // PRO PROJECT DETAIL VIEW COMPONENT
  // ——————————————————————————————————————————————————————————
  const ProjectDetailsView: React.FC<{ project: Project; onBack: () => void }> = ({ project, onBack }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'comments'>('overview');
    
    // Media & Screenshots setup using mock URLs built from project config
    const screenshots = useMemo(() => [
      `https://picsum.photos/seed/${project.id}-A/1200/675`,
      `https://picsum.photos/seed/${project.id}-B/1200/675`,
      `https://picsum.photos/seed/${project.id}-C/1200/675`,
      `https://picsum.photos/seed/${project.id}-D/1200/675`,
    ], [project.id]);

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    
    // Comment State Simulation
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [commentList, setCommentList] = useState<ProjectComment[]>([
      {
        id: 'c1',
        username: 'AlexCoder',
        profilePicUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Alex',
        content: 'Absolutely stellar asset package! The customized shader code works beautifully on my Unity HDRP pipeline. Clean hierarchy and excellent LOD setup.',
        createdAt: '2 hours ago',
        rating: 5,
        likes: 12,
        replies: [
          {
            id: 'c1_r1',
            username: project.owner.username,
            profilePicUrl: project.owner.profilePicUrl,
            content: 'Thank you Alex! Glad to hear the LOD setup proved useful on HDRP structures. We updated those shaders last week!',
            createdAt: '1 hour ago',
            likes: 4
          }
        ]
      },
      {
        id: 'c2',
        username: 'PixelWarrior',
        profilePicUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel',
        content: 'Looks very impressive. Can you verify if this is safe to use in standard URP without complex modifications?',
        createdAt: 'Yesterday',
        rating: 4,
        likes: 3,
        replies: []
      }
    ]);

    // Download & Purchase Simulation State
    const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isPurchased, setIsPurchased] = useState(false);
    const [buying, setBuying] = useState(false);

    // Mock project files in database aligning with schema
    const projectFiles: ProjectFile[] = useMemo(() => [
      {
        id: 'file-1',
        fileName: `${project.title.replace(/\s+/g, '_')}_Core_v1.4.zip`,
        fileUrl: '#',
        fileSize: project.price === 0 ? '48.2 MB' : '142.5 MB',
        version: 'v1.4.0',
        uploadDate: '2026-03-01'
      },
      {
        id: 'file-2',
        fileName: `${project.title.replace(/\s+/g, '_')}_Demo_Project_Files.zip`,
        fileUrl: '#',
        fileSize: '315.8 MB',
        version: 'v1.2.0',
        uploadDate: '2026-01-15'
      }
    ], [project.title, project.price]);

    const handleDownload = (fileId: string) => {
      if (project.price > 0 && !isPurchased) {
        alert("You must purchase the package to download the core files.");
        return;
      }
      
      setDownloadingFileId(fileId);
      setDownloadProgress(0);
      
      const interval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setDownloadingFileId(null);
              alert("Download finished successfully!");
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    };

    const handleBuy = () => {
      if (!isLoggedIn) {
        setAuthModal({ isOpen: true, tab: 'login' });
        return;
      }

      if (currentUser && currentUser.walletBalance !== undefined && currentUser.walletBalance < project.price) {
        alert(`Insufficient funds! You have $${currentUser.walletBalance.toFixed(2)} but need $${project.price.toFixed(2)}. Click 'Add Funds' in the Profile Settings.`);
        return;
      }

      setBuying(true);
      setTimeout(() => {
        if (currentUser && currentUser.walletBalance !== undefined) {
          const newBalance = currentUser.walletBalance - project.price;
          setCurrentUser({ ...currentUser, walletBalance: newBalance });
          const localData = JSON.parse(localStorage.getItem('gtemp_user') || '{}');
          localStorage.setItem('gtemp_user', JSON.stringify({ ...localData, walletBalance: newBalance }));
        }
        setIsPurchased(true);
        setBuying(false);
        alert(`Success! "${project.title}" has been added to your catalog.`);
      }, 1500);
    };

    const handlePostComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;

      const userDisplayName = currentUser?.username || 'GuestUser';
      const userAvatar = currentUser?.profilePicUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${userDisplayName}`;

      const added: ProjectComment = {
        id: `c_${Date.now()}`,
        username: userDisplayName,
        profilePicUrl: userAvatar,
        content: newComment,
        createdAt: 'Just now',
        rating: newRating,
        likes: 0,
        replies: []
      };

      setCommentList([added, ...commentList]);
      setNewComment('');
      alert("Comment submitted successfully!");
    };

    const nextImage = () => {
      setSelectedImageIndex((prev) => (prev + 1) % screenshots.length);
    };

    const prevImage = () => {
      setSelectedImageIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
    };

    return (
      <div className="max-w-[1440px] mx-auto pb-16 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* LIGHTBOX OVERLAY */}
        {isLightboxOpen && (
          <div className="fixed inset-0 bg-black/95 z-[120] flex flex-col justify-center items-center p-4">
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-all bg-white/5 p-3 rounded-full hover:bg-white/10"
            >
              <X size={28} />
            </button>
            <div className="relative max-w-5xl w-full flex items-center justify-center">
              <button 
                onClick={prevImage}
                className="absolute left-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              <img 
                src={screenshots[selectedImageIndex]} 
                alt="Enlarged screenshot view" 
                className="max-h-[80vh] max-w-full rounded-lg object-contain border border-white/5 shadow-2xl"
              />
              <button 
                onClick={nextImage}
                className="absolute right-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              Screenshot {selectedImageIndex + 1} of {screenshots.length}
            </div>
          </div>
        )}

        {/* BREADCRUMB / BACK HERO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button 
            onClick={onBack} 
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all text-xs border border-white/5"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Marketplace
          </button>
          
          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <span>Marketplace</span>
            <span>/</span>
            <span>{project.engine}</span>
            <span>/</span>
            <span className="text-blue-400">{project.title}</span>
          </div>
        </div>

        {/* MAIN DISPLAY COLOUMN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT 8 COLUMNS: Media, Tabs, Technical Specs */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* HERO BLOCK & MEDIA CAROUSEL */}
            <div className="bg-[#2C394B] rounded-2xl overflow-hidden border border-[#334756] shadow-xl">
              <div className="relative aspect-video w-full bg-slate-900 group">
                <img 
                  src={screenshots[selectedImageIndex]} 
                  alt={`${project.title} screenshot preview`} 
                  className="w-full h-full object-cover transition-all duration-300"
                />
                
                {/* Overlay details */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => setIsLightboxOpen(true)}
                    className="p-2.5 rounded-lg bg-black/70 hover:bg-black/90 border border-white/10 text-white hover:scale-105 transition-all shadow-md"
                    title="View fullscreen"
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>

                {/* Left/Right controls inside image */}
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Thumbnails line */}
              <div className="p-3 bg-[#1e2736] border-t border-[#334756] flex gap-2.5 overflow-x-auto no-scrollbar">
                {screenshots.map((url, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`relative w-28 aspect-video rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImageIndex === i ? 'border-blue-500 scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={url} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* HIGH-END NAVIGATION TABS */}
            <div className="border-b border-[#334756] flex gap-8">
              {(['overview', 'files', 'comments'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-bold uppercase tracking-wider relative transition-all ${activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2">
                    {tab === 'overview' && <Globe size={15} />}
                    {tab === 'files' && <FileCode size={15} />}
                    {tab === 'comments' && <MessageSquare size={15} />}
                    {tab}
                    {tab === 'comments' && <span className="text-[10px] bg-white/10 text-white px-1.5 py-0.5 rounded-full">{commentList.length}</span>}
                  </div>
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* TAB CONTAINER CONTENT */}
            <div className="space-y-6">
              
              {/* TABS: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-[#2C394B] p-6 sm:p-8 rounded-2xl border border-[#334756] space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FileCheck2 className="text-blue-400" size={20} />
                        Product Overview
                      </h2>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                        {project.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <h3 className="font-bold text-white text-base mb-3">Key Features & Technical Information</h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-300">
                        <li className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                          <span>Highly structured and documented code logic blueprints.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                          <span>Fully compatible with standard rendering workflows.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                          <span>Low poly models optimized for cross-platform play.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                          <span>Custom texture layouts at 2K & 4K density.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* System & Architecture Blueprint Specs */}
                  <div className="bg-[#2C394B] p-6 rounded-2xl border border-[#334756]">
                    <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                      <Cpu size={18} className="text-blue-400" />
                      Technical Specifications
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                      <div className="bg-black/20 p-3.5 rounded-xl border border-white/5">
                        <div className="text-gray-500 uppercase tracking-wider mb-1">Release Engine</div>
                        <div className="text-white font-bold">{project.engine}</div>
                      </div>
                      <div className="bg-black/20 p-3.5 rounded-xl border border-white/5">
                        <div className="text-gray-500 uppercase tracking-wider mb-1">File System format</div>
                        <div className="text-white font-bold">.ZIP containing package</div>
                      </div>
                      <div className="bg-black/20 p-3.5 rounded-xl border border-white/5">
                        <div className="text-gray-500 uppercase tracking-wider mb-1">Physics Logic</div>
                        <div className="text-white font-bold">RigidBody / Colliders</div>
                      </div>
                      <div className="bg-black/20 p-3.5 rounded-xl border border-white/5">
                        <div className="text-gray-500 uppercase tracking-wider mb-1">Network Ready</div>
                        <div className="text-white font-bold">Yes (Replicated)</div>
                      </div>
                      <div className="bg-black/20 p-3.5 rounded-xl border border-white/5">
                        <div className="text-gray-500 uppercase tracking-wider mb-1">Geometry</div>
                        <div className="text-white font-bold">LOD Ready (Levels 0-3)</div>
                      </div>
                      <div className="bg-black/20 p-3.5 rounded-xl border border-white/5">
                        <div className="text-gray-500 uppercase tracking-wider mb-1">Commercial License</div>
                        <div className="text-white font-bold">Royalty-Free Usage</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TABS: FILES (aligns with project_files database schema) */}
              {activeTab === 'files' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-[#2C394B] p-6 rounded-2xl border border-[#334756]">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-bold text-lg">Downloadable File History</h3>
                        <p className="text-xs text-gray-400">Authentic binaries, blueprints, and assets for {project.title}</p>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#082032] border border-white/10 text-blue-400">
                        {projectFiles.length} Releases available
                      </span>
                    </div>

                    <div className="space-y-3">
                      {projectFiles.map((file) => (
                        <div 
                          key={file.id} 
                          className="bg-black/25 border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-colors"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                              <FileCode size={20} />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-white break-all">{file.fileName}</div>
                              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-400">
                                <span className="px-1.5 py-0.5 rounded bg-white/5 text-gray-300 font-mono text-[10px]">{file.version}</span>
                                <span>•</span>
                                <span>{file.fileSize}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Calendar size={11} /> {file.uploadDate}</span>
                              </div>
                            </div>
                          </div>

                          <div className="w-full sm:w-auto flex-shrink-0">
                            {downloadingFileId === file.id ? (
                              <div className="w-full sm:w-40">
                                <div className="flex justify-between text-[11px] mb-1">
                                  <span className="text-blue-400 font-bold">Downloading...</span>
                                  <span>{downloadProgress}%</span>
                                </div>
                                <div className="w-full bg-[#082032] h-2 rounded-full overflow-hidden">
                                  <div className="bg-blue-500 h-full transition-all duration-200" style={{ width: `${downloadProgress}%` }} />
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleDownload(file.id)}
                                className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                  (project.price > 0 && !isPurchased) 
                                    ? 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                                }`}
                              >
                                <Download size={14} />
                                {(project.price > 0 && !isPurchased) ? 'Purchase Required' : 'Download File'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TABS: COMMENTS (aligns with comments schema) */}
              {activeTab === 'comments' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* Write comment box */}
                  <div className="bg-[#2C394B] p-6 rounded-2xl border border-[#334756]">
                    <h4 className="font-bold text-sm text-gray-200 uppercase tracking-wider mb-4">Post a Project Review</h4>
                    <form onSubmit={handlePostComment} className="space-y-4">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-xs text-gray-400">Your Rating:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              type="button"
                              key={num}
                              onClick={() => setNewRating(num)}
                              className="text-yellow-500 focus:outline-none transition-transform active:scale-125"
                            >
                              <Star size={18} fill={num <= newRating ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-bold text-gray-300 font-mono">({newRating}/5 Stars)</span>
                      </div>
                      
                      <textarea
                        required
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Leave useful feedback, ask structural questions, or discuss features..."
                        className="w-full bg-black/20 border border-white/5 rounded-xl p-3.5 text-sm outline-none focus:border-blue-500/50 transition-all text-white placeholder-gray-500"
                      />
                      
                      <div className="flex justify-between items-center">
                        <p className="text-[11px] text-gray-500">Please review our community guidelines before posting.</p>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <MessageCircle size={14} /> Submit Comment
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* List of comments */}
                  <div className="space-y-4">
                    {commentList.map((comment) => (
                      <div key={comment.id} className="bg-[#2C394B] p-6 rounded-2xl border border-[#334756] space-y-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 overflow-hidden border border-white/10 flex-shrink-0">
                              <img src={comment.profilePicUrl} alt={comment.username} />
                            </div>
                            <div>
                              <div className="font-bold text-sm flex items-center gap-2">
                                {comment.username}
                                {comment.username === project.owner.username && (
                                  <span className="bg-blue-500/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded-full border border-blue-500/30">Developer</span>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                                <Clock size={10} />
                                {comment.createdAt}
                              </div>
                            </div>
                          </div>

                          {comment.rating && (
                            <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-lg border border-yellow-500/20 text-xs font-bold">
                              <Star size={12} fill="currentColor" />
                              {comment.rating}
                            </div>
                          )}
                        </div>

                        <p className="text-gray-300 text-sm leading-relaxed pl-1">
                          {comment.content}
                        </p>

                        <div className="flex items-center gap-4 pt-1 text-xs">
                          <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                            <ThumbsUp size={13} />
                            Helpful ({comment.likes})
                          </button>
                          <span className="text-gray-600">•</span>
                          <button className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                            <MessageSquare size={12} /> Reply
                          </button>
                        </div>

                        {/* Comment Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="pl-6 border-l-2 border-white/5 space-y-4 mt-4 pt-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="space-y-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-slate-700 overflow-hidden border border-white/10">
                                    <img src={reply.profilePicUrl} alt={reply.username} />
                                  </div>
                                  <div>
                                    <div className="font-bold text-xs flex items-center gap-1.5">
                                      {reply.username}
                                      <span className="bg-blue-500/20 text-blue-400 text-[8px] px-1.5 py-0.5 rounded-full">Developer</span>
                                    </div>
                                    <div className="text-[9px] text-gray-400">{reply.createdAt}</div>
                                  </div>
                                </div>
                                <p className="text-gray-300 text-xs leading-relaxed pl-9">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* RIGHT 4 COLUMNS: BUY BOX, DEVELOPER PROFILES & METRICS */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* STICKY CTA CONTAINER */}
            <div className="bg-[#2C394B] p-6 rounded-2xl border border-[#334756] shadow-xl space-y-6 sticky top-24">
              <div>
                <h1 className="text-2xl font-black tracking-tight leading-tight mb-1">{project.title}</h1>
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.genres.map((genre) => (
                    <span key={genre} className="px-2 py-0.5 bg-black/25 rounded-md border border-white/5 text-[9px] text-gray-300 font-semibold tracking-wider uppercase">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Tag with styled banner */}
              <div className="p-4 bg-black/25 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block mb-0.5 uppercase tracking-wider font-bold">Standard Price</span>
                  <span className="text-2xl font-mono font-extrabold text-emerald-400">
                    {project.price === 0 ? 'FREE' : `$${project.price.toFixed(2)}`}
                  </span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-500 justify-end">
                    <Star size={16} fill="currentColor" />
                    <span className="font-extrabold text-sm">{project.ratingAvg}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">({project.ratingCount} reviews)</span>
                </div>
              </div>

              {/* Main Actions */}
              <div className="space-y-3">
                {project.price === 0 ? (
                  <button 
                    onClick={() => handleDownload(projectFiles[0].id)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Download size={18} /> Get It Now
                  </button>
                ) : isPurchased ? (
                  <div className="space-y-2">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                      <Shield size={14} /> You own this asset pack
                    </div>
                    <button 
                      onClick={() => setActiveTab('files')}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2"
                    >
                      <FileCode size={14} /> View File Downloads
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleBuy}
                    disabled={buying}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-blue-900/20 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {buying ? (
                      <span className="animate-pulse">Processing Order...</span>
                    ) : (
                      <>
                        <Wallet size={16} /> Buy Project
                      </>
                    )}
                  </button>
                )}

                <button 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`w-full py-3 rounded-xl border font-bold transition-all text-xs flex items-center justify-center gap-2 ${
                    isWishlisted 
                      ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                  }`}
                >
                  <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
                  {isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
                </button>
              </div>

              {/* Developer Profile card aligning with database schema properties */}
              <div className="pt-6 border-t border-white/5 space-y-4">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold">Asset Creator</span>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-800 overflow-hidden border border-white/10 flex-shrink-0">
                    <img src={project.owner.profilePicUrl} alt={project.owner.username} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white hover:underline cursor-pointer flex items-center gap-1">
                      {project.owner.username}
                      <ExternalLink size={11} className="text-gray-400" />
                    </h4>
                    <p className="text-[11px] text-blue-400 mt-0.5">{project.owner.role || 'Gtemp Verified Creator'}</p>
                  </div>
                </div>
                {project.owner.bio && (
                  <p className="text-xs text-gray-400 italic leading-relaxed">
                    "{project.owner.bio}"
                  </p>
                )}
              </div>

              {/* Sidebar Quick Stats table from schema */}
              <div className="pt-6 border-t border-white/5 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase tracking-wide text-[10px]">Framework</span>
                  <span className="text-gray-200 font-mono font-bold bg-[#082032] px-2 py-0.5 rounded border border-white/5">{project.engine}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase tracking-wide text-[10px]">Total Downloads</span>
                  <span className="text-gray-200 font-mono font-bold">{(project.downloadCount + (isPurchased ? 1 : 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase tracking-wide text-[10px]">Released</span>
                  <span className="text-gray-200 font-mono">{new Date(project.releaseDate).toLocaleDateString()}</span>
                </div>
                {project.lastUpdate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 uppercase tracking-wide text-[10px]">Last Update</span>
                    <span className="text-gray-200 font-mono text-emerald-400 font-bold">{new Date(project.lastUpdate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase tracking-wide text-[10px]">Security Scan</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[10px]">Verified Clean <Shield size={11} /></span>
                </div>
              </div>

              {/* Share layout trigger */}
              <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Project link copied to clipboard!");
                  }}
                  className="w-full py-2 bg-[#082032] hover:bg-[#123149] text-gray-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-white/5"
                >
                  <Share2 size={13} /> Share Asset Link
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans text-white pb-10" style={{ backgroundColor: COLORS.primary }}>
      
      {/* AUTHENTICATION MODAL */}
      {authModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div 
            className="w-full max-w-[400px] rounded-3xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in duration-200"
            style={{ backgroundColor: COLORS.secondary, borderColor: COLORS.accent1 }}
          >
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
                      className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-colors text-white" 
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
                    className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-colors text-white" 
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
                    className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-colors text-white" 
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
                      className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/50 transition-colors text-white" 
                      placeholder="••••••••" 
                      value={authForm.confirmPassword}
                      onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-3.5 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] mt-2 text-sm"
              >
                {authModal.tab === 'login' ? 'Sign In' : 'Join Gtemp'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div 
        className="sticky top-0 z-50 group/header"
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <header className="sticky top-0 z-50 shadow-xl" style={{ backgroundColor: COLORS.secondary }}>
          <div className="max-w-[1800px] mx-auto px-4 h-14 flex items-center justify-between gap-3">
            
            <div onClick={clearProjectNavigation} className="flex items-center gap-2 cursor-pointer flex-shrink-0 transition-all">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-black bg-blue-400 shadow-md shadow-blue-400/20">G</div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Gtemp</span>
            </div>

            <div className="flex-grow flex justify-center min-w-0">
              {activeView === 'Home' && !selectedProject && (
                <div className="w-full max-w-xl relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-white transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search genre, engine, blueprints, creators..."
                    className="w-full pl-9 pr-4 py-2 rounded-full outline-none text-xs transition-all text-white bg-[#082032] border border-[#334756] focus:border-blue-500/50"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {!isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setAuthModal({ isOpen: true, tab: 'login' })}
                    className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => setAuthModal({ isOpen: true, tab: 'register' })}
                    className="px-4 py-2 text-xs font-bold bg-white text-black rounded-full hover:bg-gray-200 transition-all shadow"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <>
                  {activeView === 'Home' && !selectedProject && (
                    <div className="text-[11px] font-medium text-gray-400 hidden lg:block whitespace-nowrap">
                      Found <span className="text-white font-bold">{resultCount}</span> matching assets
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                    <Wallet size={13} className="flex-shrink-0" />
                    <span className="font-mono text-xs font-bold">${currentUser?.walletBalance?.toFixed(2) || '0.00'}</span>
                  </div>

                  <div className="relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-1.5 p-0.5 pr-2.5 rounded-full hover:bg-white/5 transition-all border border-white/5"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-white/10 overflow-hidden">
                        <img 
                          src={currentUser?.profilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username}`}
                          alt="Profile" 
                        />
                      </div>
                      <span className="hidden sm:block text-xs font-bold text-gray-200">
                        {currentUser?.username || 'User'}
                      </span>
                      
                      <ChevronDown size={13} className={`transition-transform text-gray-400 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && ( 
                      <div className="absolute right-0 mt-2 w-52 rounded-xl shadow-2xl border overflow-hidden z-50 p-2" style={{ backgroundColor: COLORS.accent1, borderColor: COLORS.accent2 }}>
                        <div className="px-3 py-2 border-b border-white/5 mb-1 text-xs text-gray-400">
                          Account Menu
                        </div>
                        {profileItems.map((item, i) => (
                          <button 
                            key={i} 
                            onClick={() => {
                              if (item.label === 'Log out') {
                                handleLogout();
                                setActiveView('Home');
                              } else {
                                clearProjectNavigation();
                                setActiveView(item.view ?? 'Home'); 
                                if (item.tab) {
                                  setCollectionTab(item.tab);
                                }
                                setIsProfileOpen(false);
                              }
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-white/5 rounded-lg transition-colors ${item.color || 'text-gray-200 hover:text-white'}`}
                          >
                            {item.icon} {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* REFINED FILTER LINE */}
        {activeView === 'Home' && !selectedProject && (
          <div 
            className={`
              transition-all duration-200 ease-in-out border-b border-white/5 overflow-hidden
              sm:absolute sm:w-full sm:left-0 sm:top-14 sm:z-10
              ${isHeaderHovered ? 'sm:translate-y-0 sm:opacity-100 sm:max-h-12' : 'sm:-translate-y-2 sm:opacity-0 sm:max-h-0 sm:pointer-events-none'}
              max-h-12 opacity-100 translate-y-0 pointer-events-auto
            `} 
            style={{ backgroundColor: COLORS.secondary }}
          >
            <div className="max-w-[1800px] mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar h-12 px-4">
              <Filter size={12} className="text-gray-500 flex-shrink-0 mr-1" />
                {['All', 'Popular', 'Recently Updated', 'Top Rated'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-all ${activeTab === tab ? 'bg-white text-black' : 'hover:bg-white/10 text-gray-300'}`}
                    style={{ border: activeTab === tab ? 'none' : `1px solid ${COLORS.accent1}` }}
                  >
                    {tab}
                  </button>
                ))}

              <div className="h-4 w-[1px] bg-white/10 mx-2 flex-shrink-0" />

              <select 
                className="bg-transparent border rounded-full px-3.5 py-1.5 text-[10px] outline-none cursor-pointer text-gray-300 border-[#334756] focus:border-white/20"
                value={engineFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEngineFilter(e.target.value)}
              >
                <option className="bg-[#1e2736]" value="All">All Frameworks</option>
                <option className="bg-[#1e2736]" value="Unity3D">Unity3D</option>
                <option className="bg-[#1e2736]" value="Unreal">Unreal</option>
                <option className="bg-[#1e2736]" value="Godot">Godot</option>
                <option className="bg-[#1e2736]" value="Roblox Studio">Roblox Studio</option>
              </select>

              <select 
                className="bg-transparent border rounded-full px-3.5 py-1.5 text-[10px] outline-none cursor-pointer text-gray-300 border-[#334756]"
                value={priceSort}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriceSort(e.target.value)}
              >
                <option className="bg-[#1e2736]" value="Any">Sorted Price</option>
                <option className="bg-[#1e2736]" value="High to Low">Price: High to Low</option>
                <option className="bg-[#1e2736]" value="Low to High">Price: Low to High</option>
              </select>

              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <span className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Price Range</span>
                <input 
                  type="number" 
                  placeholder="Min"
                  className="w-14 px-2 py-1 rounded text-[10px] bg-[#082032] border border-[#334756] outline-none"
                  value={minPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMinChange(e.target.value)}
                />
                <input 
                  type="number" 
                  placeholder="Max"
                  className="w-16 px-2 py-1 rounded text-[10px] bg-[#082032] border border-[#334756] outline-none"
                  value={maxPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMaxChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CORE DISPLAY MAIN GRID */}
      <main className="max-w-[1800px] mx-auto px-4 py-8">
        {selectedProject ? (
          <ProjectDetailsView 
            project={selectedProject} 
            onBack={clearProjectNavigation}
          />
        ) : (
          <>
          {activeView === 'Profile' && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2">
              <button onClick={() => setActiveView('Home')} className="mb-4 text-blue-400 text-xs flex items-center gap-1 hover:underline">
                <ArrowLeft size={12} /> Back to Store
              </button>
              <div className="bg-[#2C394B] p-6 rounded-xl border border-[#334756]">
                <h2 className="text-xl font-bold mb-4">Account Settings & Balances</h2>
                <div className="space-y-3 text-sm">
                  <p className="flex justify-between border-b border-white/5 pb-2"><strong>Username:</strong> <span className="text-gray-300">{currentUser?.username}</span></p>
                  <p className="flex justify-between border-b border-white/5 pb-2"><strong>Status:</strong> <span className="text-emerald-400 font-bold">Verified Creator Profile</span></p>
                  <p className="flex justify-between border-b border-white/5 pb-2"><strong>Primary Toolset:</strong> <span className="text-gray-300">Software Engineer & Game Developer</span></p> 
                </div>

                <div className="mt-6 p-4 bg-black/20 rounded-lg border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-[10px] uppercase text-gray-500 font-bold">Your virtual funds</p>
                      <p className="text-xl font-mono text-emerald-400 font-bold">
                        ${currentUser?.walletBalance?.toFixed(2)}
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsAddingFunds(!isAddingFunds)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold transition-all hover:scale-105"
                    >
                      {isAddingFunds ? 'Cancel' : 'Deposit Funds'}
                    </button>
                  </div>
                  {isAddingFunds && (
                    <div className="grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-2">
                      {FUND_OPTIONS.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleAddFunds(amount)}
                          className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95 text-center font-mono"
                        >
                          +${amount}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeView === 'Uploads' && (
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setActiveView('Home')} className="mb-4 text-blue-400 text-xs flex items-center gap-1 hover:underline">
                <ArrowLeft size={12} /> Back to Store
              </button>
              <div className="flex border-b border-white/10 mb-6">
                <button 
                  onClick={() => setEditingProject(null)} 
                  className={`px-6 py-3 text-sm transition-all ${!editingProject ? 'border-b-2 border-white font-bold text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  My Uploads
                </button>
                <button 
                  onClick={() => setEditingProject({} as Project)} 
                  className={`px-6 py-3 text-sm transition-all ${editingProject ? 'border-b-2 border-white font-bold text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Upload New
                </button>
              </div>

              {!editingProject ? (
                <div className="grid gap-2.5">
                  {projects.map(p => (
                    <div key={p.id} className="p-4 bg-[#2C394B] flex justify-between items-center rounded-xl border border-[#334756] hover:border-white/10 transition-all">
                      <div>
                        <span className="font-bold text-sm block">{p.title}</span>
                        <span className="text-xs text-gray-400">{p.engine} • {p.price === 0 ? 'Free' : `$${p.price}`}</span>
                      </div>
                      <button onClick={() => setEditingProject(p)} className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-bold">
                        Edit Details
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#2C394B] p-6 rounded-xl border border-[#334756] space-y-4">
                  <h3 className="font-bold mb-2">{editingProject.id ? 'Modify Upload Asset' : 'Register New Template'}</h3>
                  <input className="w-full bg-black/20 p-3 rounded-lg border border-white/5 text-sm outline-none text-white focus:border-blue-500/50" placeholder="Title of Asset" defaultValue={editingProject.title} />
                  <textarea className="w-full bg-black/20 p-3 rounded-lg border border-white/5 h-32 text-sm outline-none text-white focus:border-blue-500/50" placeholder="Extensive details on use-case..." defaultValue={editingProject.description} />
                  <div className="flex gap-2">
                    <button className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs" onClick={() => { setEditingProject(null); alert("Asset registration simulated successfully!"); }}>Save Package</button>
                    <button onClick={() => setEditingProject(null)} className="px-5 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 font-bold rounded-lg text-xs">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'Collection' && (
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setActiveView('Home')} className="mb-4 text-blue-400 text-xs flex items-center gap-1 hover:underline">
                <ArrowLeft size={12} /> Back to Store
              </button>
              <div className="flex border-b border-white/10 mb-6">
                {['Wishlisted', 'Reviewed', 'Purchased'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setCollectionTab(t)}
                    className={`px-6 py-3 text-sm transition-all ${collectionTab === t ? 'border-b-2 border-white font-bold text-white' : 'text-gray-500'}`}
                  >
                    {t} Projects
                  </button>
                ))}
              </div>
              <div className="bg-[#2C394B] p-6 rounded-xl border border-[#334756] text-center py-12">
                <p className="text-gray-400 text-sm">Displaying your {collectionTab.toLowerCase()} items...</p>
                <button onClick={() => setActiveView('Home')} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white">Browse Marketplace</button>
              </div>
            </div>
          )}

          {activeView === 'Home' && (
            <>
            <div className="mb-6 lg:hidden flex justify-between items-center text-xs">
              <p className="text-gray-400"><span className="text-white font-bold">{resultCount}</span> matching items found</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
              {filteredData.map((project) => (
                <div 
                  key={project.id}
                  onClick={() => navigateToProject(project.id)}
                  className="group rounded-2xl overflow-hidden transition-all hover:-translate-y-1.5 hover:shadow-2xl flex flex-col h-full transform-gpu cursor-pointer bg-[#2C394B] border border-[#334756]"
                  style={{ fontSize: '0.85rem' }}
                >
                  <div className="relative aspect-video bg-slate-800 overflow-hidden">
                    <img 
                      src={`https://picsum.photos/seed/${project.id}/400/225`} 
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider">
                      <HighlightedText text={project.engine.split(' ')[0]} highlight={searchQuery} />
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-grow space-y-2">
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="font-extrabold text-sm leading-tight group-hover:text-blue-400 transition-colors line-clamp-1" title={project.title}>
                        <HighlightedText text={project.title} highlight={searchQuery} />
                      </h3>
                      <div className="text-[11px] font-black font-mono ml-1 flex-shrink-0 text-emerald-400">
                        {project.price === 0 ? 'FREE' : `$${project.price}`}
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-gray-400">
                      by <span className="text-gray-300 font-medium">
                        <HighlightedText text={project.owner?.username || 'Unknown'} highlight={searchQuery} />
                      </span>
                    </p>
                                    
                    <p className="text-[11px] text-gray-400 line-clamp-2 leading-snug opacity-90">
                      {project.description}
                    </p>

                    <div className="mt-auto pt-2">
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-2 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-1">
                          <Download size={11} className="text-gray-500" />
                          {project.downloadCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={11} className="text-yellow-500 fill-yellow-500" />
                          {project.ratingAvg}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {project.genres?.map((g, i) => ( 
                          <span key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] font-bold text-gray-300 border border-white/10 uppercase tracking-wide">
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
                  className="mt-6 px-6 py-2 rounded-full border border-white/20 hover:bg-white/5 transition-all text-xs font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            )}
            </>
          )}
          </>
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

const profileItems: NavItem[] = [
  { icon: <Settings size={14}/>, label: 'Account Profile', view: 'Profile' },
  { icon: <BarChart2 size={14}/>, label: 'Asset Management', view: 'Uploads' },
  { icon: <Heart size={14}/>, label: 'Saved Wishlist', view: 'Collection', tab: 'Wishlisted' },
  { icon: <LogOut size={14}/>, label: 'Log out', color: 'text-red-400 hover:bg-red-500/10' },
];

export default App;