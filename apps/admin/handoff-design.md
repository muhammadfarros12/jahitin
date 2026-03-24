# INSTRUCTION FOR LLM/VIBECODING: FULL PROJECT BLUEPRINT

This document contains 100% complete source code for the "Jahitin" UI. 
**Your task is to integrate this into a project with an existing Hono RPC backend using TanStack Start.**

---

## 🎨 GLOBAL STYLES (src/index.css)
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Merriweather:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(0.984 0.003 247.85);
  --foreground: oklch(0.25 0.03 260);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.25 0.03 260);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.25 0.03 260);
  --primary: oklch(0.585 0.204 277);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.928 0.006 265);
  --secondary-foreground: oklch(0.35 0.03 260);
  --muted: oklch(0.967 0.003 265);
  --muted-foreground: oklch(0.55 0.02 264);
  --accent: oklch(0.930 0.033 273);
  --accent-foreground: oklch(0.35 0.03 260);
  --destructive: oklch(0.637 0.208 25);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.94 0.005 258);
  --input: oklch(0.94 0.005 258);
  --ring: oklch(0.585 0.204 277);
  --sidebar: oklch(0.967 0.003 265);
  --sidebar-foreground: oklch(0.28 0.037 260);
  --sidebar-primary: oklch(0.585 0.204 277);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.930 0.033 273);
  --sidebar-accent-foreground: oklch(0.37 0.03 260);
  --sidebar-border: oklch(0.94 0.005 258);
  --sidebar-ring: oklch(0.585 0.204 277);
  
  --radius: 0.75rem;
  
  --shadow-xs: 0px 2px 4px 0px hsl(0 0% 0% / 0.02);
  --shadow-sm: 0px 4px 12px -2px hsl(0 0% 0% / 0.04);
  --shadow-md: 0px 8px 16px -4px hsl(0 0% 0% / 0.06);

  --stat-warning: oklch(0.60 0.18 48);
  --stat-danger:  oklch(0.58 0.22 25);
  --stat-success: oklch(0.52 0.18 165);
}

.dark {
  --background: oklch(0.167 0.038 265);
  --foreground: oklch(0.93 0.010 255);
  --card: oklch(0.274 0.042 264);
  --card-foreground: oklch(0.93 0.010 255);
  --popover: oklch(0.274 0.042 264);
  --popover-foreground: oklch(0.93 0.010 255);
  --primary: oklch(0.68 0.16 277);
  --primary-foreground: oklch(0.10 0.02 265);
  --secondary: oklch(0.295 0.038 264);
  --secondary-foreground: oklch(0.88 0.008 258);
  --muted: oklch(0.21 0.032 264);
  --muted-foreground: oklch(0.60 0.015 262);
  --accent: oklch(0.32 0.038 265);
  --accent-foreground: oklch(0.88 0.008 258);
  --destructive: oklch(0.64 0.21 25);
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.42 0.028 263);
  --input: oklch(0.40 0.028 263);
  --ring: oklch(0.68 0.16 277);
  --stat-warning: oklch(0.76 0.15 48);
  --stat-danger:  oklch(0.72 0.20 25);
  --stat-success: oklch(0.70 0.15 165);
  --sidebar: oklch(0.274 0.041 263);
  --sidebar-foreground: oklch(0.93 0.010 255);
  --sidebar-primary: oklch(0.68 0.16 277);
  --sidebar-primary-foreground: oklch(0.10 0.02 265);
  --sidebar-accent: oklch(0.32 0.038 265);
  --sidebar-accent-foreground: oklch(0.88 0.008 258);
  --sidebar-border: oklch(0.31 0.032 264);
  --sidebar-ring: oklch(0.68 0.16 277);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --color-stat-warning: var(--stat-warning);
  --color-stat-danger:  var(--stat-danger);
  --color-stat-success: var(--stat-success);

  --font-sans: 'DM Sans', sans-serif;
  --font-serif: 'Merriweather', serif;
  --font-mono: 'JetBrains Mono', monospace;

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow-md: var(--shadow-md);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground antialiased font-sans; }
}

