import "@withworkspace/protocol-kit";

using WS.Protocol;

namespace WS.Plugin;

/**
 * Action is something a plugin can do when it's asked from Find: its id, in
 * lower-case letters, digits and hyphens, and what it's called there.
 */
model Action {
  @pattern("^[a-z][a-z0-9-]{0,39}$")
  id: string;

  title: string;

  /** Icon is one of ws's icon names. Hint says more, after the title. */
  icon?: string;

  hint?: string;
}

/**
 * ActionRunParams runs an action: the plugin's own, by its id, or one of a
 * kind's on one thing, by the kind and the thing's name. Answers are what's
 * been answered so far to what the action asked, in order: an action that
 * asks is run again with one more, from the start.
 */
model ActionRunParams {
  id: string;
  kind?: string;
  ref?: string;
  answers: string[];
}

/**
 * ActionRunResult is what came of it. With Ask, nothing's been done yet: the
 * action wants one thing answered, and is run again with the answer.
 * Otherwise it's done: Say is a line to tell whoever asked, and Open a path
 * in the plugin's app to go to.
 */
model ActionRunResult {
  ask?: Ask;
  say?: string;
  open?: string;
}

/** Ask is one thing an action wants answered before it does anything. */
model Ask {
  title: string;

  /** Type is AskPick, one of Options, or AskText, a line typed. */
  type: AskType | string;

  options?: Option[];
  placeholder?: string;
}

/** The types of an ask. */
enum AskType {
  AskPick: "pick",
  AskText: "text",
}

/** Option is one thing to pick: what's answered (Value), and what's shown. */
model Option {
  value: string;
  label: string;
  hint?: string;
}
