"use client";

import { getOpenCriticPostList } from "@/app/api/fireStore";

import PostBlock from "./PostBlock";
import Link from "next/link";
import { formatAgo } from "@/app/util/timeago";
import { timeStampFormat } from "@/app/util/timeStampFormat";
import { useQuery } from "@tanstack/react-query";

export default function IsOpenCriticPosts() {
  const {
    data: openCriticPosts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["openCriticPosts"],
    queryFn: () => getOpenCriticPostList(),
  });

  return (
    <section className="p-4">
      <article className="grid grid-cols-2 h-auto gap-4 xl:grid-cols-5 py-2 xl:grow xl:h-full">
        {openCriticPosts?.map((data, index) => (
          <div
            key={index}
            onClick={() => {
              // setSelectedPostId(data.postId), setIsView(true);
            }}
            className="bg-zinc-700 p-4 rounded-2xl"
          >
            <Link
              href={{
                pathname: `/posts/${data.postId}`,
                query: { postId: data.postId },
              }}
              className="flex flex-col gap-4"
            >
              <h3 className="text-bold">{data.title}</h3>
              <div
                dangerouslySetInnerHTML={{ __html: data.content }}
                className=" line-clamp-5 "
              ></div>
              <div className="flex justify-between">
                <div>{data.author}</div>
                <div>{formatAgo(data.createdAt)}</div>
              </div>
            </Link>
          </div>
        ))}
      </article>
    </section>
  );
}