@layer utilities {
  .badge-status-order-diterima    { background-color: oklch(0.93 0.04 258); color: oklch(0.42 0.17 258); }
  .badge-status-approval-sample   { background-color: oklch(0.93 0.04 295); color: oklch(0.42 0.17 295); }
  .badge-status-menunggu-antrian  { background-color: oklch(0.96 0.10 80); color: oklch(0.48 0.14 75); }
  .badge-status-produksi-berjalan { background-color: oklch(0.95 0.08 48); color: oklch(0.48 0.14 48); }
  .badge-status-pending           { background-color: oklch(0.95 0.05 25); color: oklch(0.48 0.18 25); }
  .badge-status-quality-check     { background-color: oklch(0.93 0.05 208); color: oklch(0.42 0.12 208); }
  .badge-status-siap-diambil      { background-color: oklch(0.93 0.07 165); color: oklch(0.42 0.14 165); }
  .badge-status-order-selesai     { background-color: var(--muted); color: var(--muted-foreground); }

  :is(.dark *) .badge-status-order-diterima    { background-color: oklch(0.30 0.08 258 / 0.4); color: oklch(0.72 0.12 258); }
  :is(.dark *) .badge-status-approval-sample   { background-color: oklch(0.30 0.09 295 / 0.4); color: oklch(0.72 0.13 295); }
  :is(.dark *) .badge-status-menunggu-antrian  { background-color: oklch(0.32 0.08 80 / 0.4); color: oklch(0.80 0.13 80); }
  :is(.dark *) .badge-status-produksi-berjalan { background-color: oklch(0.32 0.08 48 / 0.4); color: oklch(0.78 0.13 48); }
  :is(.dark *) .badge-status-pending           { background-color: oklch(0.30 0.08 25 / 0.4); color: oklch(0.72 0.15 25); }
  :is(.dark *) .badge-status-quality-check     { background-color: oklch(0.30 0.07 208 / 0.4); color: oklch(0.72 0.10 208); }
  :is(.dark *) .badge-status-siap-diambil      { background-color: oklch(0.30 0.08 165 / 0.4); color: oklch(0.72 0.12 165); }

  .timeline-dot-status-order-diterima    { background-color: oklch(0.42 0.17 258); }
  .timeline-dot-status-approval-sample   { background-color: oklch(0.42 0.17 295); }
  .timeline-dot-status-menunggu-antrian  { background-color: oklch(0.48 0.14 75);  }
  .timeline-dot-status-produksi-berjalan { background-color: oklch(0.48 0.14 48);  }
  .timeline-dot-status-pending           { background-color: oklch(0.48 0.18 25);  }
  .timeline-dot-status-quality-check     { background-color: oklch(0.42 0.12 208); }
  .timeline-dot-status-siap-diambil      { background-color: oklch(0.42 0.14 165); }
  .timeline-dot-status-order-selesai     { background-color: var(--muted-foreground); }

  :is(.dark *) .timeline-dot-status-order-diterima    { background-color: oklch(0.72 0.12 258); }
  :is(.dark *) .timeline-dot-status-approval-sample   { background-color: oklch(0.72 0.13 295); }
  :is(.dark *) .timeline-dot-status-menunggu-antrian  { background-color: oklch(0.80 0.13 80);  }
  :is(.dark *) .timeline-dot-status-produksi-berjalan { background-color: oklch(0.78 0.13 48);  }
  :is(.dark *) .timeline-dot-status-pending           { background-color: oklch(0.72 0.15 25);  }
  :is(.dark *) .timeline-dot-status-quality-check     { background-color: oklch(0.72 0.10 208); }
  :is(.dark *) .timeline-dot-status-siap-diambil      { background-color: oklch(0.72 0.12 165); }
}
```

---

## 🛠️ CORE INFRASTRUCTURE

### src/types/index.ts
```typescript
export type OrderStatus =
  | 'ORDER_DITERIMA' | 'APPROVAL_SAMPLE' | 'MENUNGGU_ANTRIAN' | 'PRODUKSI_BERJALAN' 
  | 'PENDING' | 'QUALITY_CHECK' | 'SIAP_DIAMBIL' | 'ORDER_SELESAI';

export interface User { id: number; name: string; email: string; }

