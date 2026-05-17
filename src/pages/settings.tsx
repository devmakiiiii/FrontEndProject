import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">System Settings</h1>

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Appearance</h2>
            <p className="text-muted-foreground">Theme and display preferences</p>
            <Button variant="outline">Change Theme</Button>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <p className="text-muted-foreground">Manage your notification preferences</p>
            <Button variant="outline">Notification Settings</Button>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-xl font-semibold">Privacy & Security</h2>
            <p className="text-muted-foreground">Control your privacy settings</p>
            <Button variant="outline">Privacy Settings</Button>
          </div>
        </Card>
      </div>
    </main>
  );
}