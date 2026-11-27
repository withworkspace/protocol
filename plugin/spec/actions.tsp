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

  /**
   * Keys are the keys the plugin suggests for its own action, as ws names a
   * key press ("n", "mod+shift+i"; one then another with a space). They're
   * a suggestion, never bound by ws: the person sees them in Settings ›
   * Keyboard, with what they'd clash with, and takes them or gives the
   * action keys of their own. Two plugins may suggest the same.
   */
  keys?: string[];

  /**
   * Opens is a path in the plugin's app the action goes to, with nothing to
   * run: ws goes there at once, without asking the plugin. Where says where
   * it's opened.
   */
  opens?: string;

  where?: Where | string;

  /**
   * On is the kinds of what's open that the action is for (mission, pr,
   * conversation, document, artifact, file, repo, or a plugin's kind of
   * thing, jira:issue): offered, and done by its keys, only there. None is
   * everywhere.
   */
  on?: string[];
}

/**
 * Where a path in the plugin's app is opened: as the page (WherePage, what
 * there is unless said), or beside the page that's open (WhereBeside).
 */
enum Where {
  WherePage: "page",
  WhereBeside: "beside",
}

/**
 * Here is what was open when an action was asked for: its ref (a mission's
 * slug, a Jira issue's RAM-12), its kind (as Action.On names kinds), what it's called,
 * and the words picked out in it, if any.
 */
model Here {
  ref: string;
  kind: string;
  title?: string;
  selection?: string;
}

/**
 * ActionRunParams runs an action: the plugin's own, by its id, or one of a
 * kind's on one thing, by the kind and the thing's name. Answers are what's
 * been answered so far to what the action asked, in order: an action that
 * asks is run again with one more, from the start. Here is what was open
 * when it was asked for, if anything was.
 */
model ActionRunParams {
  id: string;
  kind?: string;
  ref?: string;
  answers: string[];
  here?: Here;
}

/**
 * ActionRunResult is what came of it. With Ask, nothing's been done yet: the
 * action wants one thing answered, and is run again with the answer.
 * Otherwise it's done: Say is a line to tell whoever asked, and Open a path
 * in the plugin's app to go to, opened as Where says.
 */
model ActionRunResult {
  ask?: Ask;
  say?: string;
  open?: string;
  where?: Where | string;
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
