import { Schema } from "koishi";

export interface Config {
  gold: number;
  imgUrl: string;
  yiyanapi: string;
  eryan: string;
  appId: string;
  token: string;
  templateId: string;
  keyboardId: string;
}

export const Config: Schema<Config> = Schema.object({
  gold: Schema.number().default(10).description("签到最多得到多少金币"),
  imgUrl: Schema.string()
    .default("https://kleiforums.s3.amazonaws.com/gameimages/457140-image.jpg")
    .description("签到时使用的顶部图片地址"),
  yiyanapi: Schema.string()
    .default("http://api.guaqb.cn/v1/onesaid")
    .description("一言请求的api"),
  eryan: Schema.string()
    .default("知识才应是一个人类最虔诚的信仰 (")
    .description("签到时第二行显示的文字"),
  appId: Schema.string().description("机器人ID"),
  token: Schema.string().description("机器人token"),
  templateId: Schema.string().description("模板ID"),
  keyboardId: Schema.string().description("按钮ID"),
});
