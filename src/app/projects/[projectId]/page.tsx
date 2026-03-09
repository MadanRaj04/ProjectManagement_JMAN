"use client"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
export default function ProjectDetailsPage() {
 const params = useParams()
 return (
<div className="p-8 bg-gray-100 min-h-screen">
<h1 className="text-3xl font-bold mb-6">
       Project Details
</h1>
<Card>
<CardContent className="p-6">
<p>
           Project ID: {params.projectId}
</p>
<p>Status: ACTIVE</p>
<p>Manager: John</p>
</CardContent>
</Card>
</div>
 )
}