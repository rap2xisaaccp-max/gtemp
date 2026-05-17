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
  // --- Add these new icons required by the updated layout ---
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
  projectId: string;
  userId: string;
  content: string;
  createdAt: string;
  parent?: { id: string } | null;
  replies?: ProjectComment[];
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  color?: string;
  view?: string; // Add this
  tab?: string;  // Add this
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

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  //Profiles menu variables
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
  const API_URL = 'https://gtemp-backend.onrender.com/'; // Change this to your backend URL if different;
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
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    fetchProjects();
  }, [API_URL]);

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

  // FIX: Stable Hash Router that prevents layout/resize resets
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/project/')) {
        const projectId = hash.replace('#/project/', '');
        
        // Prevent layout reflow flashes by checking if the project is already active
        setSelectedProject((prevSelected) => {
          if (prevSelected && String(prevSelected.id) === projectId) {
            return prevSelected; // Returns exact reference context, stopping sub-tab re-mounting
          }
          const match = projects.find(p => String(p.id) === projectId);
          return match || null;
        });
      } else {
        setSelectedProject(null);
      }
    };

    if (projects.length > 0) {
      handleHashNavigation();
    }

    window.addEventListener('hashchange', handleHashNavigation);
    return () => window.removeEventListener('hashchange', handleHashNavigation);
  }, [projects.length]); // Track item array allocation length rather than variable updates

const navigateToProject = (id: string) => {
  window.location.hash = `#/project/${id}`;
};

