import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { AdminOverview } from '@/components/AdminOverview';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/contexts/UserRoleContext';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

const NewAdmin = () => {
  const { user } = useAuth();
  const { isAdmin, hasRole, loading } = useUserRoles();

  const hasAccess = isAdmin || hasRole('moderator') || hasRole('admin');

  if (loading) {
    return (
      <AdminLayout title="Loading..." description="Checking permissions...">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!user || !hasAccess) {
    return (
      <AdminLayout title="Access Denied" description="You need administrator privileges">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You need administrator or moderator privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Dashboard" 
      description="Welcome to the SkateBurn admin dashboard. Monitor your business and manage operations."
    >
      <AdminOverview />
    </AdminLayout>
  );
};

export default NewAdmin;