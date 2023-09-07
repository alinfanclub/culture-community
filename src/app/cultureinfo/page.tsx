"use client";

import { useEffect, useState } from "react";
import { getExhibitionPlaceList } from "../api/exhibitionPlace";
import { XMLParser } from "fast-xml-parser";

export default function CultureInfoPage() {
  const [exData, setExData] = useState<any>([]);
  useEffect(() => {
    getExhibitionPlaceList().then((data) => {
      // xml 데이터를 json으로 변환
      setExData(data);
    });
  }, []);
  console.log(exData);
  return (
    <div>
      {exData.map(
        (
          data: {
            title: string;
            op_st_dt: string;
            op_ed_dt: string;
            place_nm: string;
          },
          index: any
        ) => (
          <div key={index}>
            <h1>{data.title}</h1>
            <p>시작일 : {data.op_st_dt}</p>
            <p>종료일 : {data.op_ed_dt}</p>
            <p>장소 : {data.place_nm}</p>
          </div>
        )
      )}
    </div>
  );
}
