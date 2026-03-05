import { CardType } from "@/src/interfaces/interfaces"; // Make sure to import CardType instead of Task
import { NextResponse } from "next/server";

// Temporary storage (Will reset if the server restarts!)
let tasks: CardType[] = [];

export async function POST(req: Request) {
    try {
        const body: CardType = await req.json();    

        // Only check for the title, because content is optional!
        if (!body.title) {
            return NextResponse.json(
                { message: "A task title is required!" },
                { status: 400 }
            );
        }
        const savedData: CardType = {
            id: body.id,
            ticketId: body.ticketId,
            title: body.title,
            content: body.content, 
            column: body.column,
            priority: body.priority,
            assignee: body.assignee,
        };

        tasks.push(savedData);
        console.log("New task saved:", savedData);

        return NextResponse.json(
            { message: 'Data saved successfully', newCard: savedData }, 
            { status: 201 }
        );  
        
    } catch(error) {
        console.log("Error: ", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        return NextResponse.json(
            { message: "Tasks retrieved successfully!", data: tasks },
            { status: 200 }
        );
    } catch(error) {
        console.log("Error: ", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}