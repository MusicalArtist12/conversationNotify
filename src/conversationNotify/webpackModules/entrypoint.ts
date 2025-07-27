import { greeting } from "@moonlight-mod/wp/conversationNotify_someLibrary";

const logger = moonlight.getLogger("conversationNotify/entrypoint");
logger.info("Hello from entrypoint!");
logger.info("someLibrary exports:", greeting);

const natives = moonlight.getNatives("conversationNotify");
logger.info("node exports:", natives);
