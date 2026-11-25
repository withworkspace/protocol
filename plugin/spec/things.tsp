import "@withworkspace/protocol-kit";

using WS.Protocol;

namespace WS.Plugin;

/**
 * What a plugin tells ws of its things, so ws has them without asking:
 * requests, each answered, and each an addition to version 1. ws keeps what
 * it's told under the plugin, and forgets it when the plugin's removed.
 */
@sentBy("plugin")
interface Things {
  @method("thing/put")
  thingPut(params: ThingPutParams): ThingPutResult;

  @method("thing/remove")
  thingRemove(params: ThingRemoveParams): void;

  @method("thing/list")
  thingList(params: ThingListParams): ThingListResult;
}

/**
 * ThingsAtOnce is how many things one thing/put may hold: more is refused
 * whole (CodeInvalidParams), so a plugin with more sends them in turn.
 */
const ThingsAtOnce = 500;

/**
 * Thing is one of the plugin's things, as ws keeps it: found by what its kind
 * says it's found by (ws find, the web UI's Find) and drawn from its kind's
 * views, without asking the plugin.
 */
model Thing {
  /**
   * Kind is the Ref it's named by, and Ref its name: one of that kind's, as
   * the plugin registered them. ws keeps no thing it couldn't name.
   */
  kind: string;

  ref: string;

  /**
   * Changed is when it last changed, where the plugin knows: of two found
   * alike, the newer is first.
   */
  changed?: utcDateTime;

  /**
   * Standing is where it stands, in words every kind shares, for what's
   * found of it to be weighed by: a Jira issue in progress is open, one
   * done is settled, one closed as won't do is gone. Its kind's state
   * field says the same in the plugin's own words, for people. None, or
   * one ws doesn't know, is StandingOpen.
   */
  standing?: Standing | string;

  /**
   * Since is when it came to stand as it does, for one that's settled or
   * gone (a Jira issue's resolution date): what's found of it ages from
   * then. None is from when it last changed.
   */
  since?: utcDateTime;

  /**
   * Fields are its values, by its kind's fields' names, each a string (a time
   * as RFC 3339). One its kind hasn't is dropped, and ws keeps the start of a
   * long one. A thing with nothing for its kind's title isn't kept.
   */
  fields: Record<string>;
}

/**
 * Standing is where a thing stands, in words every kind shares, ws's own
 * among them (a mission, a decision, a conversation): what's found of a
 * thing that's settled, or no longer so, is found below what's still so,
 * the more so the longer since, and is said to be.
 */
enum Standing {
  /** kept true by being kept: what it says now is what it says. It doesn't age. */
  StandingLasting: "lasting",

  /** in force, or still to do: an open issue. It doesn't age while it's open. */
  StandingOpen: "open",

  /** of its moment: true when it was said, and aging from when it last changed */
  StandingPassing: "passing",

  /** done: an issue resolved. It ages from Since. */
  StandingSettled: "settled",

  /** no longer so: an issue closed as won't do, or as another's duplicate. It ages from Since, found lower still. */
  StandingGone: "gone",
}

/**
 * ThingPutParams are things to keep: each added, or put in place of what ws
 * had by that name.
 */
model ThingPutParams {
  things: Thing[];
}

/** ThingPutResult says which weren't kept, and why. The rest were. */
model ThingPutResult {
  refused?: ThingRefused[];
}

/**
 * ThingRefused is a thing ws didn't keep: its name isn't one of that kind's,
 * it has nothing for its kind's title, or ws has something of its own by
 * that name.
 */
model ThingRefused {
  kind: string;
  ref: string;
  why: string;
}

/**
 * ThingRemoveParams are things of a kind to forget, by name. One ws doesn't
 * have is nothing to forget.
 */
model ThingRemoveParams {
  kind: string;
  refs: string[];
}

/** ThingListParams asks which things of a kind ws has from this plugin. */
model ThingListParams {
  kind: string;
}

/** ThingListResult is their names, in order. */
model ThingListResult {
  refs: string[];
}
