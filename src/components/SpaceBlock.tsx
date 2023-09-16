"use client";

import { deleteSpace } from "@/app/api/fireStore";
import { useAuthContext } from "@/app/context/FirebaseAuthContext";
import { spaceAreaType } from "@/app/types/mySpaceType";
import { timeStampFormat } from "@/app/util/timeStampFormat";
import { formatAgo } from "@/app/util/timeago";
import { DocumentData } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
type index = {
  order: number;
};
export default function SpaceBlock({ data, order }: DocumentData & index) {
  const time = timeStampFormat(data.createdAt);
  const handleSpaceDelete = () => {
    if (
      confirm("스페이스를 삭제하시겠습니까? 하위 게시글도 모두 삭제됩니다.")
    ) {
      deleteSpace(data.spaceId);
    }
  };
  const { user } = useAuthContext();
  return (
    <article className="w-content text-white">
      <Link href={`/mypage/myspace/${data.spaceId}`}>
        <div className={`w-40 bg-white aspect-[1/1.5] text-black relative p-6`}>
          <Image
            src={data.backgroundImage}
            alt="postImage"
            width={500}
            height={500}
            className="aspect-[1/1.5] object-cover object-center absolute top-0 left-0 z-[0]"
          />
          <div className="z-10 w-[80%] h-[80%] bg-white absolute top-1/2 left-1/2  -translate-x-1/2 -translate-y-1/2 p-4">
            <small className="text-right w-full block">
              {user?.displayName} 시인선{" "}
              {order < 10 ? "0" + (order + 1) : order + 1}
            </small>
            <h3>{data.title}</h3>
          </div>
        </div>
      </Link>
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <small>{data.userInfos.displayName}</small>
          <span>-</span>
          <small>{formatAgo(time)}</small>
        </div>

        <button type="button" onClick={handleSpaceDelete}>
          삭제
        </button>
      </div>
    </article>
  );
}
