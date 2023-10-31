import { NextRequest, NextResponse } from "next/server";
import { getOpenCriticPostList } from "../fireStore";

export async function GET()  {
    const post = await getOpenCriticPostList();
    console.log("post",post)
    return NextResponse.json(post);
}