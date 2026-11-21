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
   * Fields are its values, by its kind's fields' names, each a string (a time
   * as RFC 3339). One its kind hasn't is dropped, and ws keeps the start of a
   * long one. A thing with nothing for its kind's title isn't kept.
   */
  fields: Record<string>;
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
