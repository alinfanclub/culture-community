import axios from "axios";
import { XMLParser } from "fast-xml-parser";

export async function getExhibitionPlaceList(now: string) {
  try {
    const apikey = process.env.NEXT_PUBLIC_API_KEY_EXHIHIBITION_API_KEY;
    const res = await axios
      .get(
        `https://cors-anywhere.herokuapp.com/http://www.culture.go.kr/openapi/rest/publicperformancedisplays/area?serviceKey=${apikey}&RequestTime=20230901:${now}&rows=10&keyword=미술`
      )
      .then((res) => {
        var xml = new XMLParser().parse(res.data);
        console.log(xml);
        const sortingData = xml.response.msgBody.perforList.map(
          (item: any) => ({
            ...item,
          })
        );
        console.log(sortingData);
        return sortingData;
      });

    return res;
  } catch (error) {
    console.log(error);
  }
}
