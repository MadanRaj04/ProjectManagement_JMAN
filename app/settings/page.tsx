"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type UserData = {
  username: string
  email: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/settings")
        const data = await res.json()
        setUser(data)
      } catch (err) {
        console.error("Failed to load user data")
      }
    }

    fetchUser()
  }, [])

  const handleProfileUpdate = async () => {
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })
      alert("Profile updated successfully!")
    } catch (err) {
      alert("Failed to update profile")
    }
  }

  const handlePasswordChange = async () => {
    try {
      await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      })
      alert("Password changed successfully!")
      setOldPassword("")
      setNewPassword("")
    } catch (err) {
      alert("Failed to change password")
    }
  }

  const handlePreferences = async () => {
    try {
      await fetch("/api/settings/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ darkMode }),
      })
    } catch (err) {
      console.error("Failed to update preferences")
    }
  }

  if (!user) {
    return <div className="p-6">Loading settings...</div>
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input
              value={user.username}
              onChange={(e) =>
                setUser({ ...user, username: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              value={user.email}
              onChange={(e) =>
                setUser({ ...user, email: e.target.value })
              }
            />
          </div>

          <Button onClick={handleProfileUpdate}>
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Old Password</Label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <Button onClick={handlePasswordChange}>
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label>Dark Mode</Label>
          <Switch
            checked={darkMode}
            onCheckedChange={(value) => {
              setDarkMode(value)
              handlePreferences()
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