const clearProjectNavigation = () => {
  window.location.hash = '';
};

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

  const ProjectDetailsView: React.FC<{ project: Project; onBack: () => void }> = ({ project, onBack }) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'files' | 'comments'>('overview');
  
  // Media & Screenshots setup using dynamic random image seeds mapping to the current project
  const screenshots = useMemo(() => [
    `https://picsum.photos/seed/${project.id}-A/1200/675`,
    `https://picsum.photos/seed/${project.id}-B/1200/675`,
    `https://picsum.photos/seed/${project.id}-C/1200/675`,
    `https://picsum.photos/seed/${project.id}-D/1200/675`,
  ], [project.id]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Real Threaded Database Comments State
  const [commentList, setCommentList] = useState<ProjectComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Fetch comments hierarchy from backend API
  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/projects/${project.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setCommentList(data);
      }
    } catch (error) {
      console.error("Failed to sync comments with database:", error);
    }
  };

  // Trigger sync on open or sub-tab switch
  useEffect(() => {
    if (project.id) {
      fetchComments();
    }
  }, [project.id, activeSubTab]);

  // Download & Purchase Simulation State
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPurchased, setIsPurchased] = useState(false);
  const [buying, setBuying] = useState(false);

  // Structural mapping supporting internal files tab
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

  // Handle posting top-level comments or replies directly to database
  const handlePostComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const content = parentId ? replyText : newComment;
    if (!content.trim()) return;

    // Build matching payload for Spring Boot controller
    const payload = {
      projectId: project.id,
      userId: currentUser?.username ? "00000000-0000-0000-0000-000000000000" : "00000000-0000-0000-0000-000000000000", // Default fallback fallback UUID
      content: content,
      parent: parentId ? { id: parentId } : null
    };

    try {
      const response = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (parentId) {
          setReplyText('');
          setReplyingToId(null);
        } else {
          setNewComment('');
        }
        fetchComments(); // Refresh comment tree layout
      } else {
        alert("Could not post comment to remote endpoint.");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  // Recursive UI element for comments and all sub-replies
  const RenderCommentNode = ({ comment, depth = 0 }: { comment: ProjectComment; depth: number }) => (
    <div 
      className="group relative transition-all" 
      style={{ marginLeft: depth > 0 ? `${Math.min(depth * 20, 80)}px` : '0px' }}
    >
      {/* Visual indicator lines for inner nested threads */}
      {depth > 0 && (
        <div className="absolute top-0 bottom-0 border-l border-white/10" style={{ left: '-12px' }} />
      )}

      <div className="bg-black/20 hover:bg-black/30 p-4 rounded-xl border border-white/5 mb-2 transition-all">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
              U
            </div>
            <span className="text-xs font-bold text-gray-300">User_{comment.userId.substring(0, 4)}</span>
            <span className="text-[10px] text-gray-500 font-mono">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <p className="text-gray-300 text-sm whitespace-pre-wrap pl-2 leading-relaxed">{comment.content}</p>
        
        {/* Thread Action Controls */}
        <div className="flex items-center gap-4 mt-2 pl-2">
          <button
            type="button"
            onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
            className="text-[11px] text-gray-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <MessageCircle size={12} />
            Reply
          </button>
        </div>

        {/* Reply Submission Drawer */}
        {replyingToId === comment.id && (
          <div className="mt-3 pl-2 border-l border-blue-500/40">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Post a response thread..."
              className="w-full bg-black/40 text-white rounded-lg p-2 text-xs border border-white/10 focus:outline-none focus:border-blue-500 min-h-[50px]"
            />
            <div className="flex justify-end gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setReplyingToId(null)}
                className="px-2 py-1 text-[10px] text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handlePostComment(e, comment.id)}
                className="px-2.5 py-1 bg-blue-600 text-white font-bold text-[10px] rounded hover:bg-blue-500 transition-all"
              >
                Submit Reply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recursive Deep Interator */}
      {comment.replies && comment.replies.map((reply) => (
        <RenderCommentNode key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto pb-16 animate-in fade-in slide-in-from-bottom-4 duration-300 text-white">
      
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
            <button onClick={prevImage} className="absolute left-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all">
              <ChevronLeft size={24} />
            </button>
            <img src={screenshots[selectedImageIndex]} alt="Enlarged screenshot" className="max-h-[80vh] max-w-full rounded-lg object-contain border border-white/5 shadow-2xl" />
            <button onClick={nextImage} className="absolute right-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all">
              <ChevronRight size={24} />
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-400 font-mono">
            Screenshot {selectedImageIndex + 1} of {screenshots.length}
          </div>
        </div>
      )}

      {/* BREADCRUMB HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button 
          onClick={onBack} 
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all text-xs border border-white/5"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
        </button>
        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
          <span>Marketplace</span>
          <span>/</span>
          <span>{project.engine}</span>
          <span>/</span>
          <span className="text-blue-400">{project.title}</span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Media Showcase, Section Tabs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* CAROUSEL SCREENSHOT CONTAINER */}
          <div className="bg-[#2C394B] rounded-2xl overflow-hidden border border-[#334756] shadow-xl">
            <div className="relative aspect-video w-full bg-slate-900 group">
              <img src={screenshots[selectedImageIndex]} alt={`${project.title} preview`} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setIsLightboxOpen(true)} 
                  className="p-2.5 rounded-lg bg-black/70 hover:bg-black/90 border border-white/10 text-white transition-all shadow-md"
                  title="View fullscreen"
                >
                  <Maximize2 size={16} />
                </button>
              </div>
              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft size={18} />
              </button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* THUMBNAIL TRACK */}
            <div className="p-3 bg-[#1e2736] border-t border-[#334756] flex gap-2.5 overflow-x-auto no-scrollbar">
              {screenshots.map((url, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedImageIndex(i)} 
                  className={`relative w-28 aspect-video rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImageIndex === i ? 'border-blue-500 scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={url} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* HIGH-END NAVIGATION SUB-TABS */}
          <div className="border-b border-[#334756] flex gap-8">
            {(['overview', 'files', 'comments'] as const).map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveSubTab(tab)} 
                className={`pb-4 text-sm font-bold uppercase tracking-wider relative transition-all ${activeSubTab === tab ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB CONDITIONAL RENDERING */}
          {activeSubTab === 'overview' && (
            <div className="bg-[#2C394B] p-8 rounded-2xl border border-[#334756] shadow-md space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <FileCode size={20} className="text-blue-400" /> Project Description
                </h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                  {project.description}
                </p>
              </div>
            </div>
          )}

          {activeSubTab === 'files' && (
            <div className="space-y-3">
              {projectFiles.map((file) => (
                <div key={file.id} className="bg-[#2C394B] border border-[#334756] p-4 rounded-xl flex items-center justify-between hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-black/20 rounded-lg text-blue-400">
                      <FileCheck2 size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-200">{file.fileName}</h4>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
                        <span>Size: <strong className="text-gray-300">{file.fileSize}</strong></span>
                        <span>•</span>
                        <span>Version: <strong className="text-blue-400">{file.version}</strong></span>
                        <span>•</span>
                        <span>Uploaded: {file.uploadDate}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(file.id)}
                    disabled={downloadingFileId !== null}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-2 disabled:bg-white/5 disabled:text-gray-500"
                  >
                    {downloadingFileId === file.id ? (
                      <span>Downloading ({downloadProgress}%)</span>
                    ) : (
                      <>
                        <Download size={14} /> Download
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeSubTab === 'comments' && (
            <div className="space-y-6">
              {/* Top-Level Base Comment Post Form */}
              <form onSubmit={(e) => handlePostComment(e, null)} className="bg-[#2C394B] border border-[#334756] p-5 rounded-xl space-y-4">
                <h3 className="font-bold text-sm text-gray-200 flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-400" /> Discussion Board
                </h3>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience or ask a question about this asset pack..."
                  className="w-full bg-black/20 border border-[#334756] rounded-xl p-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500 min-h-[100px] resize-none"
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all">
                  Post Comment
                </button>
              </form>

              {/* Recursive Iteration Output Track */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {commentList.length === 0 ? (
                  <p className="text-center py-8 text-xs text-gray-500 font-mono">No discussions found on this asset yet.</p>
                ) : (
                  commentList.map((rootComment) => (
                    <RenderCommentNode key={rootComment.id} comment={rootComment} depth={0} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Checkout Action Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#2C394B] p-6 rounded-2xl border border-[#334756] sticky top-24 shadow-xl space-y-6">
            <div>
              <h1 className="text-2xl font-black mb-1.5 tracking-tight">{project.title}</h1>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                Engine Suite: <span className="text-blue-400 font-mono font-bold bg-blue-500/10 px-2 py-0.5 rounded">{project.engine}</span>
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
              <div>
                <span className="text-xs text-gray-400 block font-mono uppercase">Asset Price</span>
                <span className="text-2xl font-mono font-black text-emerald-400">
                  {project.price === 0 ? 'FREE' : `$${project.price.toFixed(2)}`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block font-mono uppercase">Review Matrix</span>
                <div className="flex items-center gap-1 text-yellow-500 font-bold justify-end">
                  <Star size={15} fill="currentColor" />
                  <span className="text-sm">{project.ratingAvg || '0.0'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => {
                  if (project.price > 0 && !isPurchased) {
                    setBuying(true);
                    setTimeout(() => {
                      setBuying(false);
                      setIsPurchased(true);
                      alert(`Mock Success: Authorized transaction for ${project.title}!`);
                    }, 1000);
                  } else {
                    alert("Initializing secure file stream configuration...");
                  }
                }} 
                disabled={buying}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg transform active:scale-[0.98]"
              >
                {buying ? 'Processing Setup...' : (project.price === 0 || isPurchased ? 'Download Package Asset' : 'Purchase Licensing')}
              </button>
              <button onClick={() => setIsWishlisted(!isWishlisted)} className={`w-full py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${isWishlisted ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`} >
                <Bookmark size={14} fill={isWishlisted ? "currentColor" : "none"} /> {isWishlisted ? 'Wishlisted' : 'Add to Catalog Wishlist'}
              </button>
            </div>

            {/* LOWER TECHNICAL SPECS INDEX */}
            <div className="pt-4 border-t border-[#334756] space-y-2.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Vendor Profile</span>
                <span className="text-gray-200 font-bold">@{project.owner?.username || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Traffic Distribution</span>
                <span className="text-gray-200">{(project.downloadCount || 0).toLocaleString()} transfers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Production Launch</span>
                <span className="text-gray-200">{new Date(project.releaseDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
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

  const handleAddFunds = async (amount: number) => {
    if (!currentUser) return;

    try {
      // Replace with your actual endpoint for updating wallet balance
      const response = await fetch(`${API_URL}/api/users/add-funds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send the username and the amount to be added
        body: JSON.stringify({ 
          username: currentUser.username, 
          amount: amount 
        }),
      });

      if (response.ok) {
        const updatedBalance = (currentUser.walletBalance || 0) + amount;
        
        // 1. Update State
        const updatedUser = { ...currentUser, walletBalance: updatedBalance };
        setCurrentUser(updatedUser);

        // 2. Sync with LocalStorage
        const localData = JSON.parse(localStorage.getItem('gtemp_user') || '{}');
        localStorage.setItem('gtemp_user', JSON.stringify({ 
          ...localData, 
          walletBalance: updatedBalance 
        }));

        setIsAddingFunds(false);
        alert(`Successfully added $${amount}.00 to your wallet!`);
      } else {
        const error = await response.text();
        alert("Failed to add funds: " + error);
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Could not connect to the server.");
    }
  };

  const profileItems: NavItem[] = [
  { icon: <Settings size={16}/>, label: 'Customize Profile', view: 'Profile' },
  { icon: <BarChart2 size={16}/>, label: 'Uploads Statistics', view: 'Uploads' },
  { icon: <Heart size={16}/>, label: 'Wishlisted Projects', view: 'Collection', tab: 'Wishlisted' },
  { icon: <Star size={16}/>, label: 'Reviewed Projects', view: 'Collection', tab: 'Reviewed' },
  { icon: <Download size={16}/>, label: 'Purchased Projects', view: 'Collection', tab: 'Purchased' },
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
          <div className="max-w-[1800px] mx-auto px-4 h-11 flex items-center justify-between gap-3">
            
            {/* Logo Section - Hidden on Mobile Width (< 640px) */}
            <div className="hidden sm:flex items-center gap-2 cursor-pointer flex-shrink-0 transition-all">
              <div className="w-7 h-7 rounded flex items-center justify-center font-bold text-sm" style={{ backgroundColor: COLORS.accent2 }}>G</div>
              <span className="text-lg font-bold tracking-tight">Gtemp</span>
            </div>

            {/* Search Box Section - Centered and Expandable */}
            <div className="flex-grow flex justify-center min-w-0">
              {activeView === 'Home' && !selectedProject && (
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
              )}
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
                  {isLoggedIn && activeView === 'Home' && !selectedProject && (
                    <div className="text-[10px] font-medium text-gray-400 hidden lg:block whitespace-nowrap">
                      <span className="text-white font-bold">{resultCount}</span> Results
                    </div>
                  )}
                  
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
                              onClick={() => {
                              if (item.label === 'Log out') {
                                handleLogout();
                                setActiveView('Home');
                              } else {
                                // Use the nullish coalescing operator (??) to provide 'Home' as a fallback
                                clearProjectNavigation();
                                setActiveView(item.view ?? 'Home'); 
                                
                                // Check if item.tab exists before updating the collection tab
                                if (item.tab) {
                                  setCollectionTab(item.tab);
                                }
                                setIsProfileOpen(false);
                              }
                            }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[11px] hover:bg-white/5 rounded ${item.color || ''}`}
                            >
                              {item.icon} {item.label}
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
        {activeView === 'Home' && !selectedProject && (
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
        )}
      </div>

      {/* BODY / PROJECT CARDS */}
      <main className="max-w-[1800px] mx-auto px-4 py-8">
        {selectedProject ? (
          <ProjectDetailsView 
            project={selectedProject} 
            onBack={clearProjectNavigation}
          />
        ) : (
          <>
          {activeView === 'Profile' && (
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setActiveView('Home')} className="mb-4 text-blue-400 text-xs">← Back to Store</button>
              <div className="bg-[#2C394B] p-6 rounded-xl border border-[#334756]">
                <h2 className="text-xl font-bold mb-4">Account Settings</h2>
                <div className="space-y-2">
                  <p><strong>Username:</strong> {currentUser?.username}</p>
                  <p><strong>Email:</strong> {JSON.parse(localStorage.getItem('gtemp_user') || '{}').email || 'No email set'}</p>
                  <p><strong>Bio:</strong> Software Engineer & Full-stack Developer</p> 
                </div>
                {/* Updated Wallet Section in Profile View */}
                <div className="mt-6 p-4 bg-black/20 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-[10px] uppercase text-gray-500 font-bold">Current Balance</p>
                      <p className="text-xl font-mono text-emerald-400">
                        ${currentUser?.walletBalance?.toFixed(2)}
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsAddingFunds(!isAddingFunds)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold transition-colors"
                    >
                      {isAddingFunds ? 'Cancel' : 'Add Funds'}
                    </button>
                  </div>
                  {isAddingFunds && (
                    <div className="grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-2">
                      {FUND_OPTIONS.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleAddFunds(amount)}
                          className="py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold transition-all hover:scale-105 active:scale-95"
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

          {/* 2. UPLOADS STATISTICS VIEW */}
          {activeView === 'Uploads' && (
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setActiveView('Home')} className="mb-4 text-blue-400 text-xs">← Back to Store</button>
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
                <div className="grid gap-2">
                  {projects.filter(p => p.owner?.username === currentUser?.username).map(p => (
                    <div key={p.id} className="p-4 bg-[#2C394B] flex justify-between items-center rounded border border-[#334756]">
                      <span>{p.title} - ${p.price}</span>
                      <button onClick={() => setEditingProject(p)} className="text-blue-400 text-xs">Edit Project</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#2C394B] p-6 rounded-xl border border-[#334756]">
                  <h3 className="font-bold mb-4">{editingProject.id ? 'Edit Project' : 'Upload New Project'}</h3>
                  <input className="w-full bg-black/20 p-2 mb-2 rounded border border-white/5" placeholder="Title" defaultValue={editingProject.title} />
                  <textarea className="w-full bg-black/20 p-2 mb-2 rounded border border-white/5 h-32" placeholder="Description" defaultValue={editingProject.description} />
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-emerald-600 rounded">Save</button>
                    <button onClick={() => setEditingProject(null)} className="px-4 py-2 bg-red-600 rounded">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. COLLECTION VIEWS (Wishlist/Reviewed/Purchased) */}
          {activeView === 'Collection' && (
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setActiveView('Home')} className="mb-4 text-blue-400 text-xs">← Back to Store</button>
              <div className="flex border-b border-white/10 mb-6">
                {['Wishlisted', 'Reviewed', 'Purchased'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setCollectionTab(t)}
                    className={`px-6 py-3 text-sm transition-all ${collectionTab === t ? 'border-b-2 border-white font-bold' : 'text-gray-500'}`}
                  >
                    {t} Projects
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <p className="text-gray-500 text-xs italic">Displaying your {collectionTab.toLowerCase()} items...</p>
              </div>
            </div>
          )}
      

          {activeView === 'Home' && (
            <>
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
                  onClick={() => navigateToProject(project.id)}
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

export default App;
