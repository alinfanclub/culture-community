import { Timestamp } from "firebase/firestore";

export type spaceAreaType = {
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