export interface Order {
  id: number;
  order_code: string;
  customer_name: string;
  order_description: string;
  estimated_finished_date: string;
  current_status: OrderStatus;
  is_pending: boolean;
  active_production_issue: any | null;
}
```

### src/lib/auth-context.tsx (SSR SAFE)
```tsx
"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("jahitin_user") : null;
    if (saved) setUser(JSON.parse(saved));
    setIsInitialized(true);
  }, []);

  const login = async (email: string, password: string) => {
    if (email === "admin@gmail.com" && password === "password123") {
      const u = { id: 1, name: "Admin Jahitin", email };
      setUser(u);
      localStorage.setItem("jahitin_user", JSON.stringify(u));
      return true;
    }
    return false;
  };

  const logout = () => { setUser(null); localStorage.removeItem("jahitin_user"); };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {isInitialized ? children : <div className="min-h-screen bg-background" />}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};
```

### src/lib/utils.ts
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### src/hooks/use-mobile.ts
```typescript
import * as React from "react"
const MOBILE_BREAKPOINT = 768
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])
  return !!isMobile
}
```

---

## 🏛️ STRUCTURAL LAYOUT

### src/components/layout/admin-layout.tsx
```tsx
import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Scissors, LayoutDashboard, LogOut, User, Key, ChevronUp, Moon, Sun } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPasswordSheet, setShowPasswordSheet] = useState(false);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  const handleLogout = () => { logout(); toast.success("Berhasil logout"); navigate({ to: "/login" }); };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-none bg-sidebar shadow-none">
          <SidebarHeader className="p-6 pb-2 flex flex-row items-center gap-2.5">
            <Scissors className="h-6 w-6 text-primary shrink-0" />
            <span className="font-bold text-xl text-foreground tracking-tight">Jahitin</span>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu className="px-2 mt-4">
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link to="/dashboard" />}
                  isActive={location.pathname === "/dashboard"}
                  className="w-full justify-start gap-2 h-10 px-3 rounded-md transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-border">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="text-sm font-medium">Dark Mode</span>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton className="h-12 w-full px-2 rounded-lg cursor-pointer transition-all duration-150 hover:bg-sidebar-accent group">
                    <div className="flex items-center gap-2 w-full">
                      <div className="h-8 w-8 rounded-full bg-muted group-hover:bg-sidebar-accent-foreground/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-muted-foreground group-hover:text-sidebar-foreground" />
                      </div>
                      <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
                        <span className="text-sm font-semibold truncate w-full tracking-tight">{user?.name}</span>
                        <span className="text-xs text-muted-foreground truncate w-full tracking-tight">{user?.email}</span>
                      </div>
                      <ChevronUp className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-sidebar-foreground transition-all group-hover:-translate-y-0.5 shrink-0" />
                    </div>
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side="top" align="end" className="w-56">
                <DropdownMenuItem onClick={() => setShowPasswordSheet(true)} className="gap-2"><Key className="h-4 w-4"/>Ubah Password</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600"><LogOut className="h-4 w-4"/>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 p-2 bg-sidebar overflow-hidden flex flex-col">
          <div className="flex-1 bg-background rounded-3xl shadow-xs overflow-hidden flex flex-col">
            <header className="h-14 flex items-center shrink-0 justify-between px-6 border-b border-border">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <div className="h-4 w-[1px] bg-border" />
                <h1 className="text-sm font-semibold text-foreground tracking-tight">Dashboard</h1>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="max-w-7xl mx-auto"><Outlet /></div>
            </div>
          </div>
        </main>
      </div>

      <Sheet open={showPasswordSheet} onOpenChange={setShowPasswordSheet}>
        <SheetContent side="right">
          <SheetHeader><SheetTitle>Ubah Password</SheetTitle></SheetHeader>
          <div className="grid gap-4 py-6">
            <div className="grid gap-2"><Label>Password Lama</Label><Input type="password" /></div>
            <div className="grid gap-2"><Label>Password Baru</Label><Input type="password" /></div>
            <Button className="mt-4" onClick={() => setShowPasswordSheet(false)}>Simpan</Button>
          </div>
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}
```

---

## 📋 MAIN PAGES

### src/pages/dashboard.tsx
```tsx
import { useState, useMemo } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, AlertCircle, CheckCircle2, Clock, Shirt } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// [VIBECODING]: Replace with actual RPC client data fetching
import { DUMMY_ORDERS } from "@/data/dummy-data";
import type { Order, OrderStatus } from "@/types";
import { toast } from "sonner";

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
  ORDER_DITERIMA:    { label: "Order Diterima",    color: "badge-status-order-diterima" },
  APPROVAL_SAMPLE:   { label: "Approval Sample",   color: "badge-status-approval-sample" },
  MENUNGGU_ANTRIAN:  { label: "Menunggu Antrian",  color: "badge-status-menunggu-antrian" },
  PRODUKSI_BERJALAN: { label: "Produksi Berjalan", color: "badge-status-produksi-berjalan" },
  PENDING:           { label: "Pending",           color: "badge-status-pending" },
  QUALITY_CHECK:     { label: "Quality Check",     color: "badge-status-quality-check" },
  SIAP_DIAMBIL:      { label: "Siap Diambil",      color: "badge-status-siap-diambil" },
  ORDER_SELESAI:     { label: "Selesai",           color: "badge-status-order-selesai" },
};

