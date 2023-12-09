import {} from "koishi";

declare module "koishi" {
  interface Tables {
    signin_oni: db;
  }
}

export interface db {
  id: string;
  userName: string;
  onegold: number;
  gold: number;
  allDay: number;
  time: string;
  yiyan: string;
}
