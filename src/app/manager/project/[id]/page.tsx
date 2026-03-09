"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import TaskCard from "@/components/TaskCard"

export default function ProjectPage() {

  const params = useParams()
  const projectId = params.id as string

  const [tasks, setTasks] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [title, setTitle] = useState("")


  const fetchTasks = async () => {

    const res = await fetch(`/api/tasks/project?projectId=${projectId}`)
    const data = await res.json()

    setTasks(data)
  }


  const fetchMembers = async () => {

    const res = await fetch(`/api/manager/project-members?projectId=${projectId}`, {
      credentials: "include"
    })

    const data = await res.json()

    setMembers(data.members)
  }


  const createTask = async () => {

    if (!title) return

    await fetch("/api/tasks/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        projectId
      })
    })

    setTitle("")
    fetchTasks()
  }


  const assignTask = async (taskId: string, userId: string) => {

    await fetch("/api/tasks/assign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        taskId,
        userId
      })
    })

    fetchTasks()
  }


  const handleDragEnd = async (result: any) => {

    if (!result.destination) return

    const taskId = result.draggableId
    const newStatus = result.destination.droppableId

    await fetch("/api/tasks/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        taskId,
        status: newStatus
      })
    })

    fetchTasks()
  }


  useEffect(() => {
    if (projectId) {
      fetchTasks()
      fetchMembers()
    }
  }, [projectId])


  const columns = {
    TODO: tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: tasks.filter((t) => t.status === "DONE")
  }

  return (

    <div style={{ padding: "40px" }}>

      <h1>Kanban Board</h1>


      <div style={{ marginBottom: "20px" }}>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task"
        />

        <button onClick={createTask}>Add Task</button>

      </div>

      <DragDropContext onDragEnd={handleDragEnd}>

        <div style={{ display: "flex", gap: "20px" }}>

          {Object.entries(columns).map(([status, columnTasks]) => (

            <Droppable droppableId={status} key={status}>

              {(provided) => (

                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    width: "320px",
                    minHeight: "400px",
                    padding: "20px",
                    background: "#f4f4f4",
                    borderRadius: "10px"
                  }}
                >

                  <h2>{status.replace("_", " ")}</h2>

                  {columnTasks.map((task: any, index: number) => (

                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >

                      {(provided) => (

                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            marginBottom: "10px",
                            ...provided.draggableProps.style
                          }}
                        >


                          <TaskCard task={task} />


                          <div style={{ marginTop: "6px" }}>

                            <small>
                              Assigned: {task.assignedTo?.email || "Unassigned"}
                            </small>

                            <br />

                            <select
                              onChange={(e) =>
                                assignTask(task.id, e.target.value)
                              }
                            >

                              <option value="">Assign user</option>

                              {members.map((m: any) => (

                                <option key={m.user.id} value={m.user.id}>
                                  {m.user.email}
                                </option>

                              ))}

                            </select>

                          </div>

                        </div>

                      )}

                    </Draggable>

                  ))}

                  {provided.placeholder}

                </div>

              )}

            </Droppable>

          ))}

        </div>

      </DragDropContext>

    </div>

  )
}