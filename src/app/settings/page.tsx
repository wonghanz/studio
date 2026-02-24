"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { LogOut, Globe, Bell, Shield, Info, Cloud } from 'lucide-react'

export default function SettingsPage() {
  const [examTarget, setExamTarget] = useState('IELTS')
  const { toast } = useToast()

  useEffect(() => {
    const saved = localStorage.getItem('native_exam_target') || 'IELTS'
    setExamTarget(saved)
  }, [])

  const saveExamTarget = (val: string) => {
    setExamTarget(val)
    localStorage.setItem('native_exam_target', val)
    toast({ title: "Settings Updated", description: `Your target exam is now set to ${val}.` })
  }

  const syncDrafts = () => {
    toast({ title: "Syncing...", description: "All offline drafts are being synchronized." })
    setTimeout(() => {
      toast({ title: "Sync Complete", description: "All data is up to date." })
    }, 1500)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 pb-24">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and profile.</p>
      </header>

      <div className="space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Globe className="w-5 h-5" />
              Exam Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={examTarget} onValueChange={saveExamTarget} className="grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value="IELTS" id="ielts" className="peer sr-only" />
                <Label
                  htmlFor="ielts"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="text-sm font-bold">IELTS</span>
                  <span className="text-[10px] opacity-60 mt-1">International Standard</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="MUET" id="muet" className="peer sr-only" />
                <Label
                  htmlFor="muet"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="text-sm font-bold">MUET</span>
                  <span className="text-[10px] opacity-60 mt-1">Malaysian University English Test</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-sync Drafts</Label>
                <p className="text-xs text-muted-foreground">Automatically upload writing drafts when online.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button variant="outline" className="w-full" onClick={syncDrafts}>
              Sync Now
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Daily Reminders</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label>New Feedback Alerts</Label>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button variant="outline" className="w-full flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4" />
            Privacy Policy
          </Button>
          <Button variant="outline" className="w-full flex items-center gap-2 text-muted-foreground">
            <Info className="w-4 h-4" />
            App Version 1.0.4
          </Button>
          <Button variant="destructive" className="w-full flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
