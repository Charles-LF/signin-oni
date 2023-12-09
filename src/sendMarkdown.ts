export const sendMarkdown = async (
  channelId: string,
  appID: string,
  token: string,
  templateId: string,
  params: { [key: string]: string },
  keyboardId?: string
  // eventId?: null | number | undefined
) => {
  return fetch(`https://api.sgroup.qq.com/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${appID}.${token}`,
    },
    body: JSON.stringify({
      // event_id: eventId,
      markdown: {
        custom_template_id: templateId,
        params: Object.entries(params).map(([key, value]) => {
          return { key, values: [value] };
        }),
      },
      keyboard: { id: keyboardId },
    }),
  }).then(async (res) => {
    const json = await res.json();
    if (json.code) {
      console.error(res.headers.get("x-tps-trace-id"));
      throw json;
    } else return json;
  });
};
