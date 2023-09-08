import { timeStampFormat } from "@/app/util/timeStampFormat";
import { formatAgo } from "@/app/util/timeago";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";

type spaceAreaType = {
  data: {
    title: string;
    userInfos: {
      displayName: string;
      photoURL: string;
    };
    spaceId: string;
    uid: string;
    fixed: boolean;
    createdAt: Timestamp;
    backgroundImage: string;
  };
};

export default function SpaceBlock({ data }: spaceAreaType, { index }: any) {
  const time = timeStampFormat(data.createdAt);
  return (
    <article key={index} className="w-40 aspect-square rounded-2xl text-white">
      <Image
        src={data.backgroundImage}
        alt="spaceImage"
        width={500}
        height={500}
        className="aspect-[2/1] object-cover rounded-br-3xl"
      />
      <h1>{data.title}</h1>
      <p>{data.userInfos.displayName}</p>
      <p>{time}</p>
      <p>{formatAgo(time)}</p>
    </article>
  );
}
