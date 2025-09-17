import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, CreditCard, TestTube, AlertTriangle, QrCode, Database, ChevronRight, Activity, Calendar } from 'lucide-react';

// Import diagnostic components
import { StripeDataValidator } from '@/components/diagnostics/StripeDataValidator';
import { SystemTester } from '@/components/diagnostics/SystemTester';
import { DataIntegrityFixer } from '@/components/diagnostics/DataIntegrityFixer';
import { SupabaseFunctionChecker } from '@/components/diagnostics/SupabaseFunctionChecker';
import { TicketSystemDiagnostic } from '@/components/diagnostics/TicketSystemDiagnostic';
import { TicketUsageAnalyzer } from '@/components/diagnostics/TicketUsageAnalyzer';
import { EventDateManager } from '@/components/admin/EventDateManager';
import { TestDataCleaner } from '@/components/diagnostics/TestDataCleaner';
type DiagnosticTool = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  category: 'primary' | 'secondary' | 'maintenance';
  status?: 'healthy' | 'warning' | 'error';
};
const AdminDiagnostics = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const diagnosticTools: DiagnosticTool[] = [{
    id: 'stripe-data',
    title: 'Stripe Data Validation',
    description: 'Verify payment data accuracy and revenue tracking',
    icon: <CreditCard className="w-5 h-5" />,
    component: <StripeDataValidator />,
    category: 'primary',
    status: 'healthy'
  }, {
    id: 'system-health',
    title: 'System Health Check',
    description: 'Test core functionality and API connections',
    icon: <Activity className="w-5 h-5" />,
    component: <SystemTester />,
    category: 'primary',
    status: 'healthy'
  }, {
    id: 'ticket-usage',
    title: 'Ticket Usage Analyzer',
    description: 'Find and fix tickets incorrectly marked as used',
    icon: <AlertTriangle className="w-5 h-5" />,
    component: <TicketUsageAnalyzer />,
    category: 'primary',
    status: 'warning'
  }, {
    id: 'data-integrity',
    title: 'Data Integrity Fixer',
    description: 'Find and fix payment data inconsistencies',
    icon: <AlertTriangle className="w-5 h-5" />,
    component: <DataIntegrityFixer />,
    category: 'primary',
    status: 'warning'
  }, {
    id: 'function-check',
    title: 'Function Status',
    description: 'Check Supabase edge function deployment',
    icon: <Settings className="w-5 h-5" />,
    component: <SupabaseFunctionChecker />,
    category: 'secondary',
    status: 'healthy'
  }, {
    id: 'event-manager',
    title: 'Event Date Manager',
    description: 'Manage Tuesday event dates and countdown timers',
    icon: <Calendar className="w-5 h-5" />,
    component: <EventDateManager />,
    category: 'secondary'
  }, {
    id: 'ticket-system',
    title: 'Ticket System Diagnostic',
    description: 'Comprehensive ticket system testing',
    icon: <QrCode className="w-5 h-5" />,
    component: <TicketSystemDiagnostic />,
    category: 'secondary'
  }, {
    id: 'data-cleaner',
    title: 'Test Data Cleaner',
    description: 'Remove test tickets and clean up database',
    icon: <Database className="w-5 h-5" />,
    component: <TestDataCleaner />,
    category: 'maintenance'
  }];
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };
  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'primary':
        return 'Core Diagnostics';
      case 'secondary':
        return 'System Tools';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Other';
    }
  };
  if (selectedTool) {
    const tool = diagnosticTools.find(t => t.id === selectedTool);
    return <AdminLayout title={tool?.title || 'Diagnostic Tool'} description={tool?.description || 'System diagnostic tool'}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setSelectedTool(null)} className="flex items-center gap-2">
              ← Back to Diagnostics
            </Button>
            {tool?.status && getStatusBadge(tool.status)}
          </div>
          
          <Card>
            <CardContent className="p-6">
              {tool?.component}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>;
  }

  // Group tools by category
  const groupedTools = diagnosticTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, DiagnosticTool[]>);
  return <AdminLayout title="System Diagnostics" description="Monitor system health and troubleshoot issues">
      <div className="space-y-8">
        {/* Quick Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-600">Core Systems</p>
                  <p className="font-semibold text-green-800">Operational</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm text-yellow-600">Data Quality</p>
                  <p className="font-semibold text-yellow-800">Needs Attention</p>
                </div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-600">Functions</p>
                  <p className="font-semibold text-blue-800">Active</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnostic Tools */}
        {Object.entries(groupedTools).map(([category, tools]) => <div key={category} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-50">
              {getCategoryTitle(category)}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map(tool => <Card key={tool.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTool(tool.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {tool.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{tool.title}</h4>
                          {tool.status && getStatusBadge(tool.status)}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {tool.description}
                    </p>
                    
                    <Button variant="outline" size="sm" className="w-full" onClick={e => {
                e.stopPropagation();
                setSelectedTool(tool.id);
              }}>
                      Open Tool
                    </Button>
                  </CardContent>
                </Card>)}
            </div>
          </div>)}
      </div>
    </AdminLayout>;
};
export default AdminDiagnostics;