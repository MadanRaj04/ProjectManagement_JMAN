"use client"

import { useEffect, useState } from "react"

interface Task {
  id: string
  title: string
  status: string
}

interface Comment {
  id: string
  content: string
  user: {
    email: string
  }
}

export default function TaskCard({ task }: { task: Task }) {

  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {

    try {
      const res = await fetch(`/api/tasks/comments?taskId=${task.id}`)
      const data = await res.json()

      setComments(data)

    } catch (error) {
      console.error("Error fetching comments:", error)
    }

  }

  const addComment = async () => {

    if (!comment.trim()) return

    try {

      setLoading(true)

      await fetch("/api/tasks/comment", {
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    taskId: task.id,
    content: comment
  })
})

      setComment("")
      fetchComments()

    } catch (error) {
      console.error("Error adding comment:", error)
    }

    setLoading(false)

  }

  return (

    <div
      style={{
        border: "1px solid #ddd",
        padding: "12px",
        marginBottom: "10px",
        borderRadius: "8px",
        background: "white"
      }}
    >

      <h4>{task.title}</h4>


      <div style={{ marginTop: "10px" }}>

        <strong>Comments</strong>

        {comments.length === 0 && (
          <p style={{ fontSize: "12px" }}>
            No comments yet
          </p>
        )}

        {comments.map((c) => (

          <div
            key={c.id}
            style={{
              fontSize: "13px",
              marginTop: "4px"
            }}
          >

            <b>{c.user.email}</b>: {c.content}

          </div>

        ))}

      </div>


      <div
        style={{
          display: "flex",
          gap: "6px",
          marginTop: "10px"
        }}
      >

        <input
          placeholder="Add comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            flex: 1,
            padding: "6px"
          }}
        />

        <button
          onClick={addComment}
          disabled={loading}
        >
          Send
        </button>

      </div>

    </div>

  )

}