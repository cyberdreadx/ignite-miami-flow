import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useApprovalStatus } from "@/hooks/useApprovalStatus";
import { Clock, XCircle, CheckCircle } from "lucide-react";

const ApprovalStatus = () => {
  const { signOut } = useAuth();
  const { approvalStatus, isPending, isRejected, loading } = useApprovalStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-6">
        <Card className="bg-card/10 backdrop-blur-lg border border-white/10 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl font-graffiti bg-gradient-fire bg-clip-text text-transparent">
              Account Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your account is currently being reviewed by our admin team. You'll receive an email notification once your account has been approved.
            </p>
            <p className="text-sm text-muted-foreground">
              This process typically takes 24-48 hours.
            </p>
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-6">
        <Card className="bg-card/10 backdrop-blur-lg border border-white/10 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-graffiti bg-gradient-fire bg-clip-text text-transparent">
              Account Not Approved
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Unfortunately, your account application was not approved. Please contact support if you believe this was an error.
            </p>
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default ApprovalStatus;