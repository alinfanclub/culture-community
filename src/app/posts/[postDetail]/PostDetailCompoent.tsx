"use client";

import { getPostDetailData } from "@/app/api/fireStore";
import PostDetailComment from "@/components/PostDetailComment";
import { useQuery } from "@tanstack/react-query";
import { use, useEffect, useState } from "react";


export default function PostDetailCompoent({postId}: {postId: string}) {
  const {data: postDetailData, isLoading, isError} = useQuery({
    queryKey: ["postDetail"],
    queryFn: () => getPostDetailData(postId),
  })
  isLoading && <div>로딩중</div>

  // const [postData, setPostData] = useState(postDetailData)

  // useEffect(() => {

  //   const createdAt = postData?.createdAt.
  //   const updatedAt = postData?.updatedAt.
  //   setPostData({...postData, createdAt, updatedAt})
  // }, [postData])

  // // postDetailData createdAt to simple vlue
  // use
  return (
    <section className="relative overflow-y-auto xl:overflow-hidden">
      <article className="flex flex-col px-4 xl:p-0">
        <div className="flex items-baseline gap-8 pb-10 px-4">
          <p className="h-16  line  leading-[4rem] text-2xl">
            {postDetailData?.title}
          </p>
          <p className="h-8 line  leading-[2rem]">{postDetailData?.author}</p>
        </div>
        <div className="xl:grow px-4 pb-4 h-fit">
          <div
            className="break-words textView"
            dangerouslySetInnerHTML={{ __html: postDetailData?.content }}
          />
        </div>
      </article>
     <PostDetailComment postDetail={postDetailData!!}/>
    </section>
  );
}

