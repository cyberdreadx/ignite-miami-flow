import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/contexts/UserRoleContext';
import { Card, CardContent } from '@/components/ui/layout/card';
import { XCircle } from 'lucide-react';

const AdminSettingsPage = () => {
  const { user } = useAuth();
  const { isAdmin, loading } = useUserRoles();

  if (loading) {
    return (
      <AdminLayout title="Settings" description="Loading…">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <AdminLayout title="Access Denied" description="Admins only">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Only admins can manage settings.</p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings" description="Configure platform settings like staff PIN.">
      <AdminSettings />
    </AdminLayout>
  );
};

export default AdminSettingsPage;
