import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/contexts/UserRoleContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard,
  Users,
  Ticket,
  Calendar,
  BarChart3,
  Settings,
  Wrench,
  TestTube,
  QrCode,
  DollarSign,
  Activity,
  MessageSquare,
  Camera,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  Home,
  ArrowLeft
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  description?: string;
  children?: NavItem[];
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, description }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, hasRole } = useUserRoles();

  const navigationItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      description: 'Overview and quick actions'
    },
    {
      title: 'Users & Members',
      href: '/admin/members',
      icon: Users,
      badge: '3',
      description: 'Manage user accounts and approvals'
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Revenue and performance insights'
    },
    {
      title: 'System Diagnostics',
      href: '/admin/diagnostics',
      icon: Wrench,
      description: 'System health and troubleshooting'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
    }
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    
    return (
      <div key={item.href}>
        <Button
          variant="ghost"
          className={`w-full justify-start mb-1 text-left h-auto py-2 px-3 ${
            level > 0 ? 'ml-4 text-sm' : ''
          } ${
            active 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          onClick={() => {
            navigate(item.href);
            setSidebarOpen(false);
          }}
        >
          <Icon className={`w-4 h-4 mr-3 flex-shrink-0 ${
            active ? 'text-white' : 'text-gray-400'
          }`} />
          <span className="flex-1 text-left font-medium">{item.title}</span>
          {item.badge && (
            <Badge variant="destructive" className="ml-2 flex-shrink-0">
              {item.badge}
            </Badge>
          )}
          {item.children && <ChevronRight className="w-3 h-3 flex-shrink-0 ml-1" />}
        </Button>
        
        {item.children && active && (
          <div className="ml-2 space-y-1">
            {item.children.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative left-0 top-0 h-full w-64 bg-gray-950 shadow-lg transform transition-transform duration-300 ease-in-out z-50 flex flex-col border-r border-gray-800
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">SB</span>
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-sm text-white truncate">SkateBurn Admin</h2>
                <p className="text-xs text-gray-400 truncate">Management Console</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden flex-shrink-0 text-gray-400 hover:text-white hover:bg-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Back to Main Site Button */}
          <Button
            variant="ghost"
            className="w-full justify-start mb-3 text-left h-auto py-2 px-3 text-blue-400 hover:bg-blue-900/20 hover:text-blue-300 border border-blue-600/20"
            onClick={() => {
              navigate('/');
              setSidebarOpen(false);
            }}
          >
            <Home className="w-4 h-4 mr-3 flex-shrink-0" />
            <span className="flex-1 text-left font-medium">Back to Main Site</span>
          </Button>
          
          {navigationItems.map(item => renderNavItem(item))}
        </div>

        {/* User section */}
        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-gray-200">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.email}</p>
              <p className="text-xs text-gray-400">
                {isAdmin ? 'Administrator' : 'Moderator'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:text-white"
            onClick={handleSignOut}
          >
            <LogOut className="w-3 h-3 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0 min-w-0">
        {/* Top bar */}
        <div className="bg-gray-950 shadow-sm border-b border-gray-800 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden flex-shrink-0 text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-white truncate">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-400 truncate">{description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Back to Main Site - Desktop */}
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex bg-blue-600 border-blue-500 text-white hover:bg-blue-700 hover:border-blue-600"
                onClick={() => navigate('/')}
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Site
              </Button>
              
              {/* Back to Main Site - Mobile */}
              <Button 
                variant="outline" 
                size="sm" 
                className="sm:hidden bg-blue-600 border-blue-500 text-white hover:bg-blue-700 hover:border-blue-600"
                onClick={() => navigate('/')}
              >
                <Home className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-700">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="relative text-gray-400 hover:text-white hover:bg-gray-700">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6 overflow-auto bg-black min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};