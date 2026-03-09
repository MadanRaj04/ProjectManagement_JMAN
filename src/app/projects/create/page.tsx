"use client"
import { Button } from "@/components/ui/button"
export default function CreateProjectPage() {
 return (
<div className="p-8">
<h1 className="text-2xl font-bold mb-6">
       Create Project
</h1>
<input
       type="text"
       placeholder="Project Name"
       className="border p-2 rounded w-full mb-4"
     />
<Button>
       Create Project
</Button>
</div>
 )
}