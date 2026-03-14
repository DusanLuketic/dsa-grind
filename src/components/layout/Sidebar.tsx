'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Map as MapIcon,
  BookOpen,
  BarChart2,
  Timer,
  Menu,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

interface SidebarProps {
  solvedCount: number
  totalCount: number
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/roadmap', label: 'Roadmap', icon: MapIcon },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/stats', label: 'Statistics', icon: BarChart2 },
  { href: '/session', label: 'Session', icon: Timer },
]

function NavContent({ solvedCount, totalCount }: SidebarProps) {
  const pathname = usePathname()
  const progressPercent = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border border-b p-6">
        <h1 className="text-foreground text-xl font-bold">DSA Grind</h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Problem Tracker
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Progress Footer */}
      <div className="border-border border-t p-4">
        <div className="text-muted-foreground mb-2 flex justify-between text-xs">
          <span>Progress</span>
          <span>
            {solvedCount} / {totalCount} solved
          </span>
        </div>
        <Progress value={progressPercent} />
      </div>
    </div>
  )
}

export function Sidebar({ solvedCount, totalCount }: SidebarProps) {
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="bg-card border-border hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[260px] lg:flex-col lg:border-r">
        <NavContent solvedCount={solvedCount} totalCount={totalCount} />
      </aside>

      {/* Mobile: Sheet Drawer */}
      <Sheet onOpenChange={setSidebarOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 lg:hidden"
              aria-label="Open menu"
            />
          }
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="bg-card w-[260px] p-0">
          <NavContent solvedCount={solvedCount} totalCount={totalCount} />
        </SheetContent>
      </Sheet>
    </>
  )
}
