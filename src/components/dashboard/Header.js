"use client";

import { useSession } from "next-auth/react";
import { Bell, ChevronDown } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title - will be dynamic later */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Welcome back, {session?.user?.name || "User"}!
          </p>
        </div>

        {/* Right Side - Credits & Profile */}
        <div className="flex items-center space-x-6">
          {/* Credits Display */}
          <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-purple-900">
              {session?.user?.creditsRemaining || 0} Credits
            </span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-900">
                {session?.user?.name || "User"}
              </div>
              <div className="text-xs text-gray-600 capitalize">
                {session?.user?.subscriptionTier || "Free"} Plan
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
}
