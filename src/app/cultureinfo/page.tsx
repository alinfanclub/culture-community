"use client";

import { useEffect, useState } from "react";
import { getExhibitionPlaceList } from "../api/exhibitionPlace";
import { XMLParser } from "fast-xml-parser";
import Image from "next/image";

export default function CultureInfoPage() {
  const [exData, setExData] = useState<any>([]);
  // 현재 시간 ex>20230708
  const nowDate = new Date();
  const year = nowDate.getFullYear();
  const month = nowDate.getMonth() + 1;
  const date = nowDate.getDate();
  const now =
    year +
    (month < 10 ? "0" + month : "" + month) +
    (date < 10 ? "0" + date : "" + date).toString();
  useEffect(() => {
    getExhibitionPlaceList(now).then((data) => {
      // xml 데이터를 json으로 변환
      console.log(data);
      setExData(data);
    });
  }, []);
  console.log(exData);
  return (
    <div>
      {exData &&
        exData
          .sort(
            (a: { startDate: number }, b: { startDate: number }) =>
              a.startDate - b.startDate
          )
          .map(
            (
              data: {
                area: string;
                title: string;
                startDate: number;
                endDate: number;
                gpsX: number;
                gpsy: number;
                place: string;
                realmName: string;
                thumbnail: string;
              },
              index: any
            ) => (
              <div key={index}>
                <div>{data.area}</div>
                <div>{data.title}</div>
                <div>{data.startDate}</div>
                <div>{data.endDate}</div>
                <div>{data.gpsX}</div>
                <div>{data.gpsy}</div>
                <div>{data.place}</div>
                <div>{data.realmName}</div>
                <Image src={data.thumbnail} alt="" width={100} height={100} />
              </div>
            )
          )}
    </div>
  );
}
