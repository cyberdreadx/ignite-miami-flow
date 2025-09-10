import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, QrCode, AlertTriangle } from 'lucide-react';

export const AdminQRCodeFixer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const fixMissingQRCodes = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('fix-missing-qr-codes');

      if (error) throw error;

      setResults(data);
      
      if (data.success) {
        toast({
          title: "QR Code Fix Complete",
          description: `Fixed ${data.fixed_count} tickets. ${data.errors ? `${data.errors.length} errors occurred.` : ''}`,
          variant: data.errors && data.errors.length > 0 ? "destructive" : "default",
        });
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('Error fixing QR codes:', error);
      toast({
        title: "Error",
        description: "Failed to fix QR codes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          QR Code Emergency Fix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This tool will find any paid tickets that are missing QR codes and generate them.
          Use this if customers report they can't access their QR codes.
        </p>
        
        <Button 
          onClick={fixMissingQRCodes}
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Fixing QR Codes...
            </>
          ) : (
            <>
              <QrCode className="w-4 h-4 mr-2" />
              Fix Missing QR Codes
            </>
          )}
        </Button>

        {results && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Results:</h4>
            <p className="text-sm">Fixed: {results.fixed_count} tickets</p>
            {results.errors && results.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-destructive font-medium">Errors:</p>
                <ul className="text-xs text-destructive mt-1">
                  {results.errors.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};