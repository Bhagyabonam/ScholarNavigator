import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  MessageSquare, 
  Award, 
  FolderKanban, 
  FileText, 
  User, 
  Settings, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Download, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Moon,
  Sun,
  Shield,
  Trash2,
  Calendar as CalendarIcon,
  Bell,
  Sliders,
  Bookmark,
  Users,
  BarChart3,
  LogOut,
  ChevronDown,
  HelpCircle,
  Mail,
  Lock,
  ArrowRight,
  FileCheck
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================
interface StudentProfile {
  name: string;
  email: string;
  phone: string;
  dob: string;
  degree: string;
  year: string;
  college: string;
  university: string;
  branch: string;
  gpa: number;
  percentage: number;
  prevEducation: string;
  family_income: number;
  category: string;
  state: string;
  country: string;
  preferences: string[];
  bio: string;
  achievements: string;
  skills: string;
  projects: string;
}

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: string;
  degree: string;
  branch: string;
  min_gpa: number;
  max_income: number;
  deadline: string;
  required_documents: string[];
  description: string;
  matchPercentage: number;
  category: string;
  country: string;
  benefits: string;
  process: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  customCardType?: 'recommendation' | 'comparison' | 'documents';
  customData?: any;
}

interface Application {
  id: string;
  scholarshipName: string;
  provider: string;
  amount: string;
  stage: 'Not Started' | 'Preparing' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  deadline: string;
}

interface UserDocument {
  id: string;
  name: string;
  status: 'Missing' | 'Uploaded' | 'Verified' | 'Rejected';
  uploadedAt?: string;
}

// ============================================================================
// Database & Mock Data
// ============================================================================
const SCHOLARSHIPS_DATABASE: Scholarship[] = [
  {
    id: "sc-1",
    name: "Google Women Techmakers Scholarship",
    provider: "Google LLC",
    amount: "₹1,50,000",
    degree: "Undergraduate",
    branch: "Computer Science",
    min_gpa: 3.5,
    max_income: 1200000,
    deadline: "2026-09-30",
    required_documents: ["Marks Memo", "Statement of Purpose", "Resume", "Bonafide Certificate"],
    description: "Supports women pursuing computer science degrees globally to become active leaders in technology.",
    matchPercentage: 97,
    category: "Private",
    country: "India",
    benefits: "Tuition coverage, cohort mentoring, access to global networking events.",
    process: "Online resume application, essay review, and virtual coding interview."
  },
  {
    name: "Tata Trust Scholarship for Higher Education",
    id: "sc-2",
    provider: "Tata Trust Foundation",
    amount: "₹80,000",
    degree: "Undergraduate",
    branch: "Any",
    min_gpa: 3.0,
    max_income: 600000,
    deadline: "2026-10-15",
    required_documents: ["Income Certificate", "Statement of Purpose", "Marks Memo"],
    description: "Awarded to undergraduate students with outstanding academic records who are facing financial hardship.",
    matchPercentage: 91,
    category: "Private",
    country: "India",
    benefits: "Financial aid for course books and semester fee subsidies.",
    process: "Direct academic review of marks and home verification check."
  },
  {
    name: "National Merit Fellowship Scheme",
    id: "sc-3",
    provider: "Government of India",
    amount: "₹2,00,000",
    degree: "Graduate",
    branch: "STEM (Data Science)",
    min_gpa: 3.7,
    max_income: 800000,
    required_documents: ["Income Certificate", "Aadhaar Card", "Marks Memo", "Bonafide Certificate"],
    deadline: "2026-11-20",
    description: "National support for students pursuing graduate programs in scientific and research domains.",
    matchPercentage: 92,
    category: "Government",
    country: "India",
    benefits: "Fully funded research stipends and laboratory supplies allowances.",
    process: "Direct merit-list generation based on CGPA and state verification."
  },
  {
    name: "Global Access Education Fund",
    id: "sc-4",
    provider: "Access Alliance",
    amount: "₹1,20,000",
    degree: "Undergraduate",
    branch: "Any",
    min_gpa: 3.0,
    max_income: 450000,
    deadline: "2026-11-01",
    required_documents: ["Income Certificate", "Statement of Purpose", "Passport Photo"],
    description: "Supports low-income undergraduate students to achieve their high education aspirations.",
    matchPercentage: 87,
    category: "International",
    country: "United States",
    benefits: "Travel expenses and partial boarding allowance.",
    process: "Essay review and family income validation checkpoint."
  },
  {
    name: "Microsoft Research Fellowship",
    id: "sc-5",
    provider: "Microsoft Corp",
    amount: "₹2,50,000",
    degree: "Graduate",
    branch: "Computer Science",
    min_gpa: 3.8,
    max_income: 1500000,
    deadline: "2026-12-15",
    required_documents: ["Research proposal", "CV/Resume", "3 LORs"],
    description: "Grant supporting advanced graduate work in machine learning and computer systems research.",
    matchPercentage: 72,
    category: "Private",
    country: "India",
    benefits: "Monthly stipend of ₹20,000, mentorship, and cloud computing credits.",
    process: "Technical review, proposal review, and live presentation panel."
  }
];

