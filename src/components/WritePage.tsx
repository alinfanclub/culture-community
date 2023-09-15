"use client";

import { createPost } from "@/app/api/fireStore";
import QuillEditor from "@/components/QuillEditor";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import QuillViewer from "./QuillViewer";
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
  console.log(param);

  return (
    <section className="flex h-full">
      <div className="h-full w-full p-2 2xl:p-6 bg-zinc-800 2xl:w-1/2">
        <form
          onSubmit={handleSubmitPost}
          className=" flex flex-col gap-2 h-full"
        >
          <label htmlFor="" className="">
            <input
              type="text"
              name="title"
              onChange={handleChange}
              className="bg-transparent w-full h-16"
              placeholder="제목을 입력해주세요"
              required
            />
          </label>
          <label htmlFor="" className="">
            <input
              type="text"
              name="name"
              onChange={handleChange}
              className="bg-transparent w-full h-16"
              required
              placeholder="이름을 입력해주세요"
            />
          </label>
          <div className="h-full overflow-y-scroll mb-24">
            <QuillEditor handleHtmlChange={handleHtmlChange} html={html} />
          </div>
          <div className="w-full h-20 bg-zinc-700 flex gap-4 fixed left-0 bottom-0 p-2 2xl:p-6 box-border">
            <button type="submit">제출</button>
            <button type="button">임시저장</button>
          </div>
        </form>
      </div>
      <div className="hidden w-1/2 2xl:block overflow-y-scroll mb-24 p-2 2xl:p-6">
        <p className="h-16  line  leading-[4rem]">{postInfo.title}</p>
        <p className="h-16 line  leading-[4rem]">{postInfo.name}</p>
        <QuillViewer html={html} />
      </div>
    </section>
  );
}
