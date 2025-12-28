"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, X } from "lucide-react";

const mockNotifications = [
  {
    id: 1,
    title: "Welcome to ContentCraft AI!",
    message: "Get started by generating your first content",
    time: "5 minutes ago",
    read: false,
  },
  {
    id: 2,
    title: "Credits Running Low",
    message: "You have 8 credits remaining",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    title: "New Feature Available",
    message: "Check out our new Projects feature",
    time: "2 days ago",
    read: true,
  },
];

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [credits, setCredits] = useState(session?.user?.creditsRemaining || 0);
  const [subscriptionTier, setSubscriptionTier] = useState(
    session?.user?.subscriptionTier || "free"
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  // Fetch fresh credits and subscription tier
  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/credits");
      const data = await response.json();
      if (response.ok) {
        setCredits(data.credits);
        setSubscriptionTier(data.tier);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  // Fetch on mount and when pathname changes
  useEffect(() => {
    fetchUserData();
  }, [pathname]);

  // Poll for updates every 3 seconds on generate and billing pages
  useEffect(() => {
    if (
      pathname === "/dashboard/generate" ||
      pathname === "/dashboard/billing"
    ) {
      const interval = setInterval(fetchUserData, 3000);
      return () => clearInterval(interval);
    }
  }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
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
              {credits} Credits
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-purple-600 hover:text-purple-700"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                          !notification.read ? "bg-purple-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full ml-2 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
                {subscriptionTier} Plan
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
}