export default function App() {
  // Navigation: main states: landing -> login -> onboarding -> app
  const [appState, setAppState] = useState<'landing' | 'login' | 'onboarding' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'explorer' | 'analyzer' | 'tracker' | 'documents' | 'saved' | 'calendar' | 'profile' | 'settings' | 'admin'>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Authentication State
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  // Sign Up form states
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpDegree, setSignUpDegree] = useState("Undergraduate");
  const [signUpBranch, setSignUpBranch] = useState("Computer Science");
  const [signUpYear, setSignUpYear] = useState("3rd Year");
  const [signUpCgpa, setSignUpCgpa] = useState("8.5");
  const [signUpIncome, setSignUpIncome] = useState("450000");
  const [signUpCountry, setSignUpCountry] = useState("India");
  const [signUpState, setSignUpState] = useState("Telangana");
  const [signUpInterests, setSignUpInterests] = useState("Machine Learning");

  // Reusable auth request helper
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const currentToken = token || localStorage.getItem('token');
    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`
    };
    return fetch(url, { ...options, headers });
  };

  // Student Profile State
  const [profile, setProfile] = useState<StudentProfile>({
    name: "Bhaskar",
    email: "bhaskar@university.edu",
    phone: "+91 98765 43210",
    dob: "2004-05-12",
    degree: "Undergraduate",
    year: "3rd Year",
    college: "University College of Engineering",
    university: "State University",
    branch: "Computer Science",
    gpa: 8.7,
    percentage: 82,
    prevEducation: "Intermediate Science (92%)",
    family_income: 450000,
    category: "General",
    state: "Telangana",
    country: "India",
    preferences: ["International Scholarships", "Private Scholarships"],
    bio: "Computer Science student specializing in AI/ML architectures.",
    achievements: "Winner of State Hackathon 2025; Published 1 research paper.",
    skills: "Python, PyTorch, React, SQL, TypeScript",
    projects: "AI Autonomous Agent; Distributed MCP Server Database"
  });

  // Onboarding Wizard Step
  const [onboardingStep, setOnboardingStep] = useState(1);

  // Backend session
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Save / Bookmark state
  const [savedScholarships, setSavedScholarships] = useState<string[]>(["Google Women Techmakers Scholarship"]);

  // Chat conversation
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      role: 'assistant',
      content: "Hello! I've loaded your profile. I can find matching scholarships, generate side-by-side comparison tables, and list your missing documents. Ask me anything!",
      timestamp: "09:00 AM"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  // Explorer State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDegree, setFilterDegree] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterCountry, setFilterCountry] = useState("All");
  const [filterIncome, setFilterIncome] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'match' | 'amount' | 'deadline'>('match');
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  
  // Comparison State
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Document Vault State
  const [documents, setDocuments] = useState<UserDocument[]>([
    { id: "d-1", name: "Income Certificate", status: "Verified", uploadedAt: "2026-07-01" },
    { id: "d-2", name: "Aadhaar Card", status: "Verified", uploadedAt: "2026-07-02" },
    { id: "d-3", name: "Marks Memo", status: "Missing" },
    { id: "d-4", name: "Bonafide Certificate", status: "Uploaded", uploadedAt: "2026-07-04" },
    { id: "d-5", name: "Passport Photo", status: "Uploaded", uploadedAt: "2026-07-04" },
    { id: "d-6", name: "Resume", status: "Verified", uploadedAt: "2026-07-03" },
    { id: "d-7", name: "SOP", status: "Missing" },
    { id: "d-8", name: "LOR", status: "Missing" }
  ]);
  const [isDragging, setIsDragging] = useState(false);

  // Kanban Application Stages
  const [applications, setApplications] = useState<Application[]>([
    { id: "ap-1", scholarshipName: "Google Women Techmakers Scholarship", provider: "Google LLC", amount: "₹1,50,000", stage: "Preparing", deadline: "2026-09-30" },
    { id: "ap-2", scholarshipName: "Tata Trust Scholarship for Higher Education", provider: "Tata Trust Foundation", amount: "₹80,000", stage: "Not Started", deadline: "2026-10-15" }
  ]);

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Google Women Techmakers Scholarship deadline in 2 days!", read: false, time: "2h ago" },
    { id: 2, text: "Your Income Certificate was successfully verified by Agent.", read: false, time: "1d ago" },
    { id: 3, text: "3 new private CS scholarships matching your GPA found.", read: true, time: "3d ago" }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState<{ id: string; text: string; type: 'success' | 'error' | 'info' }[]>([]);

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // Load session on startup
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          if (res.ok) {
            const userData = await res.json();
            setToken(storedToken);
            setProfile({
              name: userData.name || userData.fullName || "Bhaskar",
              email: userData.email || "bhaskar@university.edu",
              phone: userData.phone || userData.phoneNumber || "",
              dob: userData.dob || "2004-05-12",
              degree: userData.degree || "Undergraduate",
              year: userData.year || "3rd Year",
              college: userData.college || "",
              university: userData.university || "",
              branch: userData.branch || "",
              gpa: userData.cgpa || 8.7,
              percentage: userData.percentage || 82,
              prevEducation: userData.prevEducation || "",
              family_income: userData.familyIncome || 450000,
              category: userData.category || "General",
              state: userData.state || "",
              country: userData.country || "India",
              preferences: userData.preferences || [],
              bio: userData.bio || "",
              achievements: userData.achievements || "",
              skills: userData.skills || "",
              projects: userData.projects || "",
              gender: userData.gender || "Male",
              interests: userData.interests || "General CS"
            });
            // Update chat welcome message with real user name
            setMessages([{
              id: "m-1",
              role: 'assistant',
              content: `Hello ${userData.fullName || userData.name}! I've loaded your profile (${userData.branch || 'CS'} Major, GPA: ${userData.cgpa || 8.5}). I can find matching scholarships, generate side-by-side comparison tables, and list your missing documents. Ask me anything!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setAppState('app');
          } else {
            localStorage.removeItem('token');
            setToken(null);
            setAppState('login');
          }
        } catch (err) {
          console.error("Session verification failed", err);
          setAppState('login');
        }
      }
    };
    checkSession();
  }, []);

  // Load user data from MongoDB Atlas when authenticated token changes
  useEffect(() => {
    if (!token) return;

    const loadUserData = async () => {
      try {
        const email = profile.email;

        // 1. Fetch saved bookmarks
        const savedRes = await fetchWithAuth(`/api/saved-scholarships/${email}`);
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setSavedScholarships(savedData.map((item: any) => item.scholarshipId));
        }

        // 2. Fetch applications
        const appsRes = await fetchWithAuth(`/api/applications?userId=${email}`);
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          if (appsData.length > 0) {
            setApplications(appsData.map((item: any) => ({
              id: item._id,
              scholarshipName: item.scholarshipId,
              provider: item.provider || (item.scholarshipId.includes("Google") ? "Google LLC" : "Tata Trust Foundation"),
              amount: item.amount || (item.scholarshipId.includes("Google") ? "₹1,50,000" : "₹80,000"),
              stage: item.status,
              deadline: item.deadline || (item.scholarshipId.includes("Google") ? "2026-09-30" : "2026-10-15")
            })));
          } else {
            // Seed initial applications
            const initialApps = [
              { userId: email, scholarshipId: "Google Women Techmakers Scholarship", status: "Preparing" as const, progress: 80, documentsUploaded: 4, totalDocuments: 5, deadline: "2026-09-30" },
              { userId: email, scholarshipId: "Tata Trust Scholarship for Higher Education", status: "Not Started" as const, progress: 0, documentsUploaded: 0, totalDocuments: 3, deadline: "2026-10-15" }
            ];
            const loadedApps: Application[] = [];
            for (const appItem of initialApps) {
              const res = await fetchWithAuth('/api/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appItem)
              });
              if (res.ok) {
                const data = await res.json();
                loadedApps.push({
                  id: data._id,
                  scholarshipName: data.scholarshipId,
                  provider: data.scholarshipId.includes("Google") ? "Google LLC" : "Tata Trust Foundation",
                  amount: data.scholarshipId.includes("Google") ? "₹1,50,000" : "₹80,000",
                  stage: data.status,
                  deadline: data.deadline || "2026-10-15"
                });
              }
            }
            setApplications(loadedApps);
          }
        }

        // 3. Fetch checklist documents
        const docsRes = await fetchWithAuth('/api/documents');
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          if (docsData.length > 0) {
            setDocuments(docsData.map((item: any) => ({
              id: item._id,
              name: item.documentName,
              status: item.uploaded ? 'Verified' : 'Missing',
              uploadedAt: item.uploadedAt
            })));
          } else {
            const initialDocs = [
              { name: "Income Certificate", status: "Verified" as const },
              { name: "Marks Memo", status: "Missing" as const },
              { name: "Statement of Purpose", status: "Verified" as const },
              { name: "Resume", status: "Verified" as const },
              { name: "Bonafide Certificate", status: "Verified" as const }
            ];
            const loadedDocs: UserDocument[] = [];
            for (const doc of initialDocs) {
              const res = await fetchWithAuth('/api/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  applicationId: "general",
                  documentName: doc.name,
                  uploaded: doc.status === "Verified",
                  fileUrl: doc.status === "Verified" ? "https://example.com/file.pdf" : null
                })
              });
              if (res.ok) {
                const data = await res.json();
                loadedDocs.push({
                  id: data._id,
                  name: data.documentName,
                  status: data.uploaded ? 'Verified' : 'Missing',
                  uploadedAt: data.uploadedAt
                });
              }
            }
            setDocuments(loadedDocs);
          }
        }

        // 4. Fetch notifications
        const notifRes = await fetchWithAuth(`/api/notifications/${email}`);
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          if (notifData.length > 0) {
            setNotifications(notifData.map((item: any) => ({
              id: item._id,
              text: item.message,
              read: item.isRead,
              time: "Today"
            })));
          } else {
            const defaults = [
              { title: "Deadline Warning", message: "Google Women Techmakers Scholarship deadline in 2 days!", isRead: false },
              { title: "Audit Verification", message: "Your Income Certificate was successfully verified by Agent.", isRead: false },
              { title: "New Match", message: "3 new private CS scholarships matching your GPA found.", isRead: true }
            ];
            const loadedNotifs: any[] = [];
            for (const n of defaults) {
              const res = await fetchWithAuth('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: email,
                  title: n.title,
                  message: n.message,
                  isRead: n.isRead
                })
              });
              if (res.ok) {
                const data = await res.json();
                loadedNotifs.push({
                  id: data._id,
                  text: data.message,
                  read: data.isRead,
                  time: "Today"
                });
              }
            }
            setNotifications(loadedNotifs);
          }
        }

      } catch (err) {
        console.error("Error loading user MongoDB data:", err);
      }
    };

    loadUserData();
  }, [token, profile.email]);

  // Sync Dark/Light theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Auto-scroll chat messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ============================================================================
  // App Logic Handlers
  // ============================================================================
  const handleGetStarted = () => {
    if (!token) {
      setAppState('login');
    } else {
      setAppState('app');
    }
  };

  const handleLogin = async (provider: 'google' | 'microsoft' | 'email') => {
    setAuthError(null);
    if (provider === 'google' || provider === 'microsoft') {
      try {
        const mockEmail = "bhagyasribonam@gmail.com";
        const mockName = "Bhagya Sri Lakshmi";
        
        const response = await fetch('/api/auth/social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: mockEmail, name: mockName })
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.access_token);
          setToken(data.access_token);
          
          const user = data.user;
          setProfile({
            name: user.fullName || user.name || "Bhaskar",
            email: user.email || "bhaskar@university.edu",
            phone: user.phoneNumber || user.phone || "",
            dob: user.dob || "2004-05-12",
            degree: user.degree || "Undergraduate",
            year: user.year || "3rd Year",
            college: user.college || "",
            university: user.university || "",
            branch: user.branch || "",
            gpa: user.cgpa || 8.7,
            percentage: user.percentage || 82,
            prevEducation: user.prevEducation || "",
            family_income: user.familyIncome || 450000,
            category: user.category || "General",
            state: user.state || "",
            country: user.country || "India",
            preferences: user.preferences || [],
            bio: user.bio || "",
            achievements: user.achievements || "",
            skills: user.skills || "",
            projects: user.projects || "",
            gender: user.gender || "Male",
            interests: user.interests || "General CS"
          });

          setAppState('app');
          setActiveTab('dashboard');
          addToast(`Welcome, ${user.fullName || user.name}! Logged in via ${provider}.`, "success");
          // Update chat welcome message with real name
          setMessages([{
            id: "m-1",
            role: 'assistant',
            content: `Hello ${user.fullName || user.name}! I've loaded your profile (${user.branch || 'CS'} Major, GPA: ${user.cgpa || 8.5}). I can find matching scholarships, generate side-by-side comparison tables, and list your missing documents. Ask me anything!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        } else {
          addToast(`Failed to authenticate via simulated ${provider}.`, "error");
        }
      } catch (err) {
        addToast("Network error during simulated social login.", "error");
      }
      return;
    }

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        
        const user = data.user;
        setProfile({
          name: user.fullName || user.name || "Bhaskar",
          email: user.email || "bhaskar@university.edu",
          phone: user.phoneNumber || user.phone || "",
          dob: user.dob || "2004-05-12",
          degree: user.degree || "Undergraduate",
          year: user.year || "3rd Year",
          college: user.college || "",
          university: user.university || "",
          branch: user.branch || "",
          gpa: user.cgpa || 8.7,
          percentage: user.percentage || 82,
          prevEducation: user.prevEducation || "",
          family_income: user.familyIncome || 450000,
          category: user.category || "General",
          state: user.state || "",
          country: user.country || "India",
          preferences: user.preferences || [],
          bio: user.bio || "",
          achievements: user.achievements || "",
          skills: user.skills || "",
          projects: user.projects || "",
          gender: user.gender || "Male",
          interests: user.interests || "General CS"
        });

        setAppState('app');
        setActiveTab('dashboard');
        addToast(`Welcome back, ${user.fullName || user.name}! You are logged in.`, "success");
        // Update chat welcome message with real name
        setMessages([{
          id: "m-1",
          role: 'assistant',
          content: `Hello ${user.fullName || user.name}! I've loaded your profile (${user.branch || 'CS'} Major, GPA: ${user.cgpa || 8.5}). I can find matching scholarships, generate side-by-side comparison tables, and list your missing documents. Ask me anything!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        let errMsg = "Authentication failed. Invalid email or password.";
        try {
          const data = await response.json();
          errMsg = data.detail || errMsg;
        } catch (_) {}
        setAuthError(errMsg);
        addToast(errMsg, "error");
      }
    } catch (err) {
      setAuthError("Could not reach authentication server.");
      addToast("Server connection error.", "error");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const payload = {
        fullName,
        email: signUpEmail,
        password: signUpPassword,
        phoneNumber,
        degree: signUpDegree,
        branch: signUpBranch,
        year: signUpYear,
        cgpa: parseFloat(signUpCgpa) || 8.0,
        familyIncome: parseFloat(signUpIncome) || 300000,
        country: signUpCountry,
        state: signUpState,
        interests: signUpInterests
      };
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        addToast("Registration successful! Please login using your credentials.", "success");
        setAuthMode('signin');
        setAuthEmail(signUpEmail);
        // Clear sign up form
        setFullName("");
        setPhoneNumber("");
        setSignUpEmail("");
        setSignUpPassword("");
      } else {
        let errMsg = "Sign up failed. Please check field requirements.";
        try {
          const data = await res.json();
          errMsg = data.detail || errMsg;
        } catch (_) {}
        setAuthError(errMsg);
        addToast(errMsg, "error");
      }
    } catch (err) {
      setAuthError("Failed to reach server during sign up.");
      addToast("Connection error during registration.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setAppState('login');
    setAuthEmail("");
    setAuthPassword("");
    addToast("Logged out successfully.", "info");
  };

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
  };

  const handleOnboardingNext = async () => {
    if (onboardingStep < 6) {
      setOnboardingStep(prev => prev + 1);
    } else {
      // Sync complete profile to MongoDB on final step
      try {
        const payload = {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          dob: profile.dob,
          degree: profile.degree,
          year: profile.year,
          college: profile.college,
          university: profile.university,
          branch: profile.branch,
          cgpa: profile.gpa,
          percentage: profile.percentage,
          prevEducation: profile.prevEducation,
          familyIncome: profile.family_income,
          category: profile.category,
          gender: profile.gender || "Male",
          interests: profile.interests || "General CS",
          preferences: profile.preferences,
          bio: profile.bio,
          achievements: profile.achievements,
          skills: profile.skills,
          projects: profile.projects
        };
        await fetchWithAuth('/api/users', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setAppState('app');
        addToast("Profile created! AI scholarship models matched.", "success");
      } catch (err) {
        addToast("Failed to save profile in MongoDB.", "error");
      }
    }
  };

  const handleOnboardingPrev = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(prev => prev - 1);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const payload = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        dob: profile.dob,
        degree: profile.degree,
        year: profile.year,
        college: profile.college,
        university: profile.university,
        branch: profile.branch,
        cgpa: profile.gpa,
        percentage: profile.percentage,
        prevEducation: profile.prevEducation,
        familyIncome: profile.family_income,
        category: profile.category,
        gender: profile.gender || "Male",
        interests: profile.interests || "General CS",
        preferences: profile.preferences,
        bio: profile.bio,
        achievements: profile.achievements,
        skills: profile.skills,
        projects: profile.projects
      };
      const res = await fetchWithAuth('/api/users', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        addToast("Profile changes saved to MongoDB Atlas!", "success");
      }
    } catch (err) {
      addToast("Failed to save profile changes to database.", "error");
    }
  };

  const toggleSaveScholarship = async (name: string) => {
    const isSaved = savedScholarships.includes(name);
    try {
      if (isSaved) {
        await fetchWithAuth(`/api/saved-scholarships?userId=${encodeURIComponent(profile.email)}&scholarshipId=${encodeURIComponent(name)}`, {
          method: 'DELETE'
        });
        setSavedScholarships(prev => prev.filter(n => n !== name));
        addToast("Scholarship removed from bookmarks.", "success");
      } else {
        await fetchWithAuth('/api/saved-scholarships', {
          method: 'POST',
          body: JSON.stringify({ userId: profile.email, scholarshipId: name })
        });
        setSavedScholarships(prev => [...prev, name]);
        addToast("Scholarship bookmarked!", "success");
      }
    } catch (err) {
      addToast("Failed to sync bookmark with MongoDB.", "error");
    }
  };

  const handleApplyNow = async (scholarship: Scholarship) => {
    const exists = applications.find(a => a.scholarshipName === scholarship.name);
    if (exists) {
      setActiveTab('tracker');
      return;
    }
    const newAppPayload = {
      userId: profile.email,
      scholarshipId: scholarship.name,
      status: 'Preparing' as const,
      progress: 0,
      documentsUploaded: 0,
      totalDocuments: scholarship.required_documents ? scholarship.required_documents.length : 3
    };
    try {
      const res = await fetchWithAuth('/api/applications', {
        method: 'POST',
        body: JSON.stringify(newAppPayload)
      });
      if (res.ok) {
        const savedApp = await res.json();
        setApplications(prev => [...prev, {
          id: savedApp._id,
          scholarshipName: savedApp.scholarshipId,
          provider: scholarship.provider,
          amount: scholarship.amount,
          stage: 'Preparing',
          deadline: scholarship.deadline
        }]);
        setActiveTab('tracker');
        addToast(`Added ${scholarship.name} to application tracker.`, "success");
      }
    } catch (err) {
      addToast("Failed to create application in MongoDB.", "error");
    }
  };

  // Drag and Drop Upload Handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const matchedIdx = documents.findIndex(d => 
        file.name.toLowerCase().includes(d.name.toLowerCase().split(" ")[0]) || 
        d.status === "Missing"
      );
      if (matchedIdx !== -1) {
        const docToUpdate = documents[matchedIdx];
        try {
          const res = await fetchWithAuth(`/api/documents/${docToUpdate.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              uploaded: true,
              fileUrl: `https://scholar-navigator-vault.s3.amazonaws.com/${encodeURIComponent(file.name)}`
            })
          });
          if (res.ok) {
            const updated = [...documents];
            updated[matchedIdx] = {
              ...updated[matchedIdx],
              status: 'Uploaded',
              uploadedAt: new Date().toISOString().split('T')[0]
            };
            setDocuments(updated);
            addToast(`Uploaded: ${file.name} mapped to ${documents[matchedIdx].name}`, "success");
          }
        } catch (err) {
          addToast("Failed to upload document status to MongoDB.", "error");
        }
      } else {
        addToast(`Uploaded file: ${file.name}`, "info");
      }
    }
  };

  // Handle file selection (from input click or drop)
  const handleFileUpload = async (file: File, targetDocId?: string) => {
    // Find the matching document — prefer explicit target, then name-match, then first Missing
    let matchedIdx = -1;
    if (targetDocId) {
      matchedIdx = documents.findIndex(d => d.id === targetDocId);
    } else {
      matchedIdx = documents.findIndex(d =>
        file.name.toLowerCase().includes(d.name.toLowerCase().split(' ')[0].toLowerCase())
      );
      if (matchedIdx === -1) matchedIdx = documents.findIndex(d => d.status === 'Missing');
      if (matchedIdx === -1) matchedIdx = 0;
    }
    const docToUpdate = documents[matchedIdx];
    setUploadingDocId(docToUpdate.id);
    try {
      // Optimistically update UI immediately
      const updated = [...documents];
      updated[matchedIdx] = {
        ...updated[matchedIdx],
        status: 'Uploaded',
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      setDocuments(updated);
      addToast(`✅ "${file.name}" uploaded as ${docToUpdate.name}`, 'success');

      // Persist to MongoDB if document has a real DB id
      if (docToUpdate.id.startsWith('d-')) {
        await fetchWithAuth(`/api/documents/${docToUpdate.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            uploaded: true,
            fileUrl: `vault://${encodeURIComponent(file.name)}`
          })
        });
      }
    } catch (err) {
      addToast('Upload saved locally — could not sync to database.', 'warning');
    } finally {
      setUploadingDocId(null);
    }
  };

  // Click-to-browse: open file picker for a specific document
  const handleBrowseClick = (docId?: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.dataset.targetDoc = docId || '';
      fileInputRef.current.click();
    }
  };

  // Hidden input onChange
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const targetDocId = fileInputRef.current?.dataset.targetDoc || undefined;
      handleFileUpload(file, targetDocId);
    }
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  // Chat message send handler
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatInput("");

    // Add user message
    setMessages(prev => [...prev, {
      id: `m-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setIsTyping(true);

    // Dynamic NLP mocks for dashboard interactivity if API lacks specific comparison tools
    const textLower = userText.toLowerCase();
    
    // Simulate API delay
    setTimeout(async () => {
      let botResponse = "";
      let customCardType: Message['customCardType'];
      let customData: any;

      if (textLower.includes("cs") || textLower.includes("computer science") || textLower.includes("recommend")) {
        botResponse = "I have queried the database for Computer Science scholarships. Here is the matching list:";
        customCardType = "recommendation";
        customData = SCHOLARSHIPS_DATABASE.filter(s => s.branch === "Computer Science" || s.branch === "Any");
      } else if (textLower.includes("compare") || textLower.includes("first and second")) {
        botResponse = "Sure, I have generated a side-by-side comparison matrix for the Google and Tata trust scholarships:";
        customCardType = "comparison";
        customData = [SCHOLARSHIPS_DATABASE[0], SCHOLARSHIPS_DATABASE[1]];
      } else if (textLower.includes("missing") || textLower.includes("document")) {
        botResponse = "Checking your document vault. You have 3 missing required documents:";
        customCardType = "documents";
        customData = documents.filter(d => d.status === "Missing");
      } else {
        // Call FastAPI
        try {
          const response = await fetch('/api/scholarship/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, message: userText })
          });
          const data = await response.json();
          if (response.ok) {
            if (data.session_id) setSessionId(data.session_id);
            botResponse = data.response;
          } else {
            botResponse = "I connected to the backend, but the agent was unable to execute the query. Please retry in a few seconds.";
          }
        } catch (err) {
          botResponse = `Based on your profile, you are a strong candidate for **${SCHOLARSHIPS_DATABASE[0].name}** (Match: 97%) and **${SCHOLARSHIPS_DATABASE[2].name}** (Match: 92%). I recommend completing your Marks Memo upload to lock in eligibility.`;
        }
      }

      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `m-bot-${Date.now()}`,
        role: 'assistant',
        content: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        customCardType,
        customData
      }]);
    }, 1200);
  };

  // Start new chat session
  const handleNewChatSession = () => {
    setSessionId(null);
    setMessages([
      {
        id: `m-init-${Date.now()}`,
        role: 'assistant',
        content: "New navigation session started. How can I help you find and apply for funding opportunities today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    addToast("New session initialized", "info");
  };

  // Application status updating
  const updateApplicationStatus = (id: string, stage: Application['stage']) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, stage } : app
    ));
    addToast(`Status updated to ${stage}`, "success");
  };

  // PDF Download report Markdown compilation
  const handleDownloadReport = () => {
    const textReport = `
# Scholarship Navigator - Personal Match Report
--------------------------------------------------
Student Profile:
Name: ${profile.name}
Degree Level: ${profile.degree}
Branch/Major: ${profile.branch}
GPA: ${profile.gpa}
Family Income: $${profile.family_income}
--------------------------------------------------
RECOMMENDED OPPORTUNITIES:
${SCHOLARSHIPS_DATABASE.map((s, idx) => `
${idx + 1}. ${s.name} (${s.provider})
   - Amount: ${s.amount}
   - Match Level: ${s.matchPercentage}%
   - Deadline: ${s.deadline}
   - Required Documents: ${s.required_documents.join(", ")}
   - Description: ${s.description}
`).join('\n')}
--------------------------------------------------
REQUIRED DOCUMENT CHECKLIST:
${documents.map(d => `[${d.status === 'Verified' ? 'X' : d.status === 'Uploaded' ? '/' : ' '}] ${d.name} (${d.status})`).join('\n')}
--------------------------------------------------
AI INSIGHTS:
- Your ${profile.gpa} GPA makes you eligible for 85% of merit scholarships.
- Income criteria unlocks 12 need-based scholarships.
- Uploading remaining documents will increase application readiness to 100%.
--------------------------------------------------
Report generated on: ${new Date().toLocaleDateString()}
`;
    const blob = new Blob([textReport], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${profile.name}_scholarship_report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Checklist report downloaded!", "success");
  };

  // ============================================================================
  // Explorer Filtering & Sorting
  // ============================================================================
  const filteredScholarships = SCHOLARSHIPS_DATABASE.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDegree = filterDegree === "All" || s.degree === filterDegree;
    const matchesCategory = filterCategory === "All" || s.category === filterCategory;
    const matchesCountry = filterCountry === "All" || s.country === filterCountry;
    const matchesIncome = filterIncome === '' || profile.family_income <= s.max_income;
    return matchesSearch && matchesDegree && matchesCategory && matchesCountry && matchesIncome;
  }).sort((a, b) => {
    if (sortBy === 'match') return b.matchPercentage - a.matchPercentage;
    if (sortBy === 'amount') {
      const amtA = parseInt(a.amount.replace(/[^0-9]/g, ''));
      const amtB = parseInt(b.amount.replace(/[^0-9]/g, ''));
      return amtB - amtA;
    }
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors duration-200`}>
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border transition-all duration-300 transform translate-y-0 ${
              t.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' :
              t.type === 'error' ? 'bg-rose-950/80 border-rose-500/30 text-rose-300' :
              'bg-slate-900/95 border-indigo-500/30 text-indigo-300'
            }`}
          >
            {t.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{t.text}</span>
          </div>
        ))}
      </div>

      {/* ======================================================================
          1. LANDING PAGE
          ====================================================================== */}
      {appState === 'landing' && (
        <div className="flex-1 flex flex-col">
          {/* Landing Header */}
          <header className="px-8 py-5 flex items-center justify-between border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="font-bold text-white text-lg leading-tight">ScholarNavigator</h1>
            </div>
            <button 
              onClick={handleGetStarted}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/20 text-white rounded-xl font-bold text-sm transition-all"
            >
              Get Started
            </button>
          </header>

          {/* Hero Section */}
          <section className="px-8 py-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 text-left">
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-400 self-start uppercase tracking-wider">Agents for Good Track</span>
              <h2 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight">
                Find the Best <br />
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Scholarships</span> in Minutes.
              </h2>
              <p className="text-slate-400 text-md leading-relaxed max-w-xl">
                Scholarship Navigator uses secure, multi-agent AI workflows to map student profiles directly to active state database listings. It validates eligibility benchmarks and organizes document checklists instantly.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <button 
                  onClick={handleGetStarted}
                  className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-600/20 text-white rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all active:scale-95"
                >
                  Get Started Now <ArrowRight className="w-4 h-4" />
                </button>
                <a 
                  href="#features"
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl font-bold text-sm transition-all text-center"
                >
                  Explore Features
                </a>
              </div>
            </div>
            {/* Hero Illustration */}
            <div className="relative flex justify-center items-center">
              <div className="absolute w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
              <div className="glass-panel p-8 rounded-3xl w-full max-w-md border-slate-800 shadow-2xl relative">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">Google Women Techmakers</h3>
                <p className="text-xs text-slate-500 mb-6">Provided by Google LLC</p>
                <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <div>
                    <span className="text-[10px] text-slate-500 block">AMOUNT</span>
                    <span className="text-md font-bold text-emerald-400">₹1,50,000</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">AI MATCH</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-bold">97% Match</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Bar */}
          <section className="bg-slate-900/40 border-y border-slate-900 py-10">
            <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-extrabold text-white">20,000+</p>
                <span className="text-xs text-slate-500 mt-1 block">Active Scholarships Listed</span>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-white">₹500 Crore</p>
                <span className="text-xs text-slate-500 mt-1 block">Total Disbursed Opportunities</span>
              </div>
              <div>
                <p className="text-4xl font-extrabold text-white">10,000+</p>
                <span className="text-xs text-slate-500 mt-1 block">Successful Applicants Helped</span>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section id="features" className="px-8 py-20 max-w-7xl mx-auto text-center">
            <h3 className="text-3xl font-extrabold text-white mb-2">AI-Driven Capabilities</h3>
            <p className="text-slate-400 text-sm mb-12">Intelligent sub-agents work in coordination to secure your financial aid.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "AI Scholarship Search", desc: "Automated database discovery querying matching degree levels and courses.", icon: Search },
                { title: "Eligibility Prediction", desc: "Instantly checks academic requirements and income threshold conditions.", icon: TrendingUp },
                { title: "Personalized Checklist", desc: "Sub-agents compile checklist files and transcripts required for matching.", icon: FileCheck },
                { title: "Application Tracker", desc: "Tracks active application progress across 5 stages in Kanban boards.", icon: FolderKanban },
                { title: "Document Vault Manager", desc: "Verify Aadhar, Income, LOR, and Marks memos with drag-and-drop uploads.", icon: FileText },
                { title: "Deadline Reminders", desc: "Automatic reminders for upcoming close dates and interview tasks.", icon: CalendarIcon }
              ].map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div key={i} className="glass-panel p-6 rounded-2xl text-left border-slate-800">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h4 className="font-bold text-white text-md mb-2">{feat.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Testimonials */}
          <section className="px-8 py-20 bg-slate-900/20 text-center">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-extrabold text-white mb-10">Student Success Stories</h3>
              <div className="glass-panel p-8 rounded-2xl border-slate-800 text-left">
                <p className="text-slate-300 italic mb-6">
                  "Scholarship Navigator helped me identify and apply for the Google Women Techmakers Grant in less than 10 minutes. The automated document manager kept track of all my transcripts and recommendation letters, taking away all the stress!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400">P</div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Pragathi Rao</h4>
                    <span className="text-[10px] text-slate-500">B.Tech CS Student</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Accordion */}
          <section className="px-8 py-20 max-w-4xl mx-auto">
            <h3 className="text-3xl font-extrabold text-white text-center mb-10">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {[
                { q: "How does the AI determine my eligibility score?", a: "The Search and Eligibility sub-agents analyze your academic GPA, family income bounds, and major against scholarship rules in our MCP databases, matching parameters to give an exact match percentage." },
                { q: "Are the scholarship databases regularly updated?", a: "Yes, our MCP server retrieves database records which reflect state, private, and global scholarship opportunities updated for the current academic session." },
                { q: "Is my personal document vault secure?", a: "Absolutely. All PII data is scrubbed at our Security Checkpoint node before processing, keeping your transcripts and certificates isolated." }
              ].map((faq, i) => (
                <div key={i} className="glass-panel p-6 rounded-xl border-slate-805 text-left">
                  <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-indigo-400" /> {faq.q}</h4>
                  <p className="text-xs text-slate-550 leading-relaxed pl-6">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ======================================================================
          2. AUTHENTICATION (LOGIN) PAGE
          ====================================================================== */}
      {appState === 'login' && (
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="glass-panel p-8 rounded-2xl w-full max-w-lg border-slate-800 shadow-2xl relative">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                {authMode === 'signin' ? 'Sign In to Scholarship Navigator' : 'Create Student Account'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {authMode === 'signin' ? 'Unlock ₹500 Crore in financial opportunities using multi-agent AI' : 'Configure your matching parameters for live agent audits'}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs text-center font-bold">
                ⚠️ {authError}
              </div>
            )}

            {authMode === 'signin' ? (
              <div className="space-y-4">
                {/* Social Logins */}
                <button 
                  onClick={() => handleLogin('google')}
                  className="w-full py-2.5 px-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 text-slate-200 text-sm font-semibold flex items-center justify-center gap-3 transition-colors"
                >
                  <span className="text-lg">🌐</span> Sign in with Google
                </button>
                <button 
                  onClick={() => handleLogin('microsoft')}
                  className="w-full py-2.5 px-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 text-slate-200 text-sm font-semibold flex items-center justify-center gap-3 transition-colors"
                >
                  <span className="text-lg">❖</span> Sign in with Microsoft
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-slate-800"></div>
                  <span className="px-3 text-[10px] text-slate-500 uppercase tracking-widest">or</span>
                  <div className="flex-1 border-t border-slate-800"></div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleLogin('email'); }} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                      <input
                        type="email"
                        placeholder="name@university.edu"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-2">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-600/20 text-white rounded-xl font-bold text-sm active:scale-95 transition-all"
                  >
                    Sign In
                  </button>
                </form>

                <div className="text-center mt-6 border-t border-slate-900 pt-4">
                  <span className="text-xs text-slate-550">New to Scholarship Navigator? </span>
                  <button 
                    onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                    className="text-xs text-indigo-400 hover:underline font-bold"
                  >
                    Create an account
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="Bhaskar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1.5">Email Address</label>
                    <input
                      type="email"
                      placeholder="bhaskar@university.edu"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1.5">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1.5">Degree Level</label>
                    <select
                      value={signUpDegree}
                      onChange={(e) => setSignUpDegree(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1.5">Academic Major</label>
                    <input
                      type="text"
                      placeholder="Computer Science"
                      value={signUpBranch}
                      onChange={(e) => setSignUpBranch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1.5">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="8.5"
                      value={signUpCgpa}
                      onChange={(e) => setSignUpCgpa(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1.5">Family Annual Income (₹)</label>
                    <input
                      type="number"
                      placeholder="450000"
                      value={signUpIncome}
                      onChange={(e) => setSignUpIncome(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1.5">Country</label>
                    <input
                      type="text"
                      value={signUpCountry}
                      onChange={(e) => setSignUpCountry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-semibold mb-1.5">State</label>
                    <input
                      type="text"
                      value={signUpState}
                      onChange={(e) => setSignUpState(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1.5">Interests / Focus Area</label>
                  <input
                    type="text"
                    placeholder="Machine Learning, Cybersecurity, Research Grants"
                    value={signUpInterests}
                    onChange={(e) => setSignUpInterests(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-600/20 text-white rounded-xl font-bold text-sm active:scale-95 transition-all"
                >
                  Create Account
                </button>

                <div className="text-center mt-4 border-t border-slate-900 pt-3">
                  <span className="text-xs text-slate-550">Already have a student account? </span>
                  <button 
                    type="button"
                    onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                    className="text-xs text-indigo-400 hover:underline font-bold"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================================
          3. ONBOARDING WIZARD
          ====================================================================== */}
      {appState === 'onboarding' && (
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="glass-panel p-8 rounded-2xl w-full max-w-2xl border-slate-800 shadow-2xl relative flex flex-col justify-between min-h-[450px]">
            {/* Step progress bar */}
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-white text-lg">Onboarding Profile Wizard</h3>
                <p className="text-[10px] text-slate-550">Configure your student record for multi-agent matching</p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-indigo-500/10 rounded-lg text-indigo-300 font-bold">Step {onboardingStep} of 6</span>
            </div>

            {/* Wizard Steps Form */}
            <div className="flex-1 py-4">
              
              {/* Step 1: Personal Details */}
              {onboardingStep === 1 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-md mb-2">Step 1: Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={profile.name} 
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">Email</label>
                      <input 
                        type="email" 
                        value={profile.email} 
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">Phone Number</label>
                      <input 
                        type="text" 
                        value={profile.phone} 
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">Date of Birth</label>
                      <input 
                        type="date" 
                        value={profile.dob} 
                        onChange={(e) => setProfile({...profile, dob: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Academic Information */}
              {onboardingStep === 2 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-md mb-2">Step 2: Academic Institute</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">Degree level</label>
                      <select 
                        value={profile.degree} 
                        onChange={(e) => setProfile({...profile, degree: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                      >
                        <option value="Undergraduate">Undergraduate (B.Tech / B.Sc / BA)</option>
                        <option value="Graduate">Graduate (M.Tech / M.Sc / PhD)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">Year of Study</label>
                      <input 
                        type="text" 
                        value={profile.year} 
                        onChange={(e) => setProfile({...profile, year: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">College Name</label>
                      <input 
                        type="text" 
                        value={profile.college} 
                        onChange={(e) => setProfile({...profile, college: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">Affiliated University</label>
                      <input 
                        type="text" 
                        value={profile.university} 
                        onChange={(e) => setProfile({...profile, university: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Education Benchmarks */}
              {onboardingStep === 3 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-md mb-2">Step 3: Academic Branch & Marks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">Branch / Major</label>
                      <input 
                        type="text" 
                        value={profile.branch} 
                        onChange={(e) => setProfile({...profile, branch: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">Cumulative GPA / CGPA (on 10 pt scale)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={profile.gpa} 
                        onChange={(e) => setProfile({...profile, gpa: parseFloat(e.target.value)})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">Equivalent Marks Percentage (%)</label>
                      <input 
                        type="number" 
                        value={profile.percentage} 
                        onChange={(e) => setProfile({...profile, percentage: parseInt(e.target.value)})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">Previous Education Details</label>
                      <input 
                        type="text" 
                        value={profile.prevEducation} 
                        onChange={(e) => setProfile({...profile, prevEducation: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Financial */}
              {onboardingStep === 4 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-md mb-2">Step 4: Financial & Geography</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">Annual Family Income (₹)</label>
                      <input 
                        type="number" 
                        value={profile.family_income} 
                        onChange={(e) => setProfile({...profile, family_income: parseInt(e.target.value)})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">Reservation Category</label>
                      <select 
                        value={profile.category} 
                        onChange={(e) => setProfile({...profile, category: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none"
                      >
                        <option value="General">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">Resident State</label>
                      <input 
                        type="text" 
                        value={profile.state} 
                        onChange={(e) => setProfile({...profile, state: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 font-semibold mb-2">Country</label>
                      <input 
                        type="text" 
                        value={profile.country} 
                        onChange={(e) => setProfile({...profile, country: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Preferences */}
              {onboardingStep === 5 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-white text-md mb-2">Step 5: Funding Interests</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {["Government Scholarships", "Private Scholarships", "International Scholarships", "Research Grants"].map(pref => {
                      const exists = profile.preferences.includes(pref);
                      return (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => {
                            setProfile(prev => ({
                              ...prev,
                              preferences: exists 
                                ? prev.preferences.filter(p => p !== pref) 
                                : [...prev.preferences, pref]
                            }));
                          }}
                          className={`p-4 rounded-xl border text-left text-xs font-bold transition-all ${
                            exists 
                              ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300' 
                              : 'bg-slate-950 border-slate-850 text-slate-400'
                          }`}
                        >
                          {pref}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 6: Review & Submit */}
              {onboardingStep === 6 && (
                <div className="space-y-4 text-left">
                  <h4 className="font-bold text-white text-md mb-4 border-b border-slate-800 pb-2">Step 6: Review Scholarship Profile</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/80 p-4 rounded-xl border border-slate-900 leading-relaxed">
                    <p><span className="text-slate-500">Name:</span> <strong className="text-slate-200">{profile.name}</strong></p>
                    <p><span className="text-slate-500">Degree:</span> <strong className="text-slate-200">{profile.degree}</strong></p>
                    <p><span className="text-slate-500">Major:</span> <strong className="text-slate-200">{profile.branch}</strong></p>
                    <p><span className="text-slate-500">GPA / Percentage:</span> <strong className="text-slate-200">{profile.gpa} ({profile.percentage}%)</strong></p>
                    <p><span className="text-slate-500">Annual Income:</span> <strong className="text-slate-200">₹{profile.family_income.toLocaleString()}</strong></p>
                    <p><span className="text-slate-500">Category / State:</span> <strong className="text-slate-200">{profile.category} · {profile.state}</strong></p>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="flex gap-4 border-t border-slate-800 pt-4 mt-6">
              {onboardingStep > 1 && (
                <button
                  onClick={handleOnboardingPrev}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-sm font-semibold transition-all"
                >
                  Previous
                </button>
              )}
              <button
                onClick={handleOnboardingNext}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold active:scale-95 transition-all"
              >
                {onboardingStep === 6 ? "Confirm & Finalize" : "Next Step"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          4. MAIN APP LAYOUT (DASHBOARD & CHAT & EXPLORER ETC)
          ====================================================================== */}
      {appState === 'app' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-72 border-r border-slate-900 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between p-6">
            <div className="flex flex-col gap-6">
              {/* Brand Logo */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <GraduationCap className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-white text-md leading-tight">ScholarNavigator</h1>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Multi-Agent System</span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="flex flex-col gap-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'chat', label: 'Chat Assistant', icon: MessageSquare },
                  { id: 'explorer', label: 'Scholarships Explorer', icon: Award },
                  { id: 'analyzer', label: 'Eligibility Analyzer', icon: Sliders },
                  { id: 'tracker', label: 'Application Tracker', icon: FolderKanban },
                  { id: 'documents', label: 'Document Vault', icon: FileText },
                  { id: 'saved', label: 'Saved Scholarships', icon: Bookmark },
                  { id: 'calendar', label: 'Calendar Schedule', icon: CalendarIcon },
                  { id: 'profile', label: 'Student Profile', icon: User },
                  { id: 'settings', label: 'Settings & Themes', icon: Settings },
                  { id: 'admin', label: 'Admin Analytics', icon: BarChart3 }
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id as any)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive 
                          ? 'bg-indigo-650/15 border-l-4 border-indigo-500 text-white font-extrabold' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* User Details Footer */}
            <div className="border-t border-slate-900 pt-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-extrabold text-indigo-300">
                  {profile.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-extrabold text-white truncate">{profile.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{profile.branch} Major</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full py-2 bg-slate-900 hover:bg-rose-950/20 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-rose-400 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout Session
              </button>
            </div>
          </aside>

          {/* Core Panel Content */}
          <main className="flex-1 overflow-y-auto flex flex-col bg-slate-950">
            
            {/* Main Application Header */}
            <header className="border-b border-slate-900 px-8 py-4 flex justify-between items-center bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
              <div>
                <h2 className="text-xl font-extrabold text-white capitalize">{activeTab.replace("_", " ")} Page</h2>
                <p className="text-[10px] text-slate-500">Student Profile Match pool contains {filteredScholarships.length} active opportunities.</p>
              </div>

              {/* Utility Header Actions */}
              <div className="flex items-center gap-3 relative">
                
                {/* Notification Dropdown toggler */}
                <button 
                  onClick={() => setShowNotifications(prev => !prev)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 relative transition-colors"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
                  )}
                </button>

                {/* Notifications Menu */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-850 rounded-2xl p-4 shadow-2xl z-30">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider mb-3">Notification Center</h4>
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-xs">
                          <p className="text-slate-300 leading-normal">{n.text}</p>
                          <span className="text-[9px] text-slate-500 mt-1 block">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleDownloadReport}
                  className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/10"
                >
                  <Download className="w-3.5 h-3.5" /> Download Report
                </button>
              </div>
            </header>

            {/* Central panels switch routing */}
            <div className="p-8 flex-1 flex flex-col gap-6">

              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="flex flex-col gap-6">
                  {/* Greeting banner */}
                  <div className="glass-panel p-6 rounded-2xl flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Good Morning, {profile.name} 👋</h3>
                      <p className="text-xs text-slate-400">Agent eligibility engine matched <strong>{filteredScholarships.length} scholarships</strong> based on your profile.</p>
                    </div>
                    <span className="text-xs px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-300 font-bold">
                      Profile Complete: 95%
                    </span>
                  </div>

                  {/* Core metric cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Eligible Scholarships', value: filteredScholarships.length, icon: Award, color: 'text-indigo-400' },
                      { label: 'Applications Enrolled', value: applications.length, icon: FolderKanban, color: 'text-emerald-400' },
                      { label: 'Deadlines This Month', value: 3, icon: CalendarIcon, color: 'text-rose-400' },
                      { label: 'transcripts Pending', value: documents.filter(d => d.status !== 'Verified').length, icon: FileText, color: 'text-amber-400' },
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div key={i} className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs text-slate-500 font-semibold">{card.label}</span>
                            <Icon className={`w-5 h-5 ${card.color}`} />
                          </div>
                          <p className="text-2xl font-black text-white">{card.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Split columns: Insights + Deadlines */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Insights widget */}
                    <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
                      <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-4">
                        <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
                        <h4 className="font-bold text-white text-sm">AI Insights & Optimization</h4>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-xl flex gap-3 text-xs leading-normal">
                          <span className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold shrink-0">✓</span>
                          <p className="text-slate-300">Your **{profile.gpa} GPA** qualifies you for 82% of merit-based scholarships.</p>
                        </div>
                        <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-xl flex gap-3 text-xs leading-normal">
                          <span className="w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold shrink-0">+</span>
                          <p className="text-slate-300">Uploading your **Bonafide Certificate** will unlock 4 more matching scholarships.</p>
                        </div>
                        <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-xl flex gap-3 text-xs leading-normal">
                          <span className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold shrink-0">$</span>
                          <p className="text-slate-300">Annual income criteria of **₹{profile.family_income.toLocaleString()}** matches 12 government schemes.</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline deadlines */}
                    <div className="glass-panel p-6 rounded-2xl">
                      <h4 className="font-bold text-white text-sm border-b border-slate-900 pb-3 mb-4">Upcoming Deadlines</h4>
                      <div className="flex flex-col gap-3">
                        {SCHOLARSHIPS_DATABASE.slice(0, 3).map((s, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-slate-300 font-semibold truncate max-w-[150px]">{s.name}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-rose-400 border border-slate-850">{s.deadline}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: CHAT ASSISTANT */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden min-h-[500px]">
                  
                  {/* Assistant header */}
                  <div className="px-6 py-4 border-b border-slate-900 bg-slate-900/40 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                      <div>
                        <h4 className="font-bold text-white text-xs">AI Chat Assistant</h4>
                        <span className="text-[10px] text-slate-500">Google ADK agent runtime session</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleNewChatSession}
                      className="px-3 py-1 bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700 rounded-lg"
                    >
                      New Session
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {messages.map(m => (
                      <div key={m.id} className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${m.role === 'user' ? 'bg-indigo-650' : 'bg-gradient-to-br from-indigo-500 to-purple-500'}`}>
                          {m.role === 'user' ? 'U' : 'AI'}
                        </div>
                        <div className="flex flex-col gap-3">
                          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${m.role === 'user' ? 'bg-indigo-650/15 border-indigo-500/25 rounded-tr-none' : 'bg-slate-900 border-slate-850 rounded-tl-none text-slate-300'}`}>
                            <p className="whitespace-pre-line">{m.content}</p>
                          </div>

                          {/* Dynamic Card rendering inside chat assistant based on NLP queries */}
                          {m.customCardType === 'recommendation' && m.customData && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {m.customData.map((s: Scholarship, i: number) => (
                                <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-855 flex flex-col justify-between">
                                  <div>
                                    <h5 className="font-extrabold text-white text-xs mb-1 truncate">{s.name}</h5>
                                    <p className="text-[10px] text-slate-500 mb-2">Match Rating: <strong className="text-indigo-400">{s.matchPercentage}%</strong></p>
                                    <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">{s.description}</p>
                                  </div>
                                  <button 
                                    onClick={() => handleApplyNow(s)}
                                    className="w-full mt-3 py-1.5 bg-indigo-600 text-white rounded text-[10px] font-bold"
                                  >
                                    Apply
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {m.customCardType === 'comparison' && m.customData && (
                            <div className="overflow-x-auto bg-slate-950 border border-slate-855 rounded-xl p-3">
                              <table className="w-full text-[10px] text-left border-collapse leading-relaxed">
                                <thead>
                                  <tr className="border-b border-slate-850 text-slate-500">
                                    <th className="pb-2">Field</th>
                                    {m.customData.map((s: Scholarship) => <th key={s.id} className="pb-2">{s.name}</th>)}
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-slate-900">
                                    <td className="py-2 text-slate-400 font-bold">Amount</td>
                                    {m.customData.map((s: Scholarship) => <td key={s.id} className="py-2 text-emerald-400 font-bold">{s.amount}</td>)}
                                  </tr>
                                  <tr className="border-b border-slate-900">
                                    <td className="py-2 text-slate-400 font-bold">Deadline</td>
                                    {m.customData.map((s: Scholarship) => <td key={s.id} className="py-2 text-slate-300">{s.deadline}</td>)}
                                  </tr>
                                  <tr className="border-b border-slate-900">
                                    <td className="py-2 text-slate-400 font-bold">Category</td>
                                    {m.customData.map((s: Scholarship) => <td key={s.id} className="py-2 text-indigo-400">{s.category}</td>)}
                                  </tr>
                                  <tr>
                                    <td className="py-2 text-slate-400 font-bold">Match %</td>
                                    {m.customData.map((s: Scholarship) => <td key={s.id} className="py-2 font-bold text-indigo-300">{s.matchPercentage}%</td>)}
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}

                          {m.customCardType === 'documents' && m.customData && (
                            <div className="flex flex-col gap-2 bg-slate-950 p-3 border border-slate-855 rounded-xl">
                              {m.customData.map((d: UserDocument, i: number) => (
                                <div key={i} className="flex justify-between items-center text-[10px]">
                                  <span className="text-slate-300 font-semibold">{d.name}</span>
                                  <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400">Missing</span>
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs">AI</div>
                        <div className="p-3 bg-slate-900 border border-slate-850 rounded-2xl rounded-tl-none text-[10px] text-slate-500 flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Querying eligibility graphs...
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-900 bg-slate-900/30 flex gap-3">
                    <input
                      type="text"
                      placeholder="Ask the advisor: 'recommend CS', 'compare Google and Tata', 'what documents am I missing?'..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow-lg"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: EXPLORER */}
              {activeTab === 'explorer' && (
                <div className="flex flex-col gap-6">
                  
                  {/* Amazon style search & filter panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* Left Filters Panel */}
                    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-5 text-left h-fit">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                        <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2"><Filter className="w-4 h-4 text-indigo-400" /> Filter Criteria</h4>
                        <button 
                          onClick={() => { setSearchQuery(""); setFilterDegree("All"); setFilterCategory("All"); setFilterCountry("All"); setFilterIncome(''); }}
                          className="text-[10px] text-indigo-400 font-bold hover:underline"
                        >
                          Reset All
                        </button>
                      </div>

                      {/* Degree Filter */}
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Degree level</label>
                        <select
                          value={filterDegree}
                          onChange={(e) => setFilterDegree(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 px-3 py-2 text-xs text-slate-300 rounded-xl focus:outline-none"
                        >
                          <option value="All">All Degrees</option>
                          <option value="Undergraduate">Undergraduate</option>
                          <option value="Graduate">Graduate</option>
                        </select>
                      </div>

                      {/* Category Filter */}
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Funding category</label>
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 px-3 py-2 text-xs text-slate-300 rounded-xl focus:outline-none"
                        >
                          <option value="All">All Categories</option>
                          <option value="Government">Government</option>
                          <option value="Private">Private</option>
                          <option value="International">International</option>
                        </select>
                      </div>

                      {/* Country Filter */}
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Geographical boundary</label>
                        <select
                          value={filterCountry}
                          onChange={(e) => setFilterCountry(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 px-3 py-2 text-xs text-slate-300 rounded-xl focus:outline-none"
                        >
                          <option value="All">All Countries</option>
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                        </select>
                      </div>

                      {/* Income boundary filter */}
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Max Family Income (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 500000"
                          value={filterIncome}
                          onChange={(e) => setFilterIncome(e.target.value === '' ? '' : parseInt(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-850 px-3 py-2.5 text-xs text-slate-300 rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Right Listing Grid */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                      
                      {/* Search & Sort Panel */}
                      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-80">
                          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Search by scholarship title, provider..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="flex gap-3 items-center w-full md:w-auto justify-end">
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                          >
                            <option value="match">Sort: Match Rating</option>
                            <option value="amount">Sort: Funding Amount</option>
                            <option value="deadline">Sort: Close Date</option>
                          </select>

                          {comparedIds.length > 0 && (
                            <button
                              onClick={() => setShowComparison(true)}
                              className="px-4 py-2 bg-gradient-to-r from-purple-650 to-indigo-650 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md"
                            >
                              Compare ({comparedIds.length})
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Detail modal rendering */}
                      {selectedScholarship && (
                        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
                          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-2xl shadow-2xl relative">
                            <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-white mb-1">{selectedScholarship.name}</h3>
                                <p className="text-xs text-slate-500">{selectedScholarship.provider}</p>
                              </div>
                              <button 
                                onClick={() => setSelectedScholarship(null)}
                                className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs"
                              >
                                Close
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-850 mb-6 leading-relaxed">
                              <p><span className="text-slate-500">Degree Focus:</span> <strong className="text-slate-300">{selectedScholarship.degree}</strong></p>
                              <p><span className="text-slate-500">Funding Amount:</span> <strong className="text-emerald-400">{selectedScholarship.amount}</strong></p>
                              <p><span className="text-slate-500">Category:</span> <strong className="text-indigo-400">{selectedScholarship.category}</strong></p>
                              <p><span className="text-slate-500">Close Date:</span> <strong className="text-rose-400">{selectedScholarship.deadline}</strong></p>
                            </div>

                            <div className="space-y-4 text-left max-h-60 overflow-y-auto pr-2 text-xs">
                              <div>
                                <h4 className="font-bold text-white mb-1">Scholarship Benefits</h4>
                                <p className="text-slate-400 leading-normal">{selectedScholarship.benefits}</p>
                              </div>
                              <div>
                                <h4 className="font-bold text-white mb-1">Eligibility Criteria Details</h4>
                                <p className="text-slate-400 leading-normal">Requires Minimum CGPA / GPA of {selectedScholarship.min_gpa} and Annual family income bounds under ₹{selectedScholarship.max_income.toLocaleString()}.</p>
                              </div>
                              <div>
                                <h4 className="font-bold text-white mb-1">Selection Workflow</h4>
                                <p className="text-slate-400 leading-normal">{selectedScholarship.process}</p>
                              </div>
                            </div>

                            <div className="flex gap-4 border-t border-slate-800 pt-4 mt-6">
                              <button
                                onClick={() => { handleApplyNow(selectedScholarship); setSelectedScholarship(null); }}
                                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs"
                              >
                                Enroll Application
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Comparison Modal */}
                      {showComparison && (
                        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
                          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-4xl shadow-2xl relative">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                              <h3 className="text-xl font-bold text-white">Compare Scholarships</h3>
                              <button 
                                onClick={() => setShowComparison(false)}
                                className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs"
                              >
                                Close Comparison
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto">
                              {SCHOLARSHIPS_DATABASE.filter(s => comparedIds.includes(s.id)).map(s => (
                                <div key={s.id} className="bg-slate-950 p-5 rounded-xl border border-slate-850 flex flex-col justify-between">
                                  <div>
                                    <div className="flex justify-between items-start mb-4">
                                      <h4 className="font-extrabold text-white text-xs truncate max-w-[150px]">{s.name}</h4>
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-bold">{s.matchPercentage}% Match</span>
                                    </div>
                                    <div className="space-y-2 text-[10px] mb-6">
                                      <div className="flex justify-between border-b border-slate-850 pb-1.5">
                                        <span className="text-slate-500">Provider</span>
                                        <span className="text-slate-200 font-bold truncate max-w-[100px]">{s.provider}</span>
                                      </div>
                                      <div className="flex justify-between border-b border-slate-850 pb-1.5">
                                        <span className="text-slate-500">Amount</span>
                                        <span className="text-emerald-400 font-extrabold">{s.amount}</span>
                                      </div>
                                      <div className="flex justify-between border-b border-slate-850 pb-1.5">
                                        <span className="text-slate-500">Deadline</span>
                                        <span className="text-rose-400 font-semibold">{s.deadline}</span>
                                      </div>
                                      <div className="flex justify-between border-b border-slate-850 pb-1.5">
                                        <span className="text-slate-500">Required Docs</span>
                                        <span className="text-slate-200 truncate max-w-[100px]">{s.required_documents.join(", ")}</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500 block mb-1">Key Benefit</span>
                                        <p className="text-slate-400 leading-normal truncate">{s.benefits}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => { handleApplyNow(s); setShowComparison(false); }}
                                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-bold transition-all"
                                  >
                                    Apply Opportunity
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Scholarship list grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredScholarships.map(s => (
                          <div key={s.id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700/50 transition-all group">
                            <div>
                              {/* Match and amount */}
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-850 text-[9px] font-bold text-slate-400 mr-1">{s.category}</span>
                                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-[9px] font-bold text-indigo-300">{s.matchPercentage}% Match</span>
                                </div>
                                <span className="text-md font-black text-emerald-400">{s.amount}</span>
                              </div>

                              {/* Title */}
                              <h4 
                                onClick={() => setSelectedScholarship(s)}
                                className="font-extrabold text-white text-sm group-hover:text-indigo-400 transition-colors cursor-pointer text-left truncate"
                              >
                                {s.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 text-left mb-3">Provided by {s.provider}</p>
                              
                              <p className="text-[11px] text-slate-400 text-left leading-relaxed line-clamp-2 mb-4">{s.description}</p>
                            </div>

                            {/* Actions footer */}
                            <div className="border-t border-slate-900 pt-4 flex gap-1.5">
                              <button
                                onClick={() => handleApplyNow(s)}
                                className="flex-1 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-bold transition-colors"
                              >
                                Apply Now
                              </button>
                              <button
                                onClick={() => toggleSaveScholarship(s.name)}
                                className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold transition-colors ${
                                  savedScholarships.includes(s.name)
                                    ? 'bg-slate-900 border-indigo-500 text-indigo-300'
                                    : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {savedScholarships.includes(s.name) ? 'Saved' : 'Save'}
                              </button>
                              <button
                                onClick={() => {
                                  setComparedIds(prev => 
                                    prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                                  );
                                }}
                                className={`px-2 py-1.5 border rounded-lg text-[10px] font-bold transition-colors ${
                                  comparedIds.includes(s.id)
                                    ? 'bg-purple-650/15 border-purple-500 text-purple-300'
                                    : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                Compare
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: ELIGIBILITY ANALYZER */}
              {activeTab === 'analyzer' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Overall Dial */}
                  <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-between text-center min-h-[350px]">
                    <h3 className="font-bold text-white text-lg border-b border-slate-900 pb-3 mb-6 w-full">Automated Verification Index</h3>
                    
                    {/* Ring dial */}
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="42" 
                          stroke="url(#gradient-analyzer)" 
                          strokeWidth="8" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 42}
                          strokeDashoffset={2 * Math.PI * 42 * (1 - 0.91)}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="gradient-analyzer" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute text-center">
                        <p className="text-4xl font-black text-white leading-none">91%</p>
                        <span className="text-[10px] text-indigo-300 font-bold uppercase mt-1 block">Agent Audit</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-slate-500">Satisfies 91% of conditions analyzed across merit, need, and international categories.</p>
                    </div>
                  </div>

                  {/* Right Column: Split categories and recommendations */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    
                    {/* Category matches */}
                    <div className="glass-panel p-6 rounded-2xl text-left">
                      <h4 className="font-bold text-white text-sm border-b border-slate-900 pb-3 mb-4">Category Matching</h4>
                      <div className="space-y-4">
                        {[
                          { name: 'Merit-Based Scholarships', score: 95, color: 'bg-indigo-500' },
                          { name: 'Need-Based Scholarships', score: 87, color: 'bg-emerald-500' },
                          { name: 'International Scholarships', score: 72, color: 'bg-amber-500' },
                        ].map((cat, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-300">{cat.name}</span>
                              <span className="text-slate-200">{cat.score}% match probability</span>
                            </div>
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                              <div className={`h-full ${cat.color}`} style={{ width: `${cat.score}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Improvement list */}
                    <div className="glass-panel p-6 rounded-2xl text-left">
                      <h4 className="font-bold text-white text-sm border-b border-slate-900 pb-3 mb-4">Suggested Profile Optimization</h4>
                      <div className="flex flex-col gap-3">
                        <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex gap-3 text-xs leading-normal">
                          <span className="w-5 h-5 rounded bg-rose-500/10 flex items-center justify-center text-rose-400 font-bold shrink-0">!</span>
                          <p className="text-slate-300">Upload **Marks Memo** to satisfy the transcription verification requirement.</p>
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex gap-3 text-xs leading-normal">
                          <span className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold shrink-0">!</span>
                          <p className="text-slate-300">Submit **LOR** and **SOP** to verify global eligibility indexes.</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 5: APPLICATION TRACKER */}
              {activeTab === 'tracker' && (
                <div className="flex flex-col gap-6">
                  {/* Top Stats Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {[
                      { label: "Total Applications", value: applications.length, color: "text-indigo-400" },
                      { label: "Preparing", value: applications.filter(a => a.stage === "Preparing").length, color: "text-amber-400" },
                      { label: "Submitted", value: applications.filter(a => a.stage === "Submitted" || a.stage === "Under Review").length, color: "text-indigo-400" },
                      { label: "Approved", value: applications.filter(a => a.stage === "Approved").length, color: "text-emerald-400" },
                      { 
                        label: "Upcoming Deadlines", 
                        value: applications.filter(a => {
                          const deadlineDate = new Date(a.deadline);
                          const diffTime = deadlineDate.getTime() - new Date("2026-07-05").getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return diffDays > 0 && diffDays <= 15;
                        }).length, 
                        color: "text-rose-400" 
                      }
                    ].map((s, idx) => (
                      <div key={idx} className="glass-panel p-4 rounded-xl flex flex-col justify-between">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{s.label}</span>
                        <span className={`text-2xl font-black ${s.color} mt-2`}>{s.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {applications.map(app => {
                      const dbScholarship = SCHOLARSHIPS_DATABASE.find(s => s.name === app.scholarshipName) || SCHOLARSHIPS_DATABASE[0];
                      const reqDocs = dbScholarship.required_documents || ["Marks Memo", "Statement of Purpose"];
                      
                      // Calculate days remaining
                      const deadlineDate = new Date(app.deadline);
                      const diffTime = deadlineDate.getTime() - new Date("2026-07-05").getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      const isHighPriority = diffDays <= 7;

                      // Count uploaded documents
                      const docStatus = reqDocs.map(docName => {
                        const userDoc = documents.find(d => d.name.toLowerCase() === docName.toLowerCase());
                        const isUploaded = userDoc && (userDoc.status === 'Uploaded' || userDoc.status === 'Verified');
                        return { name: docName, isUploaded };
                      });
                      const uploadedCount = docStatus.filter(d => d.isUploaded).length;
                      const progressPercentage = Math.round((uploadedCount / reqDocs.length) * 100);
                      const missingDocs = docStatus.filter(d => !d.isUploaded).map(d => d.name);

                      // AI Priority rating & recommendation
                      let priorityStars = "★★★☆☆";
                      let priorityLevel = "Medium";
                      let priorityReason = "Application is on track. Check for updates.";
                      let aiRec = `You have uploaded ${uploadedCount} of ${reqDocs.length} required documents. Keep preparing.`;
                      let reminderText = `Complete your application workflow before deadline.`;

                      if (app.stage === 'Approved') {
                        priorityStars = "★☆☆☆☆";
                        priorityLevel = "Low";
                        priorityReason = "Application has been approved.";
                        aiRec = "Congratulations! Your scholarship application is approved. Direct stipend disbursement will initiate shortly.";
                        reminderText = "Check your email for banking/disbursement setup instructions.";
                      } else if (app.stage === 'Submitted' || app.stage === 'Under Review') {
                        priorityStars = "★★☆☆☆";
                        priorityLevel = "Low";
                        priorityReason = "Application successfully submitted.";
                        aiRec = "Your application is submitted. Verification agents are currently auditing your credentials.";
                        reminderText = "Monitor notification center for review status updates.";
                      } else if (app.stage === 'Not Started') {
                        priorityStars = "★★★★☆";
                        priorityLevel = "High";
                        priorityReason = "Application not started yet.";
                        aiRec = "Start your application to begin matching. Your profile CGPA is a perfect match.";
                        reminderText = "Click 'Start Application' below to open checklist.";
                      } else if (app.stage === 'Preparing') {
                        if (missingDocs.length > 0) {
                          if (isHighPriority) {
                            priorityStars = "★★★★★";
                            priorityLevel = "High";
                            priorityReason = "Deadline is close and documents remain pending.";
                            aiRec = `You are only missing the ${missingDocs[0]}. The application deadline is in ${diffDays} days. Complete this document first to maximize your chances.`;
                            reminderText = `Upload ${missingDocs[0]} before ${new Date(new Date("2026-07-05").getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}. Est: 15 mins.`;
                          } else {
                            priorityStars = "★★★★☆";
                            priorityLevel = "Medium";
                            priorityReason = "Outstanding documents needed.";
                            aiRec = `You have ${diffDays} days left. We recommend uploading the ${missingDocs[0]} next to ensure plenty of time for review.`;
                            reminderText = `Set aside 15 minutes to draft your ${missingDocs[0]}.`;
                          }
                        } else {
                          priorityStars = "★★★☆☆";
                          priorityLevel = "Medium";
                          priorityReason = "Documents complete but not submitted.";
                          aiRec = "All required documents are successfully uploaded. Click submit to finalize your application!";
                          reminderText = "Submit before the deadline in " + diffDays + " days.";
                        }
                      }

                      return (
                        <div key={app.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-slate-800 text-left">
                          <div>
                            {/* Card Header: Title & Deadline Info */}
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-extrabold text-white text-md">{app.scholarshipName}</h4>
                                <p className="text-xs text-slate-500">{app.provider} · {app.amount}</p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                                isHighPriority 
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                              }`}>
                                {diffDays} Days Left · {isHighPriority ? 'High Priority' : 'On Track'}
                              </span>
                            </div>

                            {/* Dropdown status selection */}
                            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-900 mb-5">
                              <div>
                                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Application Status</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`w-2.5 h-2.5 rounded-full ${
                                    app.stage === 'Approved' ? 'bg-emerald-400' :
                                    app.stage === 'Submitted' || app.stage === 'Under Review' ? 'bg-indigo-400' :
                                    app.stage === 'Preparing' ? 'bg-amber-400' : 'bg-slate-400'
                                  }`}></span>
                                  <span className="text-xs font-bold text-white">{app.stage}</span>
                                </div>
                              </div>
                              <select
                                value={app.stage}
                                onChange={(e) => updateApplicationStatus(app.id, e.target.value as Application['stage'])}
                                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                              >
                                <option value="Not Started">Not Started</option>
                                <option value="Preparing">Preparing</option>
                                <option value="Submitted">Submitted</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </div>

                            {/* Progress bar */}
                            <div className="mb-5 space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-semibold">Document Progress</span>
                                <span className="text-slate-300 font-bold">{progressPercentage}% ({uploadedCount} of {reqDocs.length} uploaded)</span>
                              </div>
                              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${progressPercentage}%` }}></div>
                              </div>
                            </div>

                            {/* Required documents Checklist */}
                            <div className="mb-5 bg-slate-950 p-4 rounded-xl border border-slate-900">
                              <h5 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Checklist</h5>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {docStatus.map((d, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <span>{d.isUploaded ? '✅' : '❌'}</span>
                                    <span className={d.isUploaded ? 'text-slate-300' : 'text-slate-500'}>{d.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* AI Recommendation Widget */}
                            <div className="mb-5 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3 text-xs leading-relaxed">
                              <span className="text-lg">🤖</span>
                              <div>
                                <span className="font-bold text-indigo-300 block mb-0.5">AI Recommendation</span>
                                <p className="text-slate-300">{aiRec}</p>
                              </div>
                            </div>

                            {/* AI Priority Card */}
                            <div className="mb-5 grid grid-cols-2 gap-4">
                              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
                                <span className="text-[10px] text-slate-500 block uppercase font-semibold">AI Priority Score</span>
                                <span className="text-xs font-bold text-amber-400 block mt-1">{priorityStars} {priorityLevel}</span>
                              </div>
                              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-xs">
                                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Assessment Reason</span>
                                <p className="text-[10px] text-slate-400 mt-1 leading-normal line-clamp-2">{priorityReason}</p>
                              </div>
                            </div>

                            {/* Contextual Smart Reminder */}
                            <div className="mb-6 p-3 bg-slate-950 rounded-xl border border-slate-900 flex items-start gap-2.5 text-xs">
                              <span className="text-rose-400 mt-0.5">⏰</span>
                              <div>
                                <span className="font-bold text-slate-300 block mb-0.5">Smart Reminder</span>
                                <p className="text-[11px] text-slate-450 leading-relaxed">{reminderText}</p>
                              </div>
                            </div>
                          </div>

                          {/* Contextual Quick Actions */}
                          <div className="flex gap-2 border-t border-slate-900 pt-4">
                            {app.stage === 'Not Started' && (
                              <button
                                onClick={() => updateApplicationStatus(app.id, 'Preparing')}
                                className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-650 text-white rounded-xl text-xs font-bold transition-all"
                              >
                                Start Application
                              </button>
                            )}

                            {app.stage === 'Preparing' && (
                              <>
                                <button
                                  onClick={() => addToast("Reviewing active application checklist metrics...", "info")}
                                  className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-650 text-white rounded-xl text-xs font-bold transition-all"
                                >
                                  Continue Application
                                </button>
                                <button
                                  onClick={() => setActiveTab('documents')}
                                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all"
                                >
                                  Upload Documents
                                </button>
                              </>
                            )}

                            {(app.stage === 'Submitted' || app.stage === 'Under Review' || app.stage === 'Approved' || app.stage === 'Rejected') && (
                              <button
                                onClick={() => addToast(`Auditing details for ${app.scholarshipName}. Verification audit ID: v-${app.id}`, "info")}
                                className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-650 text-white rounded-xl text-xs font-bold transition-all"
                              >
                                View Submission Details
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedScholarship(dbScholarship)}
                              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold transition-all"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6: DOCUMENT VAULT */}
              {activeTab === 'documents' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileInputChange}
                  />

                  {/* Upload drop zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => handleBrowseClick()}
                    className={`lg:col-span-2 border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                      isDragging
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 bg-slate-900/30 hover:border-indigo-500/50 hover:bg-indigo-500/5'
                    }`}
                  >
                    <Upload className={`w-14 h-14 mb-4 transition-colors ${isDragging ? 'text-indigo-400 animate-bounce' : 'text-slate-500'}`} />
                    <h3 className="text-lg font-bold text-white mb-2">Drag & Drop or Click to Upload</h3>
                    <p className="text-xs text-slate-500 max-w-[300px] mb-6">Supports PDF, JPG, PNG, DOC files. Upload income certificate, marks memo, resume, or bonafide certificate.</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleBrowseClick(); }}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
                    >
                      Browse Files
                    </button>
                    <p className="text-[10px] text-slate-600 mt-4">Max file size: 10MB per document</p>
                  </div>

                  {/* Document checklist */}
                  <div className="glass-panel p-6 rounded-2xl text-left flex flex-col gap-3">
                    <h3 className="font-bold text-white text-lg border-b border-slate-900 pb-3 mb-1">Document Vault Checklists</h3>
                    {documents.map(d => (
                      <div key={d.id} className="flex flex-col gap-2 border-b border-slate-900 pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs font-bold text-white">{d.name}</p>
                            <span className="text-[9px] text-slate-500">
                              {d.status === 'Verified' ? 'Agent Approved' : d.status === 'Uploaded' ? `Uploaded ${d.uploadedAt || ''}` : 'Missing File'}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded text-[9px] font-semibold border ${
                            d.status === 'Verified' ? 'bg-emerald-950/80 border-emerald-500/20 text-emerald-400' :
                            d.status === 'Uploaded' ? 'bg-indigo-950/80 border-indigo-500/20 text-indigo-400' :
                            'bg-rose-950/80 border-rose-500/20 text-rose-400'
                          }`}>
                            {d.status}
                          </span>
                        </div>
                        {d.status !== 'Verified' && (
                          <button
                            onClick={() => handleBrowseClick(d.id)}
                            disabled={uploadingDocId === d.id}
                            className="w-full py-1.5 text-[10px] font-bold rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 transition-all disabled:opacity-50"
                          >
                            {uploadingDocId === d.id ? '⏳ Uploading...' : d.status === 'Uploaded' ? '🔄 Re-upload' : '⬆ Upload File'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: SAVED SCHOLARSHIPS */}
              {activeTab === 'saved' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {SCHOLARSHIPS_DATABASE.filter(s => savedScholarships.includes(s.name)).map(s => (
                    <div key={s.id} className="glass-panel p-5 rounded-2xl flex flex-col justify-between text-left">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-[9px] font-bold text-indigo-300">{s.matchPercentage}% Match</span>
                          <span className="text-md font-bold text-emerald-400">{s.amount}</span>
                        </div>
                        <h4 className="font-extrabold text-white text-sm truncate">{s.name}</h4>
                        <p className="text-[10px] text-slate-500 mb-4">By {s.provider}</p>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">{s.description}</p>
                      </div>
                      <div className="flex gap-2 border-t border-slate-900 pt-4">
                        <button
                          onClick={() => handleApplyNow(s)}
                          className="flex-1 py-1.5 bg-indigo-650 hover:bg-indigo-650 text-white rounded-lg text-[10px] font-bold"
                        >
                          Apply Opportunity
                        </button>
                        <button
                          onClick={() => toggleSaveScholarship(s.name)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 text-rose-400 hover:bg-rose-950/20 hover:border-rose-500/25"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {savedScholarships.length === 0 && (
                    <div className="col-span-2 text-center py-20">
                      <p className="text-4xl mb-3">🔖</p>
                      <h4 className="font-bold text-white text-md mb-1">No bookmarked opportunities</h4>
                      <p className="text-xs text-slate-550 max-w-sm mx-auto">Explore matching scholarships in the Scholarship Explorer page and bookmark items to save them here.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: CALENDAR */}
              {activeTab === 'calendar' && (
                <div className="glass-panel p-6 rounded-2xl text-left">
                  <h3 className="font-bold text-white text-lg border-b border-slate-900 pb-3 mb-6">Deadline & Event Calendar</h3>
                  
                  {/* Calendar Grid Mock */}
                  <div className="grid grid-cols-7 gap-2 text-center text-xs">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="py-2 text-slate-500 font-bold uppercase tracking-wider">{day}</div>
                    ))}
                    {Array.from({ length: 30 }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const hasDeadline = dayNum === 15 || dayNum === 30;
                      return (
                        <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between min-h-[80px] text-left ${
                          hasDeadline 
                            ? 'bg-rose-500/10 border-rose-500/30' 
                            : 'bg-slate-950 border-slate-900'
                        }`}>
                          <span className="font-bold text-slate-400">{dayNum}</span>
                          {hasDeadline && (
                            <span className="text-[8px] bg-rose-500 text-white px-1 py-0.5 rounded truncate block mt-2">
                              {dayNum === 15 ? 'Tata Close' : 'Google Close'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 9: PROFILE */}
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                  
                  {/* Form input details */}
                  <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
                    <h3 className="font-bold text-white text-lg border-b border-slate-900 pb-3 mb-6">Student Information</h3>
                    
                    {/* Section 1: Personal Details */}
                    <div className="mb-6">
                      <h4 className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold mb-4">Personal Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Student Name</label>
                          <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Phone Number</label>
                          <input
                            type="text"
                            value={profile.phone}
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Date of Birth</label>
                          <input
                            type="date"
                            value={profile.dob}
                            onChange={(e) => setProfile({...profile, dob: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Gender</label>
                          <select
                            value={profile.gender || "Male"}
                            onChange={(e) => setProfile({...profile, gender: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Academic Information */}
                    <div className="mb-6 border-t border-slate-900 pt-4">
                      <h4 className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold mb-4">Academic Credentials</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">College Name</label>
                          <input
                            type="text"
                            value={profile.college}
                            onChange={(e) => setProfile({...profile, college: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">University Name</label>
                          <input
                            type="text"
                            value={profile.university}
                            onChange={(e) => setProfile({...profile, university: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Degree Level</label>
                          <select
                            value={profile.degree}
                            onChange={(e) => setProfile({...profile, degree: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="Undergraduate">Undergraduate (B.Tech, B.Sc, B.Com, etc.)</option>
                            <option value="Graduate">Graduate (M.Tech, M.Sc, MBA, etc.)</option>
                            <option value="PhD">PhD / Doctorate</option>
                            <option value="Diploma">Diploma / Certifications</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Academic Year</label>
                          <select
                            value={profile.year}
                            onChange={(e) => setProfile({...profile, year: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="Graduate">Graduated</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Academic Major / Branch</label>
                          <input
                            type="text"
                            value={profile.branch}
                            onChange={(e) => setProfile({...profile, branch: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">CGPA</label>
                          <input
                            type="number"
                            step="0.01"
                            value={profile.gpa}
                            onChange={(e) => setProfile({...profile, gpa: parseFloat(e.target.value) || 0.0})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Previous Education Details</label>
                          <input
                            type="text"
                            value={profile.prevEducation}
                            onChange={(e) => setProfile({...profile, prevEducation: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                            placeholder="e.g. Class 12 / Intermediate Science (92%)"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Aggregate Percentage (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={profile.percentage}
                            onChange={(e) => setProfile({...profile, percentage: parseFloat(e.target.value) || 0.0})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Financial & Background */}
                    <div className="mb-6 border-t border-slate-900 pt-4">
                      <h4 className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold mb-4">Financial & Demographic Background</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Family Annual Income (₹)</label>
                          <input
                            type="number"
                            value={profile.family_income}
                            onChange={(e) => setProfile({...profile, family_income: parseFloat(e.target.value) || 0.0})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Category</label>
                          <select
                            value={profile.category}
                            onChange={(e) => setProfile({...profile, category: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="General">General</option>
                            <option value="OBC">OBC</option>
                            <option value="SC">SC</option>
                            <option value="ST">ST</option>
                            <option value="Minority">Minority Group</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">State of Residence</label>
                          <input
                            type="text"
                            value={profile.state}
                            onChange={(e) => setProfile({...profile, state: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Country</label>
                          <input
                            type="text"
                            value={profile.country}
                            onChange={(e) => setProfile({...profile, country: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Highlights & Summary */}
                    <div className="border-t border-slate-900 pt-4">
                      <h4 className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold mb-4">Bio Summary & Professional Highlights</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Personal Biography / Statement of Purpose</label>
                          <textarea
                            value={profile.bio}
                            onChange={(e) => setProfile({...profile, bio: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none min-h-[70px]"
                            placeholder="Brief description about your background, career aims, and aspirations..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Technical Skills & Tools</label>
                          <input
                            type="text"
                            value={profile.skills}
                            onChange={(e) => setProfile({...profile, skills: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                            placeholder="e.g. Python, React, PyTorch, SQL, Java"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Key Projects & Portfolios</label>
                          <input
                            type="text"
                            value={profile.projects}
                            onChange={(e) => setProfile({...profile, projects: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                            placeholder="e.g. Student Academic AI Bot, Health Analytics Engine"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2">Achievements Summary</label>
                          <textarea
                            value={profile.achievements}
                            onChange={(e) => setProfile({...profile, achievements: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none min-h-[80px]"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleSaveProfile}
                      className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg"
                    >
                      Save Profile Changes
                    </button>
                  </div>

                  {/* Highlights panel */}
                  <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between max-h-[600px] overflow-y-auto">
                    <div>
                      <h3 className="font-bold text-white text-lg border-b border-slate-900 pb-3 mb-4">Highlights Summary</h3>
                      <div className="space-y-4 text-xs">
                        <div>
                          <span className="text-slate-550 font-bold block mb-1">Key achievements</span>
                          <p className="text-slate-300 leading-normal">{profile.achievements || "None set yet"}</p>
                        </div>
                        <div>
                          <span className="text-slate-550 font-bold block mb-1">Technical Skills</span>
                          <p className="text-slate-300 leading-normal">{profile.skills || "None set yet"}</p>
                        </div>
                        <div>
                          <span className="text-slate-550 font-bold block mb-1">Biography</span>
                          <p className="text-slate-300 leading-normal">{profile.bio || "None set yet"}</p>
                        </div>
                        <div>
                          <span className="text-slate-550 font-bold block mb-1">Projects</span>
                          <p className="text-slate-300 leading-normal">{profile.projects || "None set yet"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 10: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="glass-panel p-6 rounded-2xl max-w-2xl text-left">
                  <h3 className="font-bold text-white text-lg border-b border-slate-900 pb-3 mb-6">General Preferences</h3>
                  
                  <div className="space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                      <div>
                        <p className="text-xs font-bold text-white">Visual Mode Theme</p>
                        <p className="text-[10px] text-slate-500">Toggle dark dashboard theme or standard light mode.</p>
                      </div>
                      <button 
                        onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                        className="px-4 py-2 text-[10px] font-bold rounded-lg bg-slate-900 border border-slate-800 text-slate-300 capitalize"
                      >
                        {theme} active
                      </button>
                    </div>

                    <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                      <div>
                        <p className="text-xs font-bold text-white">Inference API Endpoint</p>
                        <p className="text-[10px] text-slate-500">Target server for forwarding prompt workflows.</p>
                      </div>
                      <code className="bg-slate-950 px-3 py-1.5 border border-slate-900 rounded text-[9px] font-mono text-indigo-400">/api/scholarship/*</code>
                    </div>

                    <div className="flex justify-between items-center pb-3">
                      <div>
                        <p className="text-xs font-bold text-white">SMS Notifications</p>
                        <p className="text-[10px] text-slate-500">Enable automatic reminders via text messages.</p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold">Disabled</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 11: ADMIN PANEL */}
              {activeTab === 'admin' && (
                <div className="flex flex-col gap-6 text-left">
                  {/* Admin Analytics stats grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-5 rounded-2xl">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Total Managed Opportunities</span>
                      <p className="text-3xl font-black text-white">20,480</p>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Registered Applicants</span>
                      <p className="text-3xl font-black text-white">10,240</p>
                    </div>
                    <div className="glass-panel p-5 rounded-2xl">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Verification Success Ratio</span>
                      <p className="text-3xl font-black text-white">98.4%</p>
                    </div>
                  </div>

                  {/* Registered Scholarships Management mock list */}
                  <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="font-bold text-white text-sm border-b border-slate-900 pb-3 mb-4">Database Scholarship Administration</h3>
                    <div className="flex flex-col gap-3">
                      {SCHOLARSHIPS_DATABASE.map(s => (
                        <div key={s.id} className="flex justify-between items-center border-b border-slate-900 pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="text-xs font-bold text-white">{s.name}</p>
                            <span className="text-[9px] text-slate-500">Category: {s.category} · Provider: {s.provider}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[9px] font-bold">{s.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Global Footer Banner */}
            <footer className="border-t border-slate-900/60 px-8 py-4 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
              <p>© 2026 Scholarship Navigator · Recruiter portfolio showcase</p>
              <p className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-indigo-500/50" /> Secure Multi-Agent Verification Enabled</p>
            </footer>
          </main>
        </div>
      )}

    </div>
  );
}
