"use client";

import { createPost } from "@/app/api/fireStore";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useState } from "react";
const QuillEditor = dynamic(() => import("@/components/QuillEditor"), {
  ssr: false,
});

export default function WritePage() {
  const [html, setHtml] = useState("");
  const [postInfo, setPostInfo] = useState({
    title: "",
    name: "",
  });
  const param = useParams().slug;

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

  const handleSubmitPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(postInfo);
    console.log(html);
    try {
      if (html) {
        await createPost(postInfo.title, postInfo.name, html, param.toString());
      } else {
        alert("내용을 입력해주세요");
      }
    } catch (error) {
      console.log(error);
    }
  };
  console.log(param);

  return (
    <div>
      <form onSubmit={handleSubmitPost}>
        <label htmlFor="">
          <p>제목</p>
          <input
            type="text"
            name="title"
            onChange={handleChange}
            className="bg-black border-white border"
            required
          />
        </label>
        <label htmlFor="">
          <p>이름</p>
          <input
            type="text"
            name="name"
            onChange={handleChange}
            className="bg-black border-white border"
            required
          />
        </label>
        <QuillEditor handleHtmlChange={handleHtmlChange} html={html} />
        <button type="submit">제출</button>
      </form>
    </div>
  );
}
