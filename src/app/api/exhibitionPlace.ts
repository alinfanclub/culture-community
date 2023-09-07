import axios from "axios";
import { XMLParser } from "fast-xml-parser";

export async function getExhibitionPlaceList() {
  try {
    const apikey =
      "m3ho69kK58KuHNP7rPhql%2Fjgiy42xvyvwijPb5b4a5qfH9e0BDIIWAjZyTFjMn%2BoWh5TPMDNGkX24Pq5UfGflA%3D%3D";
    const res = await axios
      .get(
        `https://apis.data.go.kr/6260000/BusanCultureExhibitService/getBusanCultureExhibit?serviceKey=${apikey}&pageNo=1&numOfRows=4000`
      )
      .then((res) => {
        var xml = new XMLParser().parse(res.data);
        const sortingData = xml.response.body.items.item
          .map((item: any) => ({
            ...item,
            sortNum: Number(item.op_st_dt.replace(/-/g, "")),
          }))
          .sort((a: any, b: any) => b.sortNum - a.sortNum)
          .slice(0, 100);

        return sortingData;
      });

    return res;
  } catch (error) {
    console.log(error);
  }
}
