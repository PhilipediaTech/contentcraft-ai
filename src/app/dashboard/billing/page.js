"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CreditCard, Check, Clock, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    credits: 10,
    features: ["10 credits/month", "Basic templates", "7-day history"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    credits: 500,
    popular: true,
    features: [
      "500 credits/month",
      "All templates",
      "Unlimited history",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    credits: 9999,
    features: [
      "Unlimited credits",
      "Custom templates",
      "Team collaboration",
      "Dedicated support",
    ],
  },
];

export default function BillingPage() {
  const { data: session, update } = useSession();
  const [currentPlan, setCurrentPlan] = useState(
    session?.user?.subscriptionTier || "free"
  );
  const [currentCredits, setCurrentCredits] = useState(
    session?.user?.creditsRemaining || 10
  );
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/credits");
        const data = await response.json();
        if (response.ok) {
          setCurrentCredits(data.credits);
          setCurrentPlan(data.tier);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/billing/transactions");
        const data = await response.json();
        if (response.ok) {
          setTransactions(data.transactions || []);
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        // Use mock data if API fails
        setTransactions([
          {
            id: "1",
            createdAt: new Date().toISOString(),
            description: "Initial signup - Free plan",
            amount: 0,
            status: "completed",
          },
        ]);
      }
    };

    fetchTransactions();
  }, [currentPlan]);

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return;

    setIsUpgrading(true);

    try {
      const response = await fetch("/api/billing/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setCurrentPlan(data.subscriptionTier);
        setCurrentCredits(data.creditsRemaining);

        // Update session
        await update();

        toast.success(
          `Successfully upgraded to ${selectedPlan.name} plan! (Demo Mode)`
        );
        setShowUpgradeModal(false);
        setSelectedPlan(null);

        // Show demo reminder
        setTimeout(() => {
          toast.info("💡 This is a demo. No real payment was processed.");
        }, 1500);

        // Reload transactions
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(data.error || "Failed to upgrade plan");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error("Failed to upgrade plan");
    } finally {
      setIsUpgrading(false);
    }
  };

  const currentPlanData = plans.find((p) => p.id === currentPlan);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Billing & Subscription
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Demo Mode Warning */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CreditCard className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Demo Mode - Portfolio Project
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This is a demonstration. No real payments are processed. All
                transactions are simulated.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 capitalize">
                {currentPlanData?.name || currentPlan} Plan
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {currentCredits} credits remaining
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">
                ${currentPlanData?.price || 0}
              </div>
              <div className="text-sm text-gray-600">/month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Available Plans
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? "border-2 border-purple-600" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}

              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {currentPlan === plan.id ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(plan)}
                    className="w-full"
                  >
                    {plan.price === 0 ? "Downgrade" : "Upgrade"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.description}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      ${transaction.amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-600 flex items-center justify-end">
                      <Check className="w-4 h-4 mr-1" />
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Credits Used</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(currentPlanData?.credits || 10) - currentCredits}
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  Credits Remaining
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {currentCredits}
                </div>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Next Billing</div>
                <div className="text-2xl font-bold text-gray-900">Jan 28</div>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedPlan.price === 0 ? "Downgrade to" : "Upgrade to"}{" "}
              {selectedPlan.name}?
            </h2>

            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">{selectedPlan.name} Plan</span>
                <span className="font-bold text-gray-900">
                  ${selectedPlan.price}/mo
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {selectedPlan.credits} credits per month
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Demo Mode:</strong> This is a simulated transaction. No
                real payment will be processed.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUpgradeModal(false);
                  setSelectedPlan(null);
                }}
                disabled={isUpgrading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUpgrade}
                disabled={isUpgrading}
                className="flex-1"
              >
                {isUpgrading
                  ? "Processing..."
                  : `Confirm ${
                      selectedPlan.price === 0 ? "Downgrade" : "Upgrade"
                    } (Demo)`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
