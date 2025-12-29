"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Monitor, Smartphone, X } from "lucide-react"

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "RU", name: "Russia" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "EG", name: "Egypt" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Peru" },
  { code: "VE", name: "Venezuela" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "ID", name: "Indonesia" },
  { code: "MY", name: "Malaysia" },
  { code: "PH", name: "Philippines" },
  { code: "NZ", name: "New Zealand" },
  { code: "IE", name: "Ireland" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "PT", name: "Portugal" },
  { code: "GR", name: "Greece" },
  { code: "TR", name: "Turkey" },
  { code: "IL", name: "Israel" },
  { code: "CZ", name: "Czech Republic" },
  { code: "RO", name: "Romania" },
  { code: "HU", name: "Hungary" },
].sort((a, b) => a.name.localeCompare(b.name))

export default function ProfileClient({ profile, user }: any) {
  const [activeTab, setActiveTab] = useState("profile")
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [country, setCountry] = useState(profile?.country || "")
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || "")

  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [showSessionsModal, setShowSessionsModal] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(profile?.two_factor_enabled || false)
  const [sessions, setSessions] = useState<any[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const response = await fetch("/api/sessions/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      })

      if (!response.ok) throw new Error("Failed to revoke session")

      alert("Session revoked successfully!")
      fetchSessions() // Refresh the list
    } catch (error: any) {
      alert("Error revoking session: " + error.message)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone,
          country,
          date_of_birth: dateOfBirth,
        })
        .eq("id", user.id)

      if (error) throw error

      // Log activity
      await fetch("/api/log-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_type: "profile_update",
          description: "Updated profile information",
          severity: "info",
        }),
      })

      alert("Profile updated successfully!")
    } catch (error: any) {
      alert("Error updating profile: " + error.message)
    }
  }

  const handleChangePassword = async () => {
    const newPassword = "newPassword" // Placeholder for actual state
    const confirmPassword = "confirmPassword" // Placeholder for actual state

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters")
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      // Log activity
      await fetch("/api/log-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_type: "password_change",
          description: "Password changed successfully",
          severity: "warning",
        }),
      })

      alert("Password changed successfully!")
      setShowPasswordModal(false)
    } catch (error: any) {
      alert("Error changing password: " + error.message)
    }
  }

  const handleToggle2FA = async () => {
    const newState = !twoFactorEnabled
    setTwoFactorEnabled(newState)

    try {
      const { error } = await supabase.from("profiles").update({ two_factor_enabled: newState }).eq("id", user.id)

      if (error) throw error

      // Log activity
      await fetch("/api/log-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_type: newState ? "2fa_enabled" : "2fa_disabled",
          description: `Two-factor authentication ${newState ? "enabled" : "disabled"}`,
          severity: "warning",
        }),
      })

      alert(`Two-factor authentication ${newState ? "enabled" : "disabled"}!`)
      setShow2FAModal(false)
    } catch (error: any) {
      alert("Error updating 2FA: " + error.message)
      setTwoFactorEnabled(!newState)
    }
  }

  const fetchActivityLogs = async () => {
    setLoadingActivities(true)
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      setActivityLogs(data || [])
    } catch (error: any) {
      console.error("Error fetching activity logs:", error)
    } finally {
      setLoadingActivities(false)
    }
  }

  const fetchSessions = async () => {
    setLoadingSessions(true)
    try {
      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .order("last_active_at", { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (error: any) {
      console.error("Error fetching sessions:", error)
    } finally {
      setLoadingSessions(false)
    }
  }

  useEffect(() => {
    if (activeTab === "activity") {
      fetchActivityLogs()
    }
  }, [activeTab])

  useEffect(() => {
    if (showSessionsModal) {
      fetchSessions()
    }
  }, [showSessionsModal])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/profile/upload-avatar", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const { url } = await response.json()
      setAvatarUrl(url)

      // Log activity
      await fetch("/api/log-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_type: "profile_picture_update",
          description: "Updated profile picture",
          severity: "info",
        }),
      })

      alert("Profile picture updated successfully!")
    } catch (error: any) {
      alert("Error uploading avatar: " + error.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard")}
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black"
          >
            ← Back to Dashboard
          </Button>
        </div>

        <div className="flex gap-2 mb-6 bg-gray-900/50 p-1 rounded-lg w-full md:w-fit overflow-x-auto">
          <Button
            variant={activeTab === "profile" ? "default" : "ghost"}
            onClick={() => setActiveTab("profile")}
            className={activeTab === "profile" ? "bg-cyan-400 text-black hover:bg-cyan-300" : "text-white"}
          >
            Profile
          </Button>
          <Button
            variant={activeTab === "security" ? "default" : "ghost"}
            onClick={() => setActiveTab("security")}
            className={activeTab === "security" ? "bg-cyan-400 text-black hover:bg-cyan-300" : "text-white"}
          >
            Security
          </Button>
          <Button
            variant={activeTab === "activity" ? "default" : "ghost"}
            onClick={() => setActiveTab("activity")}
            className={activeTab === "activity" ? "bg-cyan-400 text-black hover:bg-cyan-300" : "text-white"}
          >
            Activity
          </Button>
        </div>

        {activeTab === "profile" && (
          <div className="space-y-6 border border-gray-800 rounded-lg p-4 md:p-6 bg-gray-900/30">
            <div>
              <h2 className="text-xl font-semibold mb-2">Profile Information</h2>
              <p className="text-gray-400 text-sm">Update your account details and personal information</p>
            </div>

            <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-800">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-cyan-400">
                  {avatarUrl ? (
                    <img src={avatarUrl || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl md:text-5xl text-cyan-400 font-bold">
                      {(fullName || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-cyan-400 text-black rounded-full p-2 cursor-pointer hover:bg-cyan-300 transition-colors"
                >
                  {uploadingAvatar ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">{fullName || user.email}</p>
                <p className="text-sm text-gray-400">Click the camera icon to upload a photo</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled className="bg-gray-900 border-gray-700 text-white/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white max-h-60">
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.name} className="text-white">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 [color-scheme:dark]"
                />
              </div>

              <div className="flex items-center gap-3 p-4 border border-cyan-400/30 rounded-lg bg-cyan-400/5">
                <div className="flex-1">
                  <p className="font-medium text-white">KYC Verification Status</p>
                  <p className="text-sm text-gray-400">Complete verification to unlock all features</p>
                </div>
                <Button className="bg-cyan-400 text-black hover:bg-cyan-300">Verify Now</Button>
              </div>

              <Button onClick={handleSaveProfile} className="bg-cyan-400 text-black hover:bg-cyan-300">
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6 border border-gray-800 rounded-lg p-6 bg-gray-900/30">
            <div>
              <h2 className="text-xl font-semibold mb-2">Security Settings</h2>
              <p className="text-gray-400 text-sm">Manage your account security and authentication</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-gray-800/50">
                <div>
                  <p className="font-medium text-white">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShow2FAModal(true)}
                  className={twoFactorEnabled ? "border-green-500 text-green-500" : "border-gray-600"}
                >
                  {twoFactorEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-gray-800/50">
                <div>
                  <p className="font-medium text-white">Password</p>
                  <p className="text-sm text-gray-400">Last changed 30 days ago</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowPasswordModal(true)}>
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-gray-800/50">
                <div>
                  <p className="font-medium text-white">Active Sessions</p>
                  <p className="text-sm text-gray-400">Manage devices with access to your account</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowSessionsModal(true)}>
                  View Sessions
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-6 border border-gray-800 rounded-lg p-6 bg-gray-900/30">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-white">Activity Log</h2>
              <p className="text-gray-400 text-sm">View your recent account activity</p>
            </div>
            {loadingActivities ? (
              <p className="text-gray-500 text-center py-8">Loading activity logs...</p>
            ) : activityLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activity recorded yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-gray-800 rounded-lg p-4 bg-gray-900/50 hover:bg-gray-900/70 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              log.severity === "critical"
                                ? "bg-red-500/20 text-red-400"
                                : log.severity === "warning"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-cyan-500/20 text-cyan-400"
                            }`}
                          >
                            {log.activity_type}
                          </span>
                          <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-white mt-2">{log.description}</p>
                        {log.ip_address && <p className="text-gray-500 text-sm mt-1">IP: {log.ip_address}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value=""
                onChange={(e) => {}}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value=""
                onChange={(e) => {}}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value=""
                onChange={(e) => {}}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} className="bg-cyan-400 text-black hover:bg-cyan-300">
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Modal */}
      <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {twoFactorEnabled ? "Disable 2FA for your account" : "Enable 2FA to add extra security"}
            </DialogDescription>
          </DialogHeader>
          {!twoFactorEnabled && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="aspect-square w-48 mx-auto bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">QR Code</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">Scan this QR code with your authenticator app</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FAModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleToggle2FA}
              className={twoFactorEnabled ? "bg-red-500 hover:bg-red-600" : "bg-cyan-400 text-black hover:bg-cyan-300"}
            >
              {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sessions Modal */}
      {showSessionsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Active Sessions</h2>
                <p className="text-gray-400 text-sm mt-1">Manage devices with access to your account</p>
              </div>
              <button
                onClick={() => setShowSessionsModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {loadingSessions ? (
                <p className="text-gray-500 text-center py-8">Loading sessions...</p>
              ) : sessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No active sessions found</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => {
                    const isCurrentSession = session.is_current
                    const timeAgo = new Date(session.last_active_at).toLocaleString()

                    return (
                      <div
                        key={session.id}
                        className="border border-gray-800 rounded-lg p-4 bg-gray-900/50 hover:bg-gray-900/70 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-cyan-500/10 rounded-lg">
                            {session.device_type === "mobile" ? (
                              <Smartphone className="w-6 h-6 text-cyan-400" />
                            ) : (
                              <Monitor className="w-6 h-6 text-cyan-400" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white">
                                {session.browser} on {session.os}
                              </h3>
                              {isCurrentSession && (
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{session.location || "Unknown location"}</p>
                            <p className="text-gray-500 text-sm mt-1">
                              IP: {session.ip_address} • {isCurrentSession ? "Active now" : timeAgo}
                            </p>
                          </div>

                          {!isCurrentSession && (
                            <button
                              onClick={() => handleRevokeSession(session.id)}
                              className="text-red-400 hover:text-red-300 transition-colors p-2"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-800">
              <Button
                onClick={() => setShowSessionsModal(false)}
                className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-semibold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
