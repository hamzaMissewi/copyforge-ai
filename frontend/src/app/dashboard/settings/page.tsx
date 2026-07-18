"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { userAPI, billingAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { Save, Key, Trash2, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth();
  const { addToast } = useToast();
  const [brandVoice, setBrandVoice] = useState("");
  const [brandIndustry, setBrandIndustry] = useState("");
  const [brandTargetAudience, setBrandTargetAudience] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    userAPI.profile().then((r) => {
      setBrandVoice(r.data.brandVoice || "");
      setBrandIndustry(r.data.brandIndustry || "");
      setBrandTargetAudience(r.data.brandTargetAudience || "");
      setName(r.data.name || "");
      setEmail(r.data.email || "");
    }).catch(() => {
      addToast("Failed to load profile settings", "error");
    });
  }, [addToast]);

  const handleSaveProfile = useCallback(async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile({ name, email });
      refreshUser();
      addToast("Profile updated successfully", "success");
    } catch {
      addToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  }, [name, email, refreshUser, addToast]);

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword || !newPassword) {
      addToast("Please fill in both password fields", "warning");
      return;
    }
    setSaving(true);
    try {
      await userAPI.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      addToast("Password changed successfully", "success");
    } catch {
      addToast("Failed to change password. Check your current password.", "error");
    } finally {
      setSaving(false);
    }
  }, [currentPassword, newPassword, addToast]);

  const handleSaveBrand = useCallback(async () => {
    setSaving(true);
    try {
      await userAPI.updateBrand({ brandVoice, brandIndustry, brandTargetAudience });
      refreshUser();
      addToast("Brand settings saved successfully", "success");
    } catch {
      addToast("Failed to save brand settings", "error");
    } finally {
      setSaving(false);
    }
  }, [brandVoice, brandIndustry, brandTargetAudience, refreshUser, addToast]);

  const handleDeleteAccount = useCallback(async () => {
    try {
      await userAPI.deleteAccount();
      addToast("Account deleted successfully", "success");
      logout();
    } catch {
      addToast("Failed to delete account", "error");
    }
  }, [logout, addToast]);

  const handleManageBilling = useCallback(async () => {
    try {
      const res = await billingAPI.portal();
      if (res.data.url && !res.data.url.startsWith("#")) {
        window.location.replace(res.data.url);
      } else {
        addToast("Stripe billing portal is not configured.", "warning");
      }
    } catch {
      addToast("Failed to open billing portal", "error");
    }
  }, [addToast]);

  const isPaid = user?.subscriptionTier === "PRO" || user?.subscriptionTier === "BUSINESS";

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400 mb-8">Manage your account and brand voice</p>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Key className="w-5 h-5" />
            Change Password
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                placeholder="Min 6 characters"
              />
            </div>
          </div>
          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Key className="w-4 h-4" />
            Change Password
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Brand Voice Settings</h2>
          <p className="text-sm text-gray-400">
            These settings help the AI generate copy that matches your brand&apos;s unique voice and style.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Brand Voice</label>
            <textarea
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
              placeholder="e.g., Professional yet friendly, uses humor, conversational tone, speaks directly to the reader..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Industry</label>
            <input
              type="text"
              value={brandIndustry}
              onChange={(e) => setBrandIndustry(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              placeholder="e.g., SaaS, E-commerce, Fitness, Real Estate, Restaurant..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Target Audience</label>
            <textarea
              value={brandTargetAudience}
              onChange={(e) => setBrandTargetAudience(e.target.value)}
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
              placeholder="e.g., Tech-savvy millennials, 25-40 years old, interested in productivity tools..."
            />
          </div>

          <button
            onClick={handleSaveBrand}
            disabled={saving}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Brand Settings"}
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span>{user?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Plan</span>
              <span className="text-violet-400 font-medium">{user?.subscriptionTier}</span>
            </div>
          </div>

          {isPaid && (
            <button
              onClick={handleManageBilling}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Manage Subscription
            </button>
          )}

          <div className="border-t border-gray-800 pt-4 mt-4">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-red-400 text-sm font-medium">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Yes, Delete My Account
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
