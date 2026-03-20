import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

export const AdminSetupInfo: React.FC = () => {
  return (
    <Card className="p-6 bg-yellow-500/10 border-yellow-500/30 max-w-2xl mx-auto mb-8">
      <div className="flex items-start gap-4">
        <ShieldCheck className="text-yellow-400 flex-shrink-0" size={32} />
        <div>
          <h3 className="text-lg font-bold mb-2 text-yellow-400">Admin Account Setup</h3>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              To create an admin account, you need to manually update the user role in the database.
            </AlertDescription>
          </Alert>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Create a regular account by signing up</li>
            <li>Go to your Supabase dashboard</li>
            <li>Navigate to the SQL Editor</li>
            <li>Run this query (replace with your user ID):
              <pre className="mt-2 p-3 bg-black/30 rounded text-xs overflow-x-auto">
{`-- First, find your user ID from the auth.users table
SELECT id, email FROM auth.users;

-- Then update the user metadata
UPDATE auth.users 
SET raw_user_meta_data = 
  jsonb_set(raw_user_meta_data, '{role}', '"admin"')
WHERE id = 'your-user-id-here';`}
              </pre>
            </li>
            <li>Sign out and sign back in to see admin features</li>
          </ol>
        </div>
      </div>
    </Card>
  );
};
