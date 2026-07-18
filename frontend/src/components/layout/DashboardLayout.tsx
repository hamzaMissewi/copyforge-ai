'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { LogOut, Zap, LayoutDashboard, Wand2, FileText, Clock, Settings, CreditCard, Menu, X } from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/generate', label: 'Generate', icon: Wand2 },
    { href: '/dashboard/templates', label: 'Templates', icon: FileText },
    { href: '/dashboard/history', label: 'History', icon: Clock },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    { href: '/dashboard/pricing', label: 'Pricing', icon: CreditCard },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
        router.push('/auth/login');
        return null;
    }

    const sidebar = (
        <aside className='w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full'>
            <div className='p-6 border-b border-gray-800 flex items-center justify-between'>
                <Link href='/dashboard' className='flex items-center gap-2'>
                    <Zap className='w-7 h-7 text-violet-500' />
                    <span className='text-xl font-bold'>CopyForge</span>
                </Link>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className='lg:hidden text-gray-400 hover:text-white'
                >
                    <X className='w-5 h-5' />
                </button>
            </div>

            <nav className='flex-1 p-4 space-y-1'>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-violet-600/10 text-violet-400 border border-violet-500/20'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}>
                            <Icon className='w-5 h-5' />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className='p-4 border-t border-gray-800'>
                <div className='bg-gray-800 rounded-lg p-3 mb-3'>
                    <div className='flex items-center justify-between text-sm'>
                        <span className='text-gray-400'>Credits</span>
                        <span className='text-violet-400 font-semibold'>
                            {user
                                ? user.generationsLimit === -1
                                    ? `${user.generationsUsed}/∞`
                                    : `${user.generationsUsed}/${user.generationsLimit}`
                                : '0/5'}
                        </span>
                    </div>
                    {user && user.generationsLimit !== -1 && (
                        <div className='w-full bg-gray-700 rounded-full h-2 mt-2'>
                            <div
                                className='bg-violet-500 h-2 rounded-full transition-all'
                                style={{
                                    width: `${Math.min((user.generationsUsed / user.generationsLimit) * 100, 100)}%`,
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold'>
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <span className='text-sm text-gray-300 truncate max-w-[120px]'>
                            {user?.name}
                        </span>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            router.push('/');
                        }}
                        className='text-gray-400 hover:text-red-400 transition-colors'>
                        <LogOut className='w-4 h-4' />
                    </button>
                </div>
            </div>
        </aside>
    );

    return (
        <div className='min-h-screen bg-gray-950 text-white flex'>
            {/* Desktop sidebar */}
            <div className='hidden lg:block h-screen sticky top-0'>
                {sidebar}
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className='fixed inset-0 z-50 lg:hidden'>
                    <div
                        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className='relative z-10 h-full'>
                        {sidebar}
                    </div>
                </div>
            )}

            <div className='flex-1 flex flex-col min-h-screen'>
                {/* Mobile header */}
                <div className='lg:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900'>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className='text-gray-300 hover:text-white'
                    >
                        <Menu className='w-6 h-6' />
                    </button>
                    <Link href='/dashboard' className='flex items-center gap-2'>
                        <Zap className='w-5 h-5 text-violet-500' />
                        <span className='font-bold'>CopyForge</span>
                    </Link>
                    <div className='w-6' />
                </div>

                <main className='flex-1 overflow-auto'>
                    <div className='p-4 lg:p-8'>{children}</div>
                </main>
            </div>
        </div>
    );
}
