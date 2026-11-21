import "@withworkspace/protocol-kit";

using WS.Protocol;

namespace WS.Plugin;

/**
 * Ref is a kind of thing the plugin has that words name (a Jira issue,
 * RAM-123), and how one is named: what ws finds in what's written, links,
 * and asks the plugin about (MethodRefShow). It's data, not code: ws finds
 * names in its own program and in its web UI, from this alone.
 */
model Ref {
  /**
   * Kind is the plugin's word for what it is (issue): lower-case letters,
   * digits and hyphens. ws asks about one by it.
   */
  @pattern("^[a-z][a-z0-9-]{0,39}$")
  kind: string;

  /** Title is what one is called, for a person: Jira issue. */
  title?: string;

  /** Icon is one of ws's icon names. */
  icon?: string;

  /**
   * Prefixes are what a name starts with (RAM-, RAP-): letters, digits and
   * underscores, starting with a letter and ending in a hyphen. A name is
   * one of them and its Tail, as written: ram-12 isn't RAM-12.
   */
  prefixes: RefPrefix[];

  /**
   * Tail is what follows the prefix: one of the Tails, TailNumber when it's
   * not said. A ws that doesn't know a tail reads none of that kind's names.
   */
  tail?: Tail | string;

  /**
   * Address is where one is outside ws, with RefPlaceholder where its name
   * goes: https://acme.atlassian.net/browse/{ref}. ws links a name to it in
   * a document, and reads one pasted as the thing it names.
   */
  address?: string;

  /**
   * Path is where one opens in the plugin's app, with RefPlaceholder where
   * its name goes: /issue/{ref}.
   */
  path?: string;

  /**
   * Fields are what one of its things is made of: what the plugin tells ws
   * of a thing (thing/put, ref/show) is a value for each. One of them, of
   * type FieldTitle, is what a thing's called: a kind with none has names,
   * and nothing ws keeps or draws.
   */
  fields?: Field[];

  /**
   * Search is what a thing is found by, in order: which fields, and how much
   * of each. None: every field, as far as ws keeps of it.
   */
  search?: Searched[];

  /**
   * Views are how one is drawn, by where: ViewCard, under its name, and
   * ViewPane, beside the list in Find. Each is blocks, in order. With none
   * for somewhere, ws draws one from the fields' types. A view for somewhere
   * ws doesn't know is ignored.
   */
  views?: Record<Block[]>;

  /**
   * Actions are what can be done to one of its things: offered in Find for
   * the thing the cursor's on, and run with its name.
   */
  actions?: Action[];

  /**
   * Remote is where one lives beyond this machine, for a kind whose things
   * can: a folder of a repo, for everyone with the repo. An addition to
   * version 1: a ws from before it leaves it out.
   */
  remote?: Remote;
}

/** A prefix of a kind's names: RAM-. */
@pattern("^[A-Za-z][A-Za-z0-9_]{0,30}-$")
scalar RefPrefix extends string;

/**
 * Remote is where a kind's things live beyond this machine: a folder of a
 * repo each (its package), which holds the thing's own file (its main file),
 * a ManifestName that says what it is, and what the plugin makes from the
 * main file (a picture of it). ws finds a package in one of the workspace's
 * spaces by its manifest, names the thing by the folder as it names any
 * folder (records/sketches/release-flow/), calls it what the manifest says,
 * and asks the plugin what its main file is found by (MethodRemoteRead). The
 * plugin mints no name for one, and needn't keep one: ws has them, and says
 * which (MethodRemoteList, MethodRemoteOpen).
 */
model Remote {
  /**
   * Path is the folder a new one goes in, in its repo, with RemoteSlug where
   * the thing's slug goes: sketches/{slug}/. One that's there is found
   * wherever its folder is.
   */
  path: string;

  /**
   * Main is the main file's name in that folder, with RemoteSlug where the
   * thing's slug goes: {slug}.excalidraw.
   */
  main: string;

  /**
   * Reads is whether the plugin says what a main file is found by
   * (MethodRemoteRead). Without it, one is found by its title alone.
   */
  reads?: boolean;

  /**
   * Exports is whether the plugin gives one of its own things as a folder is
   * to hold it (MethodRemoteExport): what ws promotes one, and saves one,
   * from. Without it, ws puts none of the kind's things in a repo: they're
   * there by a commit alone.
   */
  exports?: boolean;
}

/**
 * ManifestName is the file in a package that says what it is, in TOML: its
 * kind (as the plugin registered it), its title, its main file's name and
 * its picture's, if it has one. It's ws's own file: ws reads it, and writes
 * it.
 *
 * ```toml
 * kind    = "sketch"
 * title   = "Release flow"
 * main    = "release-flow.excalidraw"
 * picture = "release-flow.svg"
 * ```
 */
const ManifestName = "thing.toml";

/** RemoteSlug is where a thing's slug goes in a Remote's Path and Main. */
const RemoteSlug = "{slug}";

/**
 * Field is one of the things a kind's things are made of: its name, in
 * lower-case letters, digits and underscores, what it is, and what it's
 * called where it's drawn with a label.
 */
model Field {
  @pattern("^[a-z][a-z0-9_]{0,39}$")
  name: string;

  type: FieldType | string;
  label?: string;

  /**
   * Link is how a FieldRef or a FieldRefs points at what it names, in ws's
   * graph: one of the Links. None, or one ws doesn't know, is LinkMentions.
   */
  link?: Link | string;
}

/**
 * How a field that names other things points at them: ws's graph has a
 * short, closed list, so that whatever reads a link can say why it's worth
 * following.
 */
enum Link {
  /** it names it */
  LinkMentions: "mentions",

  /** it's part of it: a child, of its parent */
  LinkIn: "in",

  /** it's about it */
  LinkAbout: "about",

  /** it came out of it */
  LinkFrom: "from",

  /** it's one of its: a comment, a review */
  LinkOf: "of",
}

/**
 * FieldKey is the field every thing has without its kind saying so: its name
 * (RAM-123). A view's block and what's searched may name it.
 */
const FieldKey = "key";

/** The types of a field. One a ws doesn't know is drawn as text. */
enum FieldType {
  /** what the thing's called: a line. A kind has one. */
  FieldTitle: "title",

  /** where it stands, in the plugin's words: at most one */
  FieldState: "state",

  /** words: a name, a number, a few of them */
  FieldText: "text",

  /** a moment, RFC 3339 */
  FieldTime: "time",

  /** what it says, at length */
  FieldMarkdown: "markdown",

  /**
   * A field that names other things: one name, or several, separated by
   * spaces, commas or lines. Each that's a name ws reads (another of the
   * plugin's things, any plugin's, a pull request) is a link in ws's graph,
   * from this thing to it (Field.Link), and is drawn as what it names.
   */
  FieldRef: "ref",

  FieldRefs: "refs",
}

/**
 * Searched is a field a thing is found by, and how much of it: Max bytes, or
 * all ws keeps of it (0).
 */
model Searched {
  field: string;
  max?: int32;
}

/** Where a kind's things are drawn from a view of the plugin's. */
enum ViewPlace {
  /** under a thing's name, on hover */
  ViewCard: "card",

  /** beside the list in Find, for the row the cursor's on */
  ViewPane: "pane",
}

/**
 * Block is one piece of a view: what it is, and the field it shows. A block
 * whose field a thing has nothing for isn't drawn, and neither is one of a
 * kind a ws doesn't know.
 */
model Block {
  block: BlockKind | string;
  field: string;

  /**
   * Label is what a BlockField says before its value, where that isn't the
   * field's own.
   */
  label?: string;

  /** Lines is how many lines of a BlockMarkdown are drawn: 0 for all. */
  lines?: int32;
}

/** The kinds of block. */
enum BlockKind {
  /** the line it's known by */
  BlockTitle: "title",

  /** a quiet line under it */
  BlockSubtitle: "subtitle",

  /** a word or two, set apart: where it stands */
  BlockBadge: "badge",

  /** a label and a value */
  BlockField: "field",

  /** markdown, drawn as ws draws it */
  BlockMarkdown: "markdown",
}

/** RefPlaceholder is where a thing's name goes in a Ref's Address and Path. */
const RefPlaceholder = "{ref}";

/** The tails of a name: what follows its prefix. */
enum Tail {
  /**
   * TailNumber is a whole number that doesn't start with 0, of up to nine
   * digits: RAM-123.
   */
  TailNumber: "number",
}

/**
 * RefShowParams asks about one thing: its Ref's kind, and its name as it was
 * written. Full: everything was asked for (ws show --full), so nothing is to
 * be left out of the markdown.
 */
model RefShowParams {
  kind: string;
  ref: string;
  full?: boolean;
}

/**
 * RefShowResult is a thing as the plugin has it now: a value for each of
 * its kind's fields, as a Thing has them. ws shows it as it shows one it's
 * been told of: by the kind's views in the web UI, and by its fields' types
 * in ws show, where what's markdown is said to be from outside the
 * workspace. One the plugin has nothing by that name for is answered
 * CodeNotFound.
 */
model RefShowResult {
  changed?: utcDateTime;
  fields: Record<string>;
}
