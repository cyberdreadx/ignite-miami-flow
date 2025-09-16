import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Terminal, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  AlertTriangle,
  Rocket,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const FunctionDeploymentGuide: React.FC = () => {
  const { toast } = useToast();
  
  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    toast({
      title: "Copied to clipboard",
      description: "Command copied to clipboard",
    });
  };

  const commands = [
    {
      step: 1,
      title: "Install Supabase CLI",
      command: "npm install -g supabase",
      description: "Install the Supabase CLI globally"
    },
    {
      step: 2,
      title: "Login to Supabase",
      command: "supabase login",
      description: "Authenticate with your Supabase account"
    },
    {
      step: 3,
      title: "Link Project",
      command: "supabase link --project-ref zbggiyxzgpgvcegamuda",
      description: "Link to your Supabase project"
    },
    {
      step: 4,
      title: "Deploy All Functions",
      command: "supabase functions deploy",
      description: "Deploy all functions to Supabase"
    }
  ];

  const individualFunctions = [
    "generate-qr-code",
    "verify-ticket-public", 
    "validate-qr-code",
    "recover-missing-tickets"
  ];

  return (
    <div className="space-y-6">
      <Alert className="border-red-200 bg-red-50 dark:bg-red-950/50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription>
          <div className="space-y-2">
            <strong className="text-red-800 dark:text-red-200">Functions Not Deployed</strong>
            <p className="text-red-700 dark:text-red-300">
              Your Edge Functions exist in the codebase but haven't been deployed to Supabase yet.
              Follow the steps below to deploy them.
            </p>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            Function Deployment Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {commands.map((cmd, index) => (
            <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
              <Badge variant="outline" className="mt-1">
                {cmd.step}
              </Badge>
              <div className="flex-1">
                <h4 className="font-medium mb-2">{cmd.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{cmd.description}</p>
                <div className="flex items-center gap-2 p-2 bg-muted rounded font-mono text-sm">
                  <code className="flex-1">{cmd.command}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyCommand(cmd.command)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Deploy Individual Functions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you prefer to deploy functions individually, use these commands:
          </p>
          <div className="grid gap-2">
            {individualFunctions.map((funcName, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                <code className="flex-1 text-sm">supabase functions deploy {funcName}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyCommand(`supabase functions deploy ${funcName}`)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            After Deployment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm">✅ <strong>Check Function Status:</strong> Run diagnostics again to verify deployment</p>
            <p className="text-sm">✅ <strong>Test QR Generation:</strong> Try generating QR codes from the admin panel</p>
            <p className="text-sm">✅ <strong>Test Validation:</strong> Verify QR codes work properly</p>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://supabase.com/docs/guides/functions', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Function Docs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://supabase.com/dashboard/project/zbggiyxzgpgvcegamuda/functions', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View in Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <strong>💡 Pro Tip:</strong>
            <p className="text-sm">
              Make sure you're in the project root directory when running these commands. 
              The Supabase CLI will automatically detect your <code>supabase/</code> folder and deploy the functions.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};