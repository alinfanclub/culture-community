"use client";

import { deleteSpace } from "@/app/api/fireStore";
import { spaceAreaType } from "@/app/types/mySpaceType";
import { timeStampFormat } from "@/app/util/timeStampFormat";
import { formatAgo } from "@/app/util/timeago";
import { DocumentData } from "firebase/firestore";
import Image from "next/image";

export default function SpaceBlock({ data }: DocumentData, { index }: any) {
  const time = timeStampFormat(data.createdAt);

  const handleSpaceDelete = () => {
    if (confirm("스페이스를 삭제하시겠습니까?")) {
      deleteSpace(data.spaceId);
    }
  };
  return (
    <article key={index} className="w-60 rounded-2xl text-white">
      <a href={`/mypage/${data.spaceId}`} target="_blank">
        <div className="rounded-lg max-w-full image-thumbnail-crop-frame overflow-hidden flex items-center justify-center aspect-[4/2]">
          <Image
            src={data.backgroundImage}
            alt="spaceImage"
            width={500}
            height={500}
            className="rounded-br-[30%] h-full w-full object-cover"
          />
        </div>
      </a>
      <div className="flex justify-between">
        <div>
          <a href={`/mypage/${data.spaceId}`} target="_blank">
            <h1>{data.title}</h1>
          </a>
          <div className="flex gap-2 items-center">
            <small>{data.userInfos.displayName}</small>
            <span>-</span>
            <small>{formatAgo(time)}</small>
          </div>
        </div>
        <button type="button" onClick={handleSpaceDelete}>
          삭제
        </button>
      </div>
    </article>
  );
}
