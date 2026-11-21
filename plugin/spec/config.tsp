import "@withworkspace/protocol-kit";

using WS.Protocol;

namespace WS.Plugin;

/** The types of a config key. */
enum ConfigType {
  TypeString: "string",
  TypeURL: "url",
  TypeBool: "bool",
  TypeNumber: "number",
  TypeEnum: "enum",
  TypeList: "list",
  TypeSecret: "secret",

  /**
   * TypeTable is named rows, each holding the key's Fields. Its value is its
   * rows, in the order they were written ([]ConfigRow). A ws from before
   * tables gives it as the file has it, an object of objects by row name,
   * which has no order.
   */
  TypeTable: "table",

  /** TypeMap is text to text: an object of strings. */
  TypeMap: "map",
}

/** Where a config key's value is kept. */
enum ConfigScope {
  ScopeShared: "shared",
  ScopeLocal: "local",
}

/** ConfigKey is one key of a plugin's config. */
model ConfigKey {
  key: string;
  title?: string;
  type: ConfigType | string;
  required?: boolean;

  /** Default is the key's value where none is set, of its type. */
  default?: string | float64 | boolean | string[] | Record<unknown>;

  help?: string;
  example?: string;
  options?: string[];
  scope?: ConfigScope | string;

  /**
   * Fields are what each row of a table holds: keys of any type but a
   * secret. One may be a table itself, whose own fields may not be. Row is
   * what a row's name is called, in words ("Query", "Space key"), for
   * whoever's asked for one.
   */
  fields?: ConfigKey[];

  row?: string;
}

/**
 * ConfigRow is one row of a table as ws sends it: its name, and its fields'
 * values. A field that's a table is rows in turn.
 */
model ConfigRow {
  name: string;
  values: Record<unknown>;
}

/** ConfigChangedParams is the whole config, after a change. */
model ConfigChangedParams {
  config: Record<unknown>;
}

/**
 * ViewLookingParams is who's looking at what the plugin shows in ws's web
 * UI. ws says it when it changes, and asks nothing by it: what a plugin
 * fetches, and when, is the plugin's to decide.
 */
model ViewLookingParams {
  /** App: the plugin's app is on screen, in a page of ws's that's showing. */
  app: boolean;

  /**
   * WS: a page of ws's web UI is showing, whichever it is, so the plugin's
   * sidebar entries and their badges are on screen. True whenever App is.
   */
  ws: boolean;
}