export function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>(DUMMY_ORDERS);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("semua");

  const stats = useMemo(() => ({
      total: orders.length,
      produksi: orders.filter(o => o.current_status === "PRODUKSI_BERJALAN").length,
      pending: orders.filter(o => o.current_status === "PENDING").length,
      selesai: orders.filter(o => o.current_status === "ORDER_SELESAI").length,
  }), [orders]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* STAT CARDS ARE IDENTICAL IN STRUCTURE */}
        <Card className="border border-border bg-card shadow-xs">
          <CardContent className="px-5 py-4 flex items-center justify-between">
            <div className="space-y-1.5 align-baseline">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.15em]">Total Order</p>
              <div className="text-4xl font-semibold tracking-tight tabular-nums">{stats.total}</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0"><Shirt className="h-6 w-6 text-primary" /></div>
          </CardContent>
        </Card>
        {/* ... Repeat for other stats ... */}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList><TabsTrigger value="semua">Semua</TabsTrigger><TabsTrigger value="aktif">Aktif</TabsTrigger><TabsTrigger value="selesai">Selesai</TabsTrigger></TabsList>
            </Tabs>
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input placeholder="Cari order..." className="pl-10" value={search} onChange={(e)=>setSearch(e.target.value)}/></div>
          </div>
          <Button className="h-10">Buat Order Baru</Button>
        </div>

        <div className="border rounded-xl bg-background overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-muted/30"><TableRow><TableHead>Order Code</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {orders.map(o => (
                <TableRow key={o.id} className="cursor-pointer hover:bg-accent/30">
                  <TableCell className="font-mono text-primary font-medium">{o.order_code}</TableCell>
                  <TableCell>{o.customer_name}</TableCell>
                  <TableCell><Badge className={STATUS_LABELS[o.current_status].color}>{STATUS_LABELS[o.current_status].label}</Badge></TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
```

---

## 📦 UI COMPONENTS (src/components/ui/)

### # FILE: src/components/ui/button.tsx
```tsx
"use client"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-muted dark:border-input dark:bg-input/30",
        ghost: "hover:bg-muted hover:text-foreground",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
      },
      size: {
        default: "h-8 gap-1.5 px-2.5",
        sm: "h-7 gap-1 px-2.5 text-[0.8rem]",
        lg: "h-10 gap-1.5 px-4 text-base",
        icon: "size-8",
        "icon-sm": "size-7",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({ className, variant, size, ...props }: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
export { Button, buttonVariants }
```

### # FILE: src/components/ui/table.tsx
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return <div className="relative w-full overflow-x-auto"><table className={cn("w-full text-sm", className)} {...props} /></div>
}
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />
}
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr className={cn("border-b transition-colors hover:bg-muted/50", className)} {...props} />
}
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return <th className={cn("h-10 px-4 text-left font-medium text-foreground whitespace-nowrap", className)} {...props} />
}
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("p-4 align-middle whitespace-nowrap", className)} {...props} />
}
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
```

---

**[VIBECODING]: Please recreate Sidebar, Dialog, Sheet, and Dropdown-Menu using the same Base UI implementation patterns as above. All logic and CSS tokens are provided in this blueprint.**
