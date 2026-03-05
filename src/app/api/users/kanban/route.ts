import { NextResponse } from "next/server";

interface Task {
    task_id: string,
    project_id: string,
    asignee: string,
    title: string,
    content: string,
    
}

let tasks : Task[] = [];
export async function POST(req: Request){
    try{

        const body: Task = await req.json();    

        if(!body.title || !body.content){
            return NextResponse.json(
                {message: "Unable to post tasks!"},
                {status: 400}
            );
        }

        const savedData: Task = {
            task_id: body.task_id,
            project_id: body.project_id,
            asignee: body.asignee,
            title: body.title,
            content: body.content,
            };

            tasks.push(savedData);
            console.log("New task saved:", savedData);


        return NextResponse.json(
      { message: 'Data saved successfully', data: savedData },
      { status: 201 }
    );  

        
    }

    catch(error) {
        console.log("Error: ", error);
        return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
    }
}

export async function GET(req: Request){
    try{
        return NextResponse.json(
            {message: "Tasks retrieved successfully!", data: tasks},
            {status: 200}
        );
        
        


    }catch(error){
        console.log("Error: ", error);
        return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
    }
}