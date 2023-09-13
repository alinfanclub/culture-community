import { timeStampFormat } from "@/app/util/timeStampFormat";
import { formatAgo } from "@/app/util/timeago";
import { DocumentData } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

export default function PostBlock({ data }: { data: DocumentData }) {
  return (
    <div className="w-60 rounded-2xl text-white h-fit">
      <Link href={`/mypage/mypost/${data.postId}`}>
        <div className="rounded-lg max-w-full image-thumbnail-crop-frame overflow-hidden flex items-center justify-center aspect-[4/2]">
          <Image
            src={data.backgroundImage}
            alt="spaceImage"
            width={500}
            height={500}
            className="rounded-br-[30%] h-full w-full object-cover"
          />
        </div>
      </Link>
      <div className="flex justify-between">
        <div>
          <Link href={`/mypage/mypost/${data.postId}`}>
            <h1>{data.title}</h1>
          </Link>
          <div className="flex gap-2 items-center">
            <small>{data.userInfos.displayName}</small>
            <span>-</span>
            <small>{formatAgo(timeStampFormat(data.createdAt))}</small>
          </div>
        </div>
        <button type="button">삭제</button>
      </div>
    </div>
  );
}
