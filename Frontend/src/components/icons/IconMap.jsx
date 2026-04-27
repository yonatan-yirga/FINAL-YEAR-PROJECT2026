/**
 * Icon Mapping - Professional SVG Icons
 * Using Lucide React for consistent, modern iconography
 */
import {
  // User & Profile
  User, Users, UserCheck, UserCircle, UserCog,
  // Navigation & Actions
  Home, Search, Send, Mail, MessageSquare, Bell,
  // Documents & Files
  FileText, File, Files, Folder, FolderOpen, ClipboardList, FileCheck,
  // Status & Progress
  CheckCircle, XCircle, Clock, AlertCircle, TrendingUp, TrendingDown,
  // Business & Work
  Briefcase, Building, Building2, GraduationCap, Award, Trophy,
  // Communication
  Phone, Video, Calendar, Link, Share2,
  // Settings & Tools
  Settings, Lock, Unlock, Key, Shield, Eye, EyeOff,
  // Actions
  Plus, Edit, Trash2, Download, Upload, RefreshCw, LogOut,
  // Charts & Analytics
  BarChart3, PieChart, LineChart, Activity,
  // Misc
  Star, Heart, Bookmark, Flag, Target, Zap, Sparkles,
  // Arrows & Navigation
  ArrowRight, ArrowLeft, ChevronRight, ChevronLeft, ExternalLink,
  // Media
  Image, Camera, Paperclip,
  // Status Indicators
  CheckCircle2, XCircle as XCircleIcon, AlertTriangle, Info,
  // Special
  Rocket, Satellite, Globe, MapPin, Navigation
} from 'lucide-react';

/**
 * Icon Component Wrapper
 * Provides consistent sizing and styling
 */
export const Icon = ({ name, size = 20, color, className, style, ...props }) => {
  const IconComponent = iconMap[name] || FileText;
  
  return (
    <IconComponent
      size={size}
      color={color}
      className={className}
      style={style}
      {...props}
    />
  );
};

/**
 * Icon Map - Maps icon names to Lucide components
 */
export const iconMap = {
  // User & Profile
  'user': User,
  'users': Users,
  'user-check': UserCheck,
  'user-circle': UserCircle,
  'user-cog': UserCog,
  'profile': UserCircle,
  'account': UserCircle,
  
  // Navigation
  'home': Home,
  'dashboard': Home,
  'search': Search,
  'find': Search,
  
  // Documents
  'file': FileText,
  'document': FileText,
  'files': Files,
  'folder': Folder,
  'clipboard': ClipboardList,
  'list': ClipboardList,
  'report': FileText,
  'reports': Files,
  'application': FileCheck,
  'applications': ClipboardList,
  
  // Status
  'check': CheckCircle,
  'success': CheckCircle2,
  'approved': CheckCircle,
  'completed': CheckCircle2,
  'pending': Clock,
  'waiting': Clock,
  'rejected': XCircle,
  'error': XCircle,
  'alert': AlertCircle,
  'warning': AlertTriangle,
  'info': Info,
  
  // Business
  'briefcase': Briefcase,
  'internship': Briefcase,
  'active': Briefcase,
  'company': Building2,
  'building': Building,
  'graduation': GraduationCap,
  'student': GraduationCap,
  'award': Award,
  'certificate': Award,
  'trophy': Trophy,
  'finish': Trophy,
  
  // Communication
  'message': MessageSquare,
  'messages': Mail,
  'chat': MessageSquare,
  'mail': Mail,
  'email': Mail,
  'bell': Bell,
  'notification': Bell,
  'phone': Phone,
  'video': Video,
  'meet': Video,
  
  // Calendar & Time
  'calendar': Calendar,
  'schedule': Calendar,
  'clock': Clock,
  'time': Clock,
  
  // Links & Sharing
  'link': Link,
  'share': Share2,
  'external': ExternalLink,
  'verify': Link,
  
  // Settings & Security
  'settings': Settings,
  'lock': Lock,
  'unlock': Unlock,
  'key': Key,
  'shield': Shield,
  'security': Shield,
  'eye': Eye,
  'eye-off': EyeOff,
  'password': Lock,
  
  // Actions
  'plus': Plus,
  'add': Plus,
  'create': Plus,
  'edit': Edit,
  'delete': Trash2,
  'trash': Trash2,
  'download': Download,
  'upload': Upload,
  'refresh': RefreshCw,
  'logout': LogOut,
  'send': Send,
  
  // Charts
  'chart': BarChart3,
  'bar-chart': BarChart3,
  'pie-chart': PieChart,
  'line-chart': LineChart,
  'analytics': Activity,
  'stats': Activity,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  
  // Misc
  'star': Star,
  'favorite': Star,
  'heart': Heart,
  'bookmark': Bookmark,
  'flag': Flag,
  'target': Target,
  'goal': Target,
  'zap': Zap,
  'sparkles': Sparkles,
  'rocket': Rocket,
  'satellite': Satellite,
  'globe': Globe,
  'location': MapPin,
  'navigation': Navigation,
  
  // Arrows
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  
  // Media
  'image': Image,
  'camera': Camera,
  'attachment': Paperclip,
};

/**
 * Get icon component by name
 */
export const getIcon = (name) => {
  return iconMap[name] || FileText;
};

export default Icon;
