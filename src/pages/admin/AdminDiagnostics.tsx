import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/navigation/tabs';
import { AdminTicketManager } from '@/components/admin/AdminTicketManager';
import { TicketSystemDiagnostic } from '@/components/diagnostics/TicketSystemDiagnostic';
import { SystemTester } from '@/components/diagnostics/SystemTester';
import { AdminQRCodeFixer } from '@/components/admin/AdminQRCodeFixer';
import { QuickQRViewer } from '@/components/tickets/QuickQRViewer';
import { SupabaseFunctionChecker } from '@/components/diagnostics/SupabaseFunctionChecker';
import { FunctionDeploymentGuide } from '@/components/diagnostics/FunctionDeploymentGuide';
import { DatabaseFunctionTester } from '@/components/diagnostics/DatabaseFunctionTester';
import { DatabaseQRManager } from '@/components/diagnostics/DatabaseQRManager';
import { DirectQRGenerator } from '@/components/diagnostics/DirectQRGenerator';
import { TestDataCleaner } from '@/components/diagnostics/TestDataCleaner';
import { StripeDataValidator } from '@/components/diagnostics/StripeDataValidator';
import { Settings, Wrench, TestTube, QrCode, Eye, Rocket, Database, CreditCard } from 'lucide-react';

const AdminDiagnostics = () => {
  return (
    <AdminLayout title="System Diagnostics" description="System health monitoring and troubleshooting tools">
      <div className="space-y-6">
        <Tabs defaultValue="system-test" className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="system-test" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              System Test
            </TabsTrigger>
            <TabsTrigger value="stripe-data" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Stripe Data
            </TabsTrigger>
            <TabsTrigger value="ticket-system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Ticket System
            </TabsTrigger>
            <TabsTrigger value="data-cleaner" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Cleaner
            </TabsTrigger>
            <TabsTrigger value="db-qr" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              DB QR Manager
            </TabsTrigger>
            <TabsTrigger value="deploy" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Deploy Fix
            </TabsTrigger>
            <TabsTrigger value="qr-tools" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Tools
            </TabsTrigger>
            <TabsTrigger value="qr-viewer" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              QR Viewer
            </TabsTrigger>
            <TabsTrigger value="admin-tools" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Admin Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system-test" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  System Health Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SystemTester />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stripe-data" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Stripe Data Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StripeDataValidator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data-cleaner" className="mt-6">
            <TestDataCleaner />
          </TabsContent>

          <TabsContent value="ticket-system" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Ticket System Diagnostics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TicketSystemDiagnostic />
                </CardContent>
              </Card>
              
              <SupabaseFunctionChecker />
              
              <DatabaseFunctionTester />
            </div>
          </TabsContent>

          <TabsContent value="db-qr" className="mt-6">
            <DatabaseQRManager />
          </TabsContent>

          <TabsContent value="deploy" className="mt-6">
            <FunctionDeploymentGuide />
          </TabsContent>

          <TabsContent value="qr-tools" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AdminQRCodeFixer />
                </CardContent>
              </Card>
              
              <DirectQRGenerator />
            </div>
          </TabsContent>

          <TabsContent value="qr-viewer" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <QuickQRViewer />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    QR Access Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p><strong>View QR Page:</strong> Enter any QR token to open the verification page</p>
                    <p><strong>Copy URL:</strong> Get shareable links for QR verification</p>
                    <p><strong>Scanner:</strong> Use the QR scanner tool for live validation</p>
                    <p><strong>My Tickets:</strong> View all tickets and their QR codes</p>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Tip:</strong> You can now access QR verification pages directly without scanning with your phone!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="admin-tools" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Administrative Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AdminTicketManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDiagnostics;