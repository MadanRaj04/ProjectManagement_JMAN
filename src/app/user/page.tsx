"use client"

import { useState, useEffect } from "react"

export default function UserDashboard() {

  const [invites, setInvites] = useState<any[]>([])

  const fetchInvites = async () => {

    const res = await fetch("/api/user/invites", {
      credentials: "include"
    })

    const data = await res.json()

    setInvites(data)
  }

  const acceptInvite = async (invite: any) => {

    const res = await fetch("/api/user/accept-invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inviteId: invite.id,
        projectId: invite.projectId,
        userId: invite.userId
      })
    })

    const data = await res.json()

    alert(data.message)

    fetchInvites()
  }

  useEffect(() => {
    fetchInvites()
  }, [])

  return (
    <div style={{ padding: "40px" }}>

      <h1>User Dashboard</h1>

      <h2>Project Invites</h2>

      {invites.length === 0 && <p>No pending invites</p>}

      {invites.map((invite) => (

        <div key={invite.id} style={{ marginTop: "20px" }}>

          <p>
            Project: <b>{invite.project.name}</b>
          </p>

          <button onClick={() => acceptInvite(invite)}>
            Accept
          </button>

        </div>

      ))}

    </div>
  )
}