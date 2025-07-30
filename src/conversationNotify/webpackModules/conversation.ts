
// https://github.com/moonlight-mod/mappings/blob/0a135691c22d1b03d4badcb8a97dd65fa1716729/src/mappings/discord/Constants.ts#L1331
import { ChannelTypes, MessageTypes } from "@moonlight-mod/wp/discord/Constants";
import { NotificationCallFunc, InhibitorFn, InhibitorReturn, Wrapper, addInhibitor, NotificationParams } from "@moonlight-mod/wp/notificationLib_lib";

// saves when the last notification was sent
let active_convs: Map<string, number> = new Map();

// holds the backlog of messages
let notificationBatch: Map<string, any[]> = new Map();

// keeps track of if a promise is runnning for a given channel
let channelBatched: Map<string, boolean> = new Map();

let groupNotifications = moonlight.getConfigOption<boolean>("conversationNotify", "groupMessages") ?? false;



function sendMessage(message_data: any, configurableDelay: number) {
    let ignoredChannels = moonlight.getConfigOption<any>("conversationNotify", "ignoredChannels") ?? [];

    let delayedChannelTypes = [ChannelTypes.GUILD_TEXT, ChannelTypes.GROUP_DM, ChannelTypes.PUBLIC_THREAD]

    /*
      filter:
      channel type group dm,
        - default, reply, chat_input_command
      channel type guild text,
        - default, reply, chat_input_command
      channel type public thread,
      do not filter if badge is true

    */
    // no? - means it adds a couunter to the badge...
    // if (message_data.badge) {
    //   return true
    // }
    // still need to make sure that if mentioned that you get it
    if (delayedChannelTypes.includes(message_data.channel_type) && !ignoredChannels.includes(message_data.channel_id)) {

        if (active_convs.has(message_data.channel_id) && (active_convs.get(message_data.channel_id) ?? 0) + configurableDelay * 1000 > Date.now()) {
            return false;
        }

        active_convs.set(message_data.channel_id, Date.now());
        return true;
    }

    return true;
}

// calls resolve
function sendBatchMessage<T>(
    expr: NotificationCallFunc<T>,
    list: any[],
    icon: string | undefined,
    sound_data: any,
    resolve: (value: T | null) => void
) {

    if (list.length > 0) {
        let channel = list[0].title.match(/\(.+\)/)[0];
        // syntax of title '<username> (channel)'
        let usernames = new Set(list.map((x) => x.title.replace(/\(.+\)/, "").trim()));


        let t = usernames.size + (usernames.size > 1 ? ' people' : ' person') + " talking in " + channel;

        let b = "";
        list.forEach((msg) => {
            let username = msg.title.replace(/\(.+\)/, "").trim();
            let content = username + ': ' + msg.body;
            if (b == "") {
                b = content;
            }
            else {
                b = b + "\n" + content;
            }
        });

        // return the reference to the first message
        let md = list[0].message_data;

        // console.log('finalizing')

        // possibly change icon
        resolve(expr(icon, t, b, md, sound_data));
    }
    else {
        resolve(null);
    }
}

function createTimeoutPromise<T>(expr: NotificationCallFunc<T>, params: NotificationParams) {
    let { icon, title, body, message_data, sound_data } = params
    let configurableDelay = moonlight.getConfigOption<number>("conversationNotify", "configurableDelay") ?? 0;

    return new Promise<T | null>((resolve) => {

        // console.log('starting timeout')
        setTimeout(() => {
            let list = notificationBatch.get(message_data.channel_id) ?? [];

            sendBatchMessage(expr, list, icon, sound_data, resolve)
            notificationBatch.set(message_data.channel_id, []);
            channelBatched.set(message_data.channel_id, false);

            // reset notification timer
            active_convs.set(message_data.channel_id, Date.now());

        }, 1000 * configurableDelay);
    });
}



function entrypoint() {
    addInhibitor((params: NotificationParams) => {
        let configurableDelay = moonlight.getConfigOption<number>("conversationNotify", "configurableDelay") ?? 0;

        if (configurableDelay == 0 || sendMessage(params.message_data, configurableDelay)) {
            return new InhibitorReturn(false);
        }

        if (groupNotifications) {
            let { icon, title, body, message_data, sound_data } = params

            // add message to buffer
            let list = notificationBatch.get(message_data.channel_id) ?? [];
            list.push({ title: title, body: body, message_data: message_data });
            notificationBatch.set(message_data.channel_id, list);

            // create timeout if it doesn't exist
            if (!(channelBatched.get(message_data.channel_id) ?? false)) {
                channelBatched.set(message_data.channel_id, true);
                return new InhibitorReturn(true, createTimeoutPromise);
            }
        }
        return new InhibitorReturn(true);
    }, 99999)
}

entrypoint();