import "@withworkspace/protocol-kit";

using WS.Protocol;

namespace WS.Plugin;

/** Registration is everything a plugin adds to ws. Every field is optional. */
model Registration {
  description?: string;
  views?: View[];
  ui?: UI;
  commands?: Commands;
  agent?: Agent;
  syncs?: Sync[];
  refs?: Ref[];

  /**
   * Actions are things the plugin can do, offered among what there is to do
   * in Find. What can be done to one of its things is the thing's kind's
   * (Ref.Actions).
   */
  actions?: Action[];

  /**
   * Proposes are what a conversation's agent may propose of the plugin's,
   * for the user to accept: issues to create, say. The plugin says how one's
   * written, checks what's written, and does it once it's accepted; ws keeps
   * it, draws it and asks the user.
   */
  proposes?: Proposes[];

  /**
   * Notifies are the kinds of notification the plugin sends the person
   * (notification/add), each theirs to route in Settings › Notifications.
   */
  notifies?: Notifies[];

  config_version?: int32;
  config?: ConfigKey[];
}

/** View is an entry in ws's sidebar, and where in the plugin's app it opens. */
model View {
  title: string;
  icon?: string;
  under?: string;
  path: string;
}

/**
 * UI is the plugin's app: what ws's page for the plugin loads. A plugin has
 * one, whatever views it has, and serves no HTML of its own. Each is a path
 * in the plugin's own HTTP, with whatever query it has ("/ui/app.js?v=3f9c2a").
 */
model UI {
  /** Script is the app's entry, loaded as a module. A plugin with views has one. */
  script?: string;

  /** Style is its stylesheet, if it has one, loaded before the app. */
  style?: string;
}

/** Commands is a plugin's command: the word after ws, and what follows it. */
model Commands {
  name?: string;
  short?: string;
  subcommands?: Subcommand[];
}

/** Subcommand is one thing the command does. */
model Subcommand {
  name: string;
  short?: string;
  args?: string;

  /**
   * Conversations is a command a conversation's agent may run itself, not
   * only propose: what it changes is changed as the agent runs it. An
   * addition to version 1: a ws from before it runs none of a plugin's
   * commands in a conversation.
   */
  conversations?: boolean;

  /**
   * Label is what the command is doing, as a conversation shows an agent's
   * step that ran it: "Pulling up {1}". {1} is its first argument, {2} its
   * second, and so on. An addition to version 1: a ws from before it shows
   * the command as it was typed.
   */
  label?: string;

  /**
   * Options are the flags it takes that have a value (--name value), without
   * their dashes: how ws tells an option's value from an argument, reading a
   * command an agent ran. -f and --format are every command's, and not
   * listed. An addition to version 1.
   */
  options?: string[];
}

/** Agent is what agents are told of the plugin. No roles means every role. */
model Agent {
  roles?: string[];
  guide?: string;
}

/**
 * Sync is a sync the plugin runs, for show. Every is in seconds: 0 is a sync
 * with no interval of its own. Open, in seconds too, is its interval while
 * the plugin's app is on screen, where that's another.
 */
model Sync {
  name: string;
  every: int32;
  open?: int32;
}
