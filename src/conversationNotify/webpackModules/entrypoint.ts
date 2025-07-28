import { greeting } from "@moonlight-mod/wp/conversationNotify_conversation";

const logger = moonlight.getLogger("conversationNotify/entrypoint");
logger.info("Hello from entrypoint!");
logger.info("conversation exports:", greeting);

const natives = moonlight.getNatives("conversationNotify");
logger.info("node exports:", natives);
