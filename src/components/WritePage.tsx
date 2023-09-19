"use client";

import { createPost } from "@/app/api/fireStore";
import { useParams, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import QuillEditor from "@/components/QuillEditor";
import ReactQuill from "react-quill";
import("@/components/QuillEditor");

export default function WritePage() {
  const router = useRouter();
  const [html, setHtml] = useState("");
  const [imgQuery, setImgQuery] = useState<string | null>("");
  const [postInfo, setPostInfo] = useState({
    title: "",
    name: "",
  });
  const param = useParams().slug;
  const queryClient = useQueryClient();

  const handleHtmlChange = (html: string) => {
    setHtml(html);
    console.log(html);
  };

  const handleChange = (
    e: React.ChangeEvent<EventTarget & HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPostInfo((item) => ({ ...item, [name]: value }));
    console.log(postInfo);
  };

  const deletePostMutation = useMutation(
    ({
      title,
      name,
      content,
      param,
      imgQuery,
    }: {
      title: string;
      name: string;
      content: string;
      param: string;
      imgQuery: string;
    }) => createPost(title, name, content, param, imgQuery),
    {
      onSuccess: () => queryClient.invalidateQueries(["spacePostList"]),
    }
  );

  const handleSubmitPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(postInfo);
    console.log(html);
    try {
      if (html) {
        deletePostMutation.mutate(
          {
            title: postInfo.title,
            name: postInfo.name,
            content: html,
            param: param.toString(),
            imgQuery: imgQuery ? imgQuery : "wave",
          },
          {
            onSuccess: () => {
              router.push(`/mypage/myspace/${param}`);
            },
          }
        );
        // await createPost(
        //   postInfo.title,
        //   postInfo.name,
        //   html,
        //   param.toString(),
        //   imgQuery ? imgQuery : "wave"
        // ).then(() => {
        //   router.push(`/mypage/myspace/${param}`);
        // });
      } else {
        alert("내용을 입력해주세요");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="flex h-full">
      <div className="h-full w-full bg-zinc-800 xl:w-1/2">
        <form
          onSubmit={handleSubmitPost}
          className=" flex flex-col gap-2 h-full"
        >
          <label htmlFor="" className="">
            <input
              type="text"
              name="title"
              onChange={handleChange}
              className="bg-transparent w-full h-16  p-2 xl:p-6"
              placeholder="제목을 입력해주세요"
              required
            />
          </label>
          <label htmlFor="" className="">
            <input
              type="text"
              name="name"
              onChange={handleChange}
              className="bg-transparent w-full h-16  p-2 xl:p-6"
              required
              placeholder="이름을 입력해주세요"
            />
          </label>
          <div className="grow overflow-y-scroll xl:mb-24  px-2 xl:px-6">
            <QuillEditor handleHtmlChange={handleHtmlChange} html={html} />
          </div>
          <div className="w-full h-20 bg-zinc-700 flex gap-4 p-2 2xl:p-6 box-border">
            <button type="submit">제출</button>
            <button type="button">임시저장</button>
          </div>
        </form>
      </div>
      <div className="hidden w-1/2 xl:block overflow-y-scroll xl:mb-24 p-2 xl:p-6">
        <div className="flex items-baseline gap-8 pb-10">
          <p className="h-16  line  leading-[4rem] text-2xl">
            {postInfo.title}
          </p>
          <p className="h-8 line  leading-[2rem]">{postInfo.name}</p>
        </div>
        <div
          className="ql-editor viewer"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
}
