
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, PenTool, Mic, BarChart, Settings, Camera, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/constants'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/ar-mode', label: 'Lens', icon: Camera },
  { href: '/diary', label: 'Diary', icon: BookOpen },
  { href: '/writing', label: 'Write', icon: PenTool },
  { href: '/speaking', label: 'Speak', icon: Mic },
]

export function BottomNav() {
  const pathname = usePathname()

  if (['/', '/auth', '/onboarding', '/intro'].includes(pathname)) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border flex justify-around items-center h-16 px-2 md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  
  if (['/', '/auth', '/onboarding', '/intro'].includes(pathname)) return null

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r border-border p-4 z-50">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">{APP_NAME.charAt(0)}</div>
        <span className="font-bold text-xl text-primary">{APP_NAME}</span>
      </div>
      
      <div className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-secondary hover:text-primary"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
        <Link
          href="/progress"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
            pathname === '/progress' 
              ? "bg-primary text-primary-foreground shadow-md" 
              : "text-muted-foreground hover:bg-secondary hover:text-primary"
          )}
        >
          <BarChart className="h-5 w-5" />
          <span className="font-medium">Statistics</span>
        </Link>
      </div>

      <Link
        href="/settings"
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all mb-4",
          pathname === '/settings' 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:bg-secondary hover:text-primary"
        )}
      >
        <Settings className="h-5 w-5" />
        <span className="font-medium">Settings</span>
      </Link>
    </aside>
  )
}
