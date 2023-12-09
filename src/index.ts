import { Context, Random, Schema, Time, h } from "koishi";
import { sendMarkdown } from "./sendMarkdown";
import * as db from "./db";
import { Config } from "./config";

export const name = "signin-oni";

export const usage = `## 乱写(划掉)抄的签到,配合贼吉尔丑的图,将就着用`;

// 写得跟shit一样

export function apply(ctx: Context, config: Config) {
  // 冒泡
  ctx
    .command("signin 冒泡")
    .alias("冒泡")
    .action(async ({ session }) => {
      const logger = ctx.logger("signin-oni");

      //创建数据表名
      ctx.database.extend(
        "signin_oni",
        {
          id: "string",
          userName: "string",
          onegold: "integer",
          gold: "integer",
          allDay: "integer",
          time: "string",
          yiyan: "string",
        },
        {
          unique: ["id"],
        }
      );

      let userId = session.userId;
      let user_name = session.username;
      let signin_Time = Time.template("yyyy-MM-dd hh:mm:ss", new Date());
      let signin_gold: number = Random.int(1, config.gold);

      // 查数据库中用户的ID
      const user_file = await ctx.database.get("signin_oni", { id: userId });

      if (user_file.length === 0) {
        // 木找到
        let yiyan = await fetch(config.yiyanapi, {
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => {
            return res;
          })
          .catch((err) => {
            logger.error(err);
            return "今天,也要多喝热水哟(";
          });
        await ctx.database.upsert(
          "signin_oni",
          [
            {
              id: userId,
              userName: user_name,
              onegold: signin_gold,
              gold: signin_gold,
              allDay: 1,
              time: signin_Time,
              yiyan: yiyan as string,
            },
          ],
          ["id"]
        );
        logger.info(`用户${user_name}.${userId}第一次签到,写入数据库成功....`);
        // await session.send("冒泡成功了哇");
        return await sendMarkdown(
          session.channelId,
          config.appId,
          config.token,
          config.templateId,
          {
            imgurl: config.imgUrl,
            userid: session.userId,
            yiyan: yiyan as string,
            allday: "1",
            onegold: signin_gold.toString(),
            allgold: signin_gold.toString(),
            eryan: config.eryan,
          },
          config.keyboardId
        );
      } else {
        // 找到了
        let data = (await ctx.database.get("signin_oni", { id: userId }))[0];
        let goldCont = data?.gold;
        let timeCont = data?.time;
        let allDay = data?.allDay;
        let onegold = data?.onegold;
        let yiyan = data?.yiyan;

        // 时间不一样,给签
        if (signin_Time.slice(8, 10) != timeCont.slice(8, 10)) {
          let yiyan = await fetch(config.yiyanapi, {
            headers: { "Content-Type": "application/json" },
          })
            .then((res) => {
              return res;
            })
            .catch((err) => {
              logger.error(err);
              return "今天,也要多喝热水哟(";
            });
          await ctx.database.upsert(
            "signin_oni",
            [
              {
                id: userId,
                onegold: signin_gold,
                gold: goldCont + signin_gold,
                allDay: allDay + 1,
                time: signin_Time,
                yiyan: yiyan as string,
              },
            ],
            ["id"]
          );
          logger.info(
            `用户${user_name}.${userId}第${allDay + 1}天签到,写入数据库成功....`
          );
          await session.send("冒泡成功了哇");
          await sendMarkdown(
            session.channelId,
            config.appId,
            config.token,
            config.templateId,
            {
              imgurl: config.imgUrl,
              userid: session.userId,
              yiyan: yiyan as string,
              allday: (allDay + 1).toString(),
              onegold: signin_gold.toString(),
              allgold: (goldCont + signin_gold).toString(),
              eryan: config.eryan,
            },
            config.keyboardId
          );
        } else {
          // 时间一样,不给签
          logger.error(`用户${user_name}.${userId}今天已经签到过了`);
          await session.send("今天已经签到过了yo....\n再给你小子看一眼");
          await sendMarkdown(
            session.channelId,
            config.appId,
            config.token,
            config.templateId,
            {
              imgurl: config.imgUrl,
              userid: session.userId,
              yiyan: yiyan,
              allday: allDay.toString(),
              onegold: onegold.toString(),
              allgold: goldCont.toString(),
              eryan: config.eryan,
            },
            config.keyboardId
          );
        }
      }
    });

  // 金币排行
  ctx
    .command("signin.goldrank 金币排行")
    .alias("金币排行")
    .action(async ({}) => {
      const logger = ctx.logger("signin-oni");
      let data_gold = await ctx.database
        .select("signin_oni")
        .orderBy("gold", "desc")
        .limit(10)
        .execute()
        .then((res) => {
          let rank_list = [];
          for (let i = 0; i < res.length; i++) {
            rank_list.push(
              `第${i + 1}名: @${res[i].userName}(${res[i].gold}金币)`
            );
          }
          return rank_list.join("\n");
        })
        .catch((err) => {
          logger.error(err);
          return "发生错误..." + err;
        });

      return data_gold;
    });

  // 天数排行
  ctx
    .command("signin.dayrank 天数排行")
    .alias("天数排行")
    .action(async ({}) => {
      const logger = ctx.logger("signin-oni");
      let data_day = await ctx.database
        .select("signin_oni")
        .orderBy("allDay", "desc")
        .limit(10)
        .execute()
        .then((res) => {
          let dayList = [];
          for (let i = 0; i < res.length; i++) {
            dayList.push(
              `第${i + 1}名: @${res[i].userName}(${res[i].allDay}天)`
            );
          }
          return dayList.join("\n");
        })
        .catch((err) => {
          logger.error(err);
          return "发生错误..." + err;
        });

      return data_day;
    });
}
