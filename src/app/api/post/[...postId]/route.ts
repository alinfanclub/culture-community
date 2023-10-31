import { NextRequest, NextResponse } from "next/server";
import { getPostDetailData } from "../../fireStore";

export async function GET(req: NextRequest)  {
  console.log("path",req.nextUrl.pathname.replace('/api/post/',''))
    const post = await getPostDetailData(req.nextUrl.pathname.replace('/api/post/',''));
    return NextResponse.json(post);
}