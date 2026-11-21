import "@withworkspace/protocol-kit";

using WS.Protocol;

namespace WS.Plugin;

/**
 * What a plugin has ws do, for the person who's using it: a request,
 * answered, and an addition to version 1.
 */
@sentBy("plugin")
interface Conversations {
  @method("conversation/start")
  conversationStart(params: ConversationStartParams): ConversationStarted;
}

/**
 * ConversationStartParams is what a conversation is started with: what the
 * person says first, as the plugin words it for them. What it names as ws
 * names things (RAM-123) is read as that thing, so the conversation's agent
 * can read it, and the thing says the conversation names it.
 */
model ConversationStartParams {
  message: string;
}

/**
 * ConversationStarted is a conversation ws has started: one of the
 * workspace's (w4), whose agent is answering, and its page in ws's web UI.
 */
model ConversationStarted {
  id: string;
  path: string;
}
