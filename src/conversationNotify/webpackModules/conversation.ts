// upstream: https://git.slonk.ing/slonk/moonlight-extensions/src/branch/main/src/notificationContent/webpackModules/notificationOverride.ts

// https://github.com/moonlight-mod/mappings/blob/0a135691c22d1b03d4badcb8a97dd65fa1716729/src/mappings/discord/Constants.ts#L1331
import { ChannelTypes, MessageTypes } from "@moonlight-mod/wp/discord/Constants";


let active_convs: Map<string, number> = new Map()

function sendMessage(message_data: any) {
  let configurableDelay = moonlight.getConfigOption<number>("conversationNotify", "configurableDelay") ?? 0

  let ignoredChannels = moonlight.getConfigOption<any>("conversationNotify", "ignoredChannels") ?? []

  /*
    filter:
    channel type group dm,
      - default, reply, chat_input_command
    channel type guild text,
      - default, reply, chat_input_command
    channel type public thread,
    do not filter if badge is true

  */

  if (message_data.badge) {
    return true
  }
  if ([
    ChannelTypes.GUILD_TEXT,
    ChannelTypes.GROUP_DM,
    ChannelTypes.PUBLIC_THREAD
  ].includes(message_data.channel_type) && ! ignoredChannels.includes(message_data.channel_id)) {

    if (active_convs.has(message_data.channel_id) && (active_convs.get(message_data.channel_id) ?? 0) + configurableDelay * 1000 > Date.now()) {
      return false
    }
    else {
      active_convs.set(message_data.channel_id, Date.now())
      return true
    }
  }

  return true
}

export function wrapExpr<T>(
  expr: (icon: string | undefined, title: string, body: string, message_data: any, sound_data: any) => T
) {
  return (icon: string, title: string, body: string, message_data: any, sound_data: any) => {
    console.log(body)
    console.log(message_data)

    if (sendMessage(message_data)) {
      return expr(icon, title, body, message_data, sound_data)
    }

    else {
        return new Promise((resolve) => {resolve(null)})
    }
  }
}
