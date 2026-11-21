// Code generated from the plugin protocol's spec by github.com/withworkspace/protocol. DO NOT EDIT.

/** Bytes, as JSON has them: base64. */
export type Bytes = string;

/** A moment, as JSON has it: RFC 3339. */
export type Time = string;

/** Version is the newest version of the protocol this package speaks. */
export const Version = 1;

// JSON-RPC's error codes, and the one for a request given up on.
export const CodeMethodNotFound = -32601;
export const CodeInvalidParams = -32602;
export const CodeInternal = -32603;
export const CodeCancelled = -32800;
/**
 * CodeNotFound is the answer for something asked for by name that isn't there:
 * ws's for a mission with no such slug, a plugin's for a ref it has nothing by.
 */
export const CodeNotFound = -32001;
export type ErrorCode = typeof CodeMethodNotFound | typeof CodeInvalidParams | typeof CodeInternal | typeof CodeCancelled | typeof CodeNotFound;

// Giving up on a request.
/** MethodCancelRequest is how either side gives up on a request it made. */
export const MethodCancelRequest = "$/cancel_request";

// What ws sends a plugin.
/** Always first. */
export const MethodInitialize = "initialize";
export const MethodConfigChanged = "config/changed";
export const MethodCommandRun = "command/run";
/**
 * Finish and exit. The answer is null. ws closes stdin after it, and kills a
 * plugin still running five seconds later.
 */
export const MethodShutdown = "shutdown";
/**
 * MethodRefShow asks what one of the plugin's things is, by its name. An
 * addition to version 1: a plugin from before it answers CodeMethodNotFound,
 * and registers no refs.
 */
export const MethodRefShow = "ref/show";
/**
 * MethodActionRun runs one of the plugin's actions, its own or on one of its
 * things. An addition to version 1: a plugin that registers actions answers it.
 */
export const MethodActionRun = "action/run";
/**
 * MethodViewLooking is an addition to version 1: a ws from before it never says
 * who's looking, and a plugin from before it drops it.
 */
export const MethodViewLooking = "view/looking";
/**
 * MethodProposalDraft is a conversation's agent proposing one of the plugin's
 * Proposes. With no input, it's asking how one's written. An addition to
 * version 1: a plugin that registers Proposes answers it.
 */
export const MethodProposalDraft = "proposal/draft";
/**
 * MethodProposalAccept is the user accepting what was drafted, all of it or
 * some of its items.
 */
export const MethodProposalAccept = "proposal/accept";

// What a plugin sends ws: notifications all.
export const MethodCommandOutput = "command/output";
export const MethodLog = "log";
/**
 * What the app shows is stale. ws tells the open app, which asks the plugin
 * again.
 */
export const MethodViewChanged = "view/changed";
export const MethodViewBadge = "view/badge";
export const MethodSyncState = "sync/state";

/** InitializeParams is what ws tells a plugin as it starts. */
export interface InitializeParams {
  /** Protocol is the newest version ws speaks. */
  protocol: number;
  /**
   * Protocols are every version ws speaks. A ws from before versions were
   * chosen doesn't send it, and speaks only Protocol.
   */
  protocols?: number[];
  ws: WSInfo;
  plugin: PluginInfo;
  workspace: Workspace;
  /**
   * Config is what's set, secrets included, by key. A key that isn't set is
   * absent.
   */
  config: Record<string, unknown>;
  view: ViewInfo;
}

/** WSInfo is the ws on the other end. */
export interface WSInfo {
  version: string;
  /**
   * Executable is ws's own program, for a plugin that runs ws's commands. A ws
   * from before it said doesn't.
   */
  executable?: string;
}

/**
 * PluginInfo is the plugin as ws knows it: its plugin.toml, and its folders.
 */
export interface PluginInfo {
  name: string;
  version: string;
  dir: string;
  data: string;
}

/** Workspace is the workspace the plugin is installed in. */
export interface Workspace {
  root: string;
}

/**
 * ViewInfo is where a plugin serves its own HTTP (its app's files and what its
 * app asks it): a unix socket to listen on, and the path ws serves it under.
 */
export interface ViewInfo {
  listen: string;
  base: string;
}

/**
 * InitializeResult is a plugin's answer: the version it chose, the versions it
 * speaks, and what it adds.
 */
export interface InitializeResult {
  /**
   * Protocol is the version chosen (Choose), which everything after initialize
   * is in. 0: ws and the plugin have none in common, and the plugin registers
   * nothing.
   */
  protocol: number;
  /**
   * Protocols are every version the plugin speaks, so that ws can say which
   * side is behind when there's none in common.
   */
  protocols?: number[];
  registration: Registration;
}

/** Registration is everything a plugin adds to ws. Every field is optional. */
export interface Registration {
  description?: string;
  views?: View[];
  ui?: UI;
  commands?: Commands;
  agent?: Agent;
  syncs?: Sync[];
  refs?: Ref[];
  /**
   * Actions are things the plugin can do, offered among what there is to do in
   * Find. What can be done to one of its things is the thing's kind's
   * (Ref.Actions).
   */
  actions?: Action[];
  /**
   * Proposes are what a conversation's agent may propose of the plugin's, for
   * the user to accept: issues to create, say. The plugin says how one's
   * written, checks what's written, and does it once it's accepted; ws keeps
   * it, draws it and asks the user.
   */
  proposes?: Proposes[];
  config_version?: number;
  config?: ConfigKey[];
}

/** View is an entry in ws's sidebar, and where in the plugin's app it opens. */
export interface View {
  title: string;
  icon?: string;
  under?: string;
  path: string;
}

/**
 * UI is the plugin's app: what ws's page for the plugin loads. A plugin has
 * one, whatever views it has, and serves no HTML of its own. Each is a path in
 * the plugin's own HTTP, with whatever query it has ("/ui/app.js?v=3f9c2a").
 */
export interface UI {
  /**
   * Script is the app's entry, loaded as a module. A plugin with views has one.
   */
  script?: string;
  /** Style is its stylesheet, if it has one, loaded before the app. */
  style?: string;
}

/** Commands is a plugin's command: the word after ws, and what follows it. */
export interface Commands {
  name?: string;
  short?: string;
  subcommands?: Subcommand[];
}

/** Subcommand is one thing the command does. */
export interface Subcommand {
  name: string;
  short?: string;
  args?: string;
  /**
   * Conversations is a command a conversation's agent may run itself, not only
   * propose: what it changes is changed as the agent runs it. An addition to
   * version 1: a ws from before it runs none of a plugin's commands in a
   * conversation.
   */
  conversations?: boolean;
  /**
   * Label is what the command is doing, as a conversation shows an agent's step
   * that ran it: "Pulling up {1}". {1} is its first argument, {2} its second,
   * and so on. An addition to version 1: a ws from before it shows the command
   * as it was typed.
   */
  label?: string;
  /**
   * Options are the flags it takes that have a value (--name value), without
   * their dashes: how ws tells an option's value from an argument, reading a
   * command an agent ran. -f and --format are every command's, and not listed.
   * An addition to version 1.
   */
  options?: string[];
}

/** Agent is what agents are told of the plugin. No roles means every role. */
export interface Agent {
  roles?: string[];
  guide?: string;
}

/**
 * Sync is a sync the plugin runs, for show. Every is in seconds: 0 is a sync
 * with no interval of its own. Open, in seconds too, is its interval while the
 * plugin's app is on screen, where that's another.
 */
export interface Sync {
  name: string;
  every: number;
  open?: number;
}

/**
 * Ref is a kind of thing the plugin has that words name (a Jira issue,
 * RAM-123), and how one is named: what ws finds in what's written, links, and
 * asks the plugin about (MethodRefShow). It's data, not code: ws finds names in
 * its own program and in its web UI, from this alone.
 */
export interface Ref {
  /**
   * Kind is the plugin's word for what it is (issue): lower-case letters,
   * digits and hyphens. ws asks about one by it.
   */
  kind: string;
  /** Title is what one is called, for a person: Jira issue. */
  title?: string;
  /** Icon is one of ws's icon names. */
  icon?: string;
  /**
   * Prefixes are what a name starts with (RAM-, RAP-): letters, digits and
   * underscores, starting with a letter and ending in a hyphen. A name is one
   * of them and its Tail, as written: ram-12 isn't RAM-12.
   */
  prefixes: string[];
  /**
   * Tail is what follows the prefix: one of the Tails, TailNumber when it's not
   * said. A ws that doesn't know a tail reads none of that kind's names.
   */
  tail?: Tail | (string & {});
  /**
   * Address is where one is outside ws, with RefPlaceholder where its name
   * goes: https://acme.atlassian.net/browse/{ref}. ws links a name to it in a
   * document, and reads one pasted as the thing it names.
   */
  address?: string;
  /**
   * Path is where one opens in the plugin's app, with RefPlaceholder where its
   * name goes: /issue/{ref}.
   */
  path?: string;
  /**
   * Fields are what one of its things is made of: what the plugin tells ws of a
   * thing (thing/put, ref/show) is a value for each. One of them, of type
   * FieldTitle, is what a thing's called: a kind with none has names, and
   * nothing ws keeps or draws.
   */
  fields?: Field[];
  /**
   * Search is what a thing is found by, in order: which fields, and how much of
   * each. None: every field, as far as ws keeps of it.
   */
  search?: Searched[];
  /**
   * Views are how one is drawn, by where: ViewCard, under its name, and
   * ViewPane, beside the list in Find. Each is blocks, in order. With none for
   * somewhere, ws draws one from the fields' types. A view for somewhere ws
   * doesn't know is ignored.
   */
  views?: Record<string, Block[]>;
  /**
   * Actions are what can be done to one of its things: offered in Find for the
   * thing the cursor's on, and run with its name.
   */
  actions?: Action[];
  /**
   * Remote is where one lives beyond this machine, for a kind whose things can:
   * a folder of a repo, for everyone with the repo. An addition to version 1: a
   * ws from before it leaves it out.
   */
  remote?: Remote;
}

/**
 * Remote is where a kind's things live beyond this machine: a folder of a repo
 * each (its package), which holds the thing's own file (its main file), a
 * ManifestName that says what it is, and what the plugin makes from the main
 * file (a picture of it). ws finds a package in one of the workspace's spaces
 * by its manifest, names the thing by the folder as it names any folder
 * (records/sketches/release-flow/), calls it what the manifest says, and asks
 * the plugin what its main file is found by (MethodRemoteRead). The plugin
 * mints no name for one, and needn't keep one: ws has them, and says which
 * (MethodRemoteList, MethodRemoteOpen).
 */
export interface Remote {
  /**
   * Path is the folder a new one goes in, in its repo, with RemoteSlug where
   * the thing's slug goes: sketches/{slug}/. One that's there is found wherever
   * its folder is.
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
   * Exports is whether the plugin gives one of its own things as a folder is to
   * hold it (MethodRemoteExport): what ws promotes one, and saves one, from.
   * Without it, ws puts none of the kind's things in a repo: they're there by a
   * commit alone.
   */
  exports?: boolean;
}

/**
 * ManifestName is the file in a package that says what it is, in TOML: its kind
 * (as the plugin registered it), its title, its main file's name and its
 * picture's, if it has one. It's ws's own file: ws reads it, and writes it.
 *
 * ```
 * kind    = "sketch"
 * title   = "Release flow"
 * main    = "release-flow.excalidraw"
 * picture = "release-flow.svg"
 * ```
 */
export const ManifestName = "thing.toml";

/** RemoteSlug is where a thing's slug goes in a Remote's Path and Main. */
export const RemoteSlug = "{slug}";

/**
 * Field is one of the things a kind's things are made of: its name, in
 * lower-case letters, digits and underscores, what it is, and what it's called
 * where it's drawn with a label.
 */
export interface Field {
  name: string;
  type: FieldType | (string & {});
  label?: string;
  /**
   * Link is how a FieldRef or a FieldRefs points at what it names, in ws's
   * graph: one of the Links. None, or one ws doesn't know, is LinkMentions.
   */
  link?: Link | (string & {});
}

// How a field that names other things points at them: ws's graph has a
// short, closed list, so that whatever reads a link can say why it's worth
// following.
/** it names it */
export const LinkMentions = "mentions";
/** it's part of it: a child, of its parent */
export const LinkIn = "in";
/** it's about it */
export const LinkAbout = "about";
/** it came out of it */
export const LinkFrom = "from";
/** it's one of its: a comment, a review */
export const LinkOf = "of";
export type Link = typeof LinkMentions | typeof LinkIn | typeof LinkAbout | typeof LinkFrom | typeof LinkOf;

/**
 * FieldKey is the field every thing has without its kind saying so: its name
 * (RAM-123). A view's block and what's searched may name it.
 */
export const FieldKey = "key";

// The types of a field. One a ws doesn't know is drawn as text.
/** what the thing's called: a line. A kind has one. */
export const FieldTitle = "title";
/** where it stands, in the plugin's words: at most one */
export const FieldState = "state";
/** words: a name, a number, a few of them */
export const FieldText = "text";
/** a moment, RFC 3339 */
export const FieldTime = "time";
/** what it says, at length */
export const FieldMarkdown = "markdown";
/**
 * A field that names other things: one name, or several, separated by spaces,
 * commas or lines. Each that's a name ws reads (another of the plugin's things,
 * any plugin's, a pull request) is a link in ws's graph, from this thing to it
 * (Field.Link), and is drawn as what it names.
 */
export const FieldRef = "ref";
export const FieldRefs = "refs";
export type FieldType = typeof FieldTitle | typeof FieldState | typeof FieldText | typeof FieldTime | typeof FieldMarkdown | typeof FieldRef | typeof FieldRefs;

/**
 * Searched is a field a thing is found by, and how much of it: Max bytes, or
 * all ws keeps of it (0).
 */
export interface Searched {
  field: string;
  max?: number;
}

// Where a kind's things are drawn from a view of the plugin's.
/** under a thing's name, on hover */
export const ViewCard = "card";
/** beside the list in Find, for the row the cursor's on */
export const ViewPane = "pane";
export type ViewPlace = typeof ViewCard | typeof ViewPane;

/**
 * Block is one piece of a view: what it is, and the field it shows. A block
 * whose field a thing has nothing for isn't drawn, and neither is one of a kind
 * a ws doesn't know.
 */
export interface Block {
  block: BlockKind | (string & {});
  field: string;
  /**
   * Label is what a BlockField says before its value, where that isn't the
   * field's own.
   */
  label?: string;
  /** Lines is how many lines of a BlockMarkdown are drawn: 0 for all. */
  lines?: number;
}

// The kinds of block.
/** the line it's known by */
export const BlockTitle = "title";
/** a quiet line under it */
export const BlockSubtitle = "subtitle";
/** a word or two, set apart: where it stands */
export const BlockBadge = "badge";
/** a label and a value */
export const BlockField = "field";
/** markdown, drawn as ws draws it */
export const BlockMarkdown = "markdown";
export type BlockKind = typeof BlockTitle | typeof BlockSubtitle | typeof BlockBadge | typeof BlockField | typeof BlockMarkdown;

/** RefPlaceholder is where a thing's name goes in a Ref's Address and Path. */
export const RefPlaceholder = "{ref}";

// The tails of a name: what follows its prefix.
/**
 * TailNumber is a whole number that doesn't start with 0, of up to nine digits:
 * RAM-123.
 */
export const TailNumber = "number";
export type Tail = typeof TailNumber;

/**
 * RefShowParams asks about one thing: its Ref's kind, and its name as it was
 * written. Full: everything was asked for (ws show --full), so nothing is to be
 * left out of the markdown.
 */
export interface RefShowParams {
  kind: string;
  ref: string;
  full?: boolean;
}

/**
 * RefShowResult is a thing as the plugin has it now: a value for each of its
 * kind's fields, as a Thing has them. ws shows it as it shows one it's been
 * told of: by the kind's views in the web UI, and by its fields' types in ws
 * show, where what's markdown is said to be from outside the workspace. One the
 * plugin has nothing by that name for is answered CodeNotFound.
 */
export interface RefShowResult {
  changed?: Time;
  fields: Record<string, string>;
}

/**
 * Action is something a plugin can do when it's asked from Find: its id, in
 * lower-case letters, digits and hyphens, and what it's called there.
 */
export interface Action {
  id: string;
  title: string;
  /** Icon is one of ws's icon names. Hint says more, after the title. */
  icon?: string;
  hint?: string;
}

/**
 * ActionRunParams runs an action: the plugin's own, by its id, or one of a
 * kind's on one thing, by the kind and the thing's name. Answers are what's
 * been answered so far to what the action asked, in order: an action that asks
 * is run again with one more, from the start.
 */
export interface ActionRunParams {
  id: string;
  kind?: string;
  ref?: string;
  answers: string[];
}

/**
 * ActionRunResult is what came of it. With Ask, nothing's been done yet: the
 * action wants one thing answered, and is run again with the answer. Otherwise
 * it's done: Say is a line to tell whoever asked, and Open a path in the
 * plugin's app to go to.
 */
export interface ActionRunResult {
  ask?: Ask;
  say?: string;
  open?: string;
}

/** Ask is one thing an action wants answered before it does anything. */
export interface Ask {
  title: string;
  /** Type is AskPick, one of Options, or AskText, a line typed. */
  type: AskType | (string & {});
  options?: Option[];
  placeholder?: string;
}

// The types of an ask.
export const AskPick = "pick";
export const AskText = "text";
export type AskType = typeof AskPick | typeof AskText;

/** Option is one thing to pick: what's answered (Value), and what's shown. */
export interface Option {
  value: string;
  label: string;
  hint?: string;
}

// The types of a config key.
export const TypeString = "string";
export const TypeURL = "url";
export const TypeBool = "bool";
export const TypeNumber = "number";
export const TypeEnum = "enum";
export const TypeList = "list";
export const TypeSecret = "secret";
/**
 * TypeTable is named rows, each holding the key's Fields. Its value is its
 * rows, in the order they were written ([]ConfigRow). A ws from before tables
 * gives it as the file has it, an object of objects by row name, which has no
 * order.
 */
export const TypeTable = "table";
/** TypeMap is text to text: an object of strings. */
export const TypeMap = "map";
export type ConfigType = typeof TypeString | typeof TypeURL | typeof TypeBool | typeof TypeNumber | typeof TypeEnum | typeof TypeList | typeof TypeSecret | typeof TypeTable | typeof TypeMap;

// Where a config key's value is kept.
export const ScopeShared = "shared";
export const ScopeLocal = "local";
export type ConfigScope = typeof ScopeShared | typeof ScopeLocal;

/** ConfigKey is one key of a plugin's config. */
export interface ConfigKey {
  key: string;
  title?: string;
  type: ConfigType | (string & {});
  required?: boolean;
  /** Default is the key's value where none is set, of its type. */
  default?: string | number | boolean | string[] | Record<string, unknown>;
  help?: string;
  example?: string;
  options?: string[];
  scope?: ConfigScope | (string & {});
  /**
   * Fields are what each row of a table holds: keys of any type but a secret.
   * One may be a table itself, whose own fields may not be. Row is what a row's
   * name is called, in words ("Query", "Space key"), for whoever's asked for
   * one.
   */
  fields?: ConfigKey[];
  row?: string;
}

/**
 * ConfigRow is one row of a table as ws sends it: its name, and its fields'
 * values. A field that's a table is rows in turn.
 */
export interface ConfigRow {
  name: string;
  values: Record<string, unknown>;
}

/** ConfigChangedParams is the whole config, after a change. */
export interface ConfigChangedParams {
  config: Record<string, unknown>;
}

/**
 * ViewLookingParams is who's looking at what the plugin shows in ws's web UI.
 * ws says it when it changes, and asks nothing by it: what a plugin fetches,
 * and when, is the plugin's to decide.
 */
export interface ViewLookingParams {
  /** App: the plugin's app is on screen, in a page of ws's that's showing. */
  app: boolean;
  /**
   * WS: a page of ws's web UI is showing, whichever it is, so the plugin's
   * sidebar entries and their badges are on screen. True whenever App is.
   */
  ws: boolean;
}

/**
 * CommandRunParams is a command someone ran: everything after the command's
 * name, where it was run from, and what's on the other end.
 */
export interface CommandRunParams {
  /** ID is ws's name for this run: its output carries it. */
  id: string;
  args: string[];
  dir: string;
  terminal: Terminal;
  /**
   * Input is what's on the command's standard input: InputPiped or
   * InputTerminal, read with command/read. An addition to version 1: a ws from
   * before it says nothing, and gives the command nothing to read.
   */
  input?: Input | (string & {});
}

// What's on a command's standard input.
/** a pipe or a file: ws … < ops.json */
export const InputPiped = "piped";
/** the person, typing */
export const InputTerminal = "terminal";
export type Input = typeof InputPiped | typeof InputTerminal;

/** Terminal is what a command's output is going to. */
export interface Terminal {
  tty: boolean;
  width: number;
  color: boolean;
}

/** CommandRunResult ends a command. */
export interface CommandRunResult {
  exit: number;
}

// A running command reading its standard input.
/**
 * MethodCommandRead is a running command reading its standard input. A request
 * from the plugin, and an addition to version 1: a ws that sends a command/run
 * its Input answers it.
 */
export const MethodCommandRead = "command/read";

/**
 * ReadAtOnce is the most one command/read gives (64 KiB): it gives what's
 * there, up to Max or this, whichever is less.
 */
export const ReadAtOnce = 65536;

/**
 * CommandReadParams asks for what's next on a command's standard input. ID is
 * the command/run's.
 */
export interface CommandReadParams {
  id: string;
  max: number;
}

/**
 * CommandReadResult is what was read: some bytes, at least one unless EOF,
 * which says there's no more. Data is base64 in JSON, so it's whatever was
 * piped, cut wherever.
 */
export interface CommandReadResult {
  data?: Bytes;
  eof?: boolean;
}

// The streams of a command's output.
export const Stdout = "stdout";
export const Stderr = "stderr";
export type Stream = typeof Stdout | typeof Stderr;

/**
 * CommandOutputParams is a piece of a running command's output. ID is the id of
 * the command/run it belongs to.
 */
export interface CommandOutputParams {
  id: string;
  stream: Stream | (string & {});
  data: string;
}

/** LogParams is a line for ws to show: level is debug, info, warn or error. */
export interface LogParams {
  level: string;
  message: string;
}

/**
 * ViewBadgeParams is the count beside a view's sidebar entry: the view
 * registered with that path.
 */
export interface ViewBadgeParams {
  path: string;
  count: number;
}

/** SyncStateParams says a sync finished. At is RFC 3339. */
export interface SyncStateParams {
  name: string;
  at: string;
  took_ms: number;
  error: string;
}

// What a plugin asks ws: requests, each answered. Each is an addition to
// version 1: a ws from before it answers CodeMethodNotFound.
export const MethodMissionList = "mission/list";
export const MethodMissionShow = "mission/show";
export const MethodRepoList = "repo/list";
export const MethodShow = "show";

// The states of a mission. One that's ended is landed, answered, handed-on
// or dropped; one that's archived has ended, and is put away.
/** its brief isn't confirmed yet */
export const MissionBriefing = "briefing";
/** confirmed, and nothing's been made */
export const MissionDraft = "draft";
export const MissionActive = "active";
/** its pull requests are open */
export const MissionReview = "review";
export const MissionLanded = "landed";
export const MissionParked = "parked";
export const MissionAnswered = "answered";
export const MissionHandedOn = "handed-on";
export const MissionDropped = "dropped";
export const MissionArchived = "archived";
export type MissionState = typeof MissionBriefing | typeof MissionDraft | typeof MissionActive | typeof MissionReview | typeof MissionLanded | typeof MissionParked | typeof MissionAnswered | typeof MissionHandedOn | typeof MissionDropped | typeof MissionArchived;

// Whose move a mission's headline says it is.
/** crew, a briefing agent or the orchestrator is on it */
export const CourtAgent = "agent";
/** it waits on the person */
export const CourtYou = "you";
/** it waits on GitHub: reviewers, checks, a merge */
export const CourtOutside = "outside";
export type Court = typeof CourtAgent | typeof CourtYou | typeof CourtOutside;

/**
 * MissionListParams says which missions: those in play, and with Archived,
 * those archived too.
 */
export interface MissionListParams {
  archived?: boolean;
}

/** MissionListResult is the workspace's missions, those in play first. */
export interface MissionListResult {
  missions: Mission[];
}

/** MissionShowParams names a mission by its slug. */
export interface MissionShowParams {
  slug: string;
}

/** Mission is a mission as a list shows it. */
export interface Mission {
  slug: string;
  title: string;
  /** State is one of the Mission states. */
  state: MissionState | (string & {});
  created: Time;
  /** Updated is when anything of it last changed. */
  updated: Time;
  /**
   * Headline is where it stands now, and whose move it is. Nil for an archived
   * mission.
   */
  headline?: Headline;
  /** At is where it is on its route, in words. */
  at?: string;
  capsules: MissionCapsule[];
  /**
   * Path is its page in ws's web UI: what a plugin's app opens with ws:open.
   */
  path: string;
  /**
   * About is what it's about, by name: one of a plugin's things (RAM-123), a
   * pull request, anything ws names. A plugin finds the missions about one of
   * its things by it.
   */
  about?: string[];
}

/** Headline is a mission's one line of where it stands. */
export interface Headline {
  /** Court is one of the Courts: whose move it is. */
  court: Court | (string & {});
  text: string;
}

/**
 * MissionCapsule is a capsule a mission works in: a repo's branch, in a folder
 * of its own while it exists, and its pull request once it has one.
 */
export interface MissionCapsule {
  repo: string;
  name: string;
  branch?: string;
  /** Path is its folder, while it exists. */
  path?: string;
  pull_request?: PullRequest;
  /**
   * Landed: a capsule of a repo with no pull requests has landed its commits on
   * the default branch.
   */
  landed?: boolean;
}

/** PullRequest is a pull request on GitHub, as ws last heard of it. */
export interface PullRequest {
  number: number;
  title?: string;
  url: string;
  /** State is open, merged or closed. */
  state: string;
}

/**
 * MissionDetail is a mission as its page shows it: as a list does, with its
 * brief and its plan.
 */
export interface MissionDetail extends Mission {
  brief: string;
  plan?: string;
}

/** RepoListResult is the workspace's repos, in ws's order. */
export interface RepoListResult {
  repos: Repo[];
}

/** Repo is one of the workspace's repos, and its capsules. */
export interface Repo {
  name: string;
  /** Title is what ws calls it, where that isn't its name. */
  title: string;
  group?: string;
  aliases?: string[];
  /** Cloned: it's here, not only named in ws.toml. */
  cloned: boolean;
  /**
   * Path is its folder: its capsules are in it, and its default branch is
   * checked out in Ground.
   */
  path: string;
  capsules: Capsule[];
}

/** Capsule is a repo's branch, checked out in a folder of its own. */
export interface Capsule {
  name: string;
  branch?: string;
  path: string;
  /** Ground: it's the repo's default branch, which work starts from. */
  ground?: boolean;
  /** Mission is the slug of the mission in play that works in it. */
  mission?: string;
}

/**
 * ShowParams names one of the workspace's things by its ref, as ws show does:
 * one of a plugin's things (RAM-123), a pull request (api#12), a document
 * (records:docs/plan.md), one of the workspace's conversations, pages or
 * artifacts (w4, p2, a3), or, with Mission, one of a mission's own (t3, d1, s2,
 * c1, r1.c2). A mission itself is its slug, as Ref or as Mission with no Ref.
 * Full is everything a view would otherwise cut short.
 */
export interface ShowParams {
  ref?: string;
  mission?: string;
  full?: boolean;
}

/**
 * Shown is one of the workspace's things as ws show shows it: what it is, what
 * it links to and what points at it.
 */
export interface Shown {
  /** Ref and Mission are what was asked for. */
  ref?: string;
  mission?: string;
  /**
   * Head is what it is, in a line, and Body the essentials of it: lines and
   * paragraphs of plain text, as ws show prints them.
   */
  head: string;
  body: string[];
  /**
   * Links are what it links to. Each is asked for in turn with its Ref and this
   * view's Mission.
   */
  links: ShownLink[];
  /**
   * Said is what points at it from elsewhere in the workspace, what still
   * stands first, then latest first.
   */
  said: Said[];
  /** Path is its page in ws's web UI, where it has one. */
  path?: string;
}

/**
 * ShownLink is something a view links to: its ref, and what it is to the view,
 * in words.
 */
export interface ShownLink {
  ref: string;
  what: string;
}

// How one thing points at another.
/** a mission, a thread or a talk → what it's about */
export const SaidAbout = "about";
/** a comment or a finding → a file, at lines */
export const SaidOn = "on";
/** a document, a review, a decision → who made it */
export const SaidBy = "by";
/** a document, crew → the stage it's for */
export const SaidFor = "for";
/** a review → what's reviewed */
export const SaidOf = "of";
/** a decision → its thread; a cell → its page */
export const SaidIn = "in";
/** a mission, a document → what it came from */
export const SaidFrom = "from";
/** text → what it names */
export const SaidMentions = "mentions";
/** a capsule → its pull request; a pull request → its mission */
export const SaidLands = "lands";
export type SaidHow = typeof SaidAbout | typeof SaidOn | typeof SaidBy | typeof SaidFor | typeof SaidOf | typeof SaidIn | typeof SaidFrom | typeof SaidMentions | typeof SaidLands;

/** Said is something that points at what a view shows. */
export interface Said {
  /**
   * Ref is its ref where it's read: in Mission, or under PullRequest (api#12),
   * or, with neither, the workspace's. A mission's own Ref is its slug, with no
   * Mission. It's asked for in turn with its Ref and Mission as they are, and
   * one under a pull request by the pull request.
   */
  ref: string;
  mission?: string;
  pull_request?: string;
  /**
   * Kind is what it is: mission, brief, handoff, file, decision, comment,
   * review, talk, thread-ask, thread-change, thread-note, thing, pull-request,
   * page, artifact, document, and whatever ws adds.
   */
  kind: string;
  title: string;
  /**
   * State is where it stands, in its kind's words, and Standing whether that's
   * still in play: open, current, a draft.
   */
  state?: string;
  standing: boolean;
  /**
   * How is how it points: one of the Said… constants, or whatever ws adds.
   * Lines is where in a file, as they were when it was said (17, 17-20). At is
   * when it was said, where ws has when: zero where it hasn't.
   */
  how: SaidHow | (string & {});
  lines?: string;
  at?: Time;
  /** Path is its page in ws's web UI, where it has one. */
  path?: string;
}

// What a plugin has ws do, for the person who's using it: a request,
// answered, and an addition to version 1.
export const MethodConversationStart = "conversation/start";

/**
 * ConversationStartParams is what a conversation is started with: what the
 * person says first, as the plugin words it for them. What it names as ws names
 * things (RAM-123) is read as that thing, so the conversation's agent can read
 * it, and the thing says the conversation names it.
 */
export interface ConversationStartParams {
  message: string;
}

/**
 * ConversationStarted is a conversation ws has started: one of the workspace's
 * (w4), whose agent is answering, and its page in ws's web UI.
 */
export interface ConversationStarted {
  id: string;
  path: string;
}

// What a plugin tells ws of its things, so ws has them without asking:
// requests, each answered, and each an addition to version 1. ws keeps what
// it's told under the plugin, and forgets it when the plugin's removed.
export const MethodThingPut = "thing/put";
export const MethodThingRemove = "thing/remove";
export const MethodThingList = "thing/list";

/**
 * ThingsAtOnce is how many things one thing/put may hold: more is refused whole
 * (CodeInvalidParams), so a plugin with more sends them in turn.
 */
export const ThingsAtOnce = 500;

/**
 * Thing is one of the plugin's things, as ws keeps it: found by what its kind
 * says it's found by (ws find, the web UI's Find) and drawn from its kind's
 * views, without asking the plugin.
 */
export interface Thing {
  /**
   * Kind is the Ref it's named by, and Ref its name: one of that kind's, as the
   * plugin registered them. ws keeps no thing it couldn't name.
   */
  kind: string;
  ref: string;
  /**
   * Changed is when it last changed, where the plugin knows: of two found
   * alike, the newer is first.
   */
  changed?: Time;
  /**
   * Fields are its values, by its kind's fields' names, each a string (a time
   * as RFC 3339). One its kind hasn't is dropped, and ws keeps the start of a
   * long one. A thing with nothing for its kind's title isn't kept.
   */
  fields: Record<string, string>;
}

/**
 * ThingPutParams are things to keep: each added, or put in place of what ws had
 * by that name.
 */
export interface ThingPutParams {
  things: Thing[];
}

/** ThingPutResult says which weren't kept, and why. The rest were. */
export interface ThingPutResult {
  refused?: ThingRefused[];
}

/**
 * ThingRefused is a thing ws didn't keep: its name isn't one of that kind's, it
 * has nothing for its kind's title, or ws has something of its own by that
 * name.
 */
export interface ThingRefused {
  kind: string;
  ref: string;
  why: string;
}

/**
 * ThingRemoveParams are things of a kind to forget, by name. One ws doesn't
 * have is nothing to forget.
 */
export interface ThingRemoveParams {
  kind: string;
  refs: string[];
}

/** ThingListParams asks which things of a kind ws has from this plugin. */
export interface ThingListParams {
  kind: string;
}

/** ThingListResult is their names, in order. */
export interface ThingListResult {
  refs: string[];
}

// A kind's things that live in a repo (Remote). ws finds them, so it asks
// the plugin what one's file is found by (a request to the plugin), and the
// plugin asks ws which there are and for one's file (requests to ws). Each
// is an addition to version 1.
/**
 * MethodRemoteRead is ws asking what a main file is found by. Asked once for
 * each version of a file, of a kind whose Remote Reads.
 */
export const MethodRemoteRead = "remote/read";
/**
 * MethodRemoteList is a plugin asking which things of a kind are in the
 * workspace's repos.
 */
export const MethodRemoteList = "remote/list";
/** MethodRemoteOpen is a plugin asking for one's main file. */
export const MethodRemoteOpen = "remote/open";
/**
 * MethodRemoteExport is ws asking the plugin for one of its things as its
 * folder in a repo is to hold it, to promote it or to save it. Asked of a kind
 * whose Remote Exports.
 */
export const MethodRemoteExport = "remote/export";
/**
 * MethodRemoteSaved is ws telling the plugin that one of its things is in a
 * repo, as it was exported. The answer is {}.
 */
export const MethodRemoteSaved = "remote/saved";
/**
 * MethodRemotePromote is a plugin asking ws to put one of its things in a repo,
 * for the person who asked it to. ws asks the plugin for the thing
 * (MethodRemoteExport).
 */
export const MethodRemotePromote = "remote/promote";
/**
 * MethodRemoteSave is a plugin asking ws to save one of its things that's in a
 * repo, as the person has it now.
 */
export const MethodRemoteSave = "remote/save";

/**
 * RemoteReadMax is the most of a main file ws sends to be read (32 MiB): one
 * that's larger is found by its title alone.
 */
export const RemoteReadMax = 33554432;

/**
 * RemoteReadParams is a main file to read: the thing's kind and name (its
 * folder, as ws names one), what its manifest calls it, and the file.
 */
export interface RemoteReadParams {
  kind: string;
  name: string;
  title?: string;
  /** File is the main file's name, and Content what's in it. */
  file: string;
  content: Bytes;
}

/**
 * RemoteReadResult is what the file says: a value for each of the kind's fields
 * that it has one for, as a Thing has them. Its title is its manifest's: one
 * given here is dropped.
 */
export interface RemoteReadResult {
  fields: Record<string, string>;
}

/**
 * RemoteListParams asks which things of a kind are in the workspace's repos.
 */
export interface RemoteListParams {
  kind: string;
}

/** RemoteListResult is those things, in order of name. */
export interface RemoteListResult {
  things: RemoteThing[];
}

/** RemoteThing is a thing that lives in a repo, as ws found it. */
export interface RemoteThing {
  kind: string;
  /**
   * Name is its name: its folder, as ws names one
   * (records/sketches/release-flow/).
   */
  name: string;
  /** Repo is the repo it's in, and Path its folder there, ending in /. */
  repo: string;
  path: string;
  /**
   * RepoLabel is what ws calls the repo (Records), and Group where the thing is
   * among its kind's things there: the folders between the place its kind's
   * things go and its own folder (cross-stack, plans/q4), "" for one straight
   * in the place. They're how a plugin lists its things as they're organised in
   * their repos: by repo, then by group. For one that's in none of the places
   * its kind's things go, Group is the folders it's in from the repo's top.
   */
  repo_label?: string;
  group?: string;
  /** Title is what its manifest calls it. */
  title: string;
  /**
   * Main is its main file's name, and Picture its picture's, if it has one:
   * both in its folder.
   */
  main: string;
  picture?: string;
  /**
   * Version is what its folder holds, as ws names it: the same while every file
   * in it is, and another when any of them changes. It's ws's to make: a plugin
   * keeps it, and gives it back.
   */
  version: string;
  /**
   * Changed is when it last changed in its repo, and ChangedBy who by, where ws
   * knows.
   */
  changed?: Time;
  changed_by?: string;
}

/** RemoteOpenParams asks for one thing's main file, by its kind and name. */
export interface RemoteOpenParams {
  kind: string;
  name: string;
}

/**
 * RemoteOpened is the thing, and its main file as it is on its repo's default
 * branch. One ws has nothing by that name for is CodeNotFound.
 */
export interface RemoteOpened extends RemoteThing {
  content: Bytes;
}

/**
 * RemotePackage is a thing as its folder in a repo holds it: what it's called,
 * its main file, and the files the plugin made from the main file. ws writes
 * the folder as it's given, with a ManifestName of its own, in place of
 * whatever was there.
 */
export interface RemotePackage {
  title: string;
  /** Main is the main file's content: its name is the kind's. */
  main: Bytes;
  /** Files are what's made from it, each by its name in the folder. */
  files?: RemoteFile[];
}

/** RemoteFile is a file made from a thing's main file: a picture of it. */
export interface RemoteFile {
  /**
   * Name is the file's name in the folder, with RemoteSlug where the thing's
   * slug goes ({slug}.svg): a name alone, with no folder.
   */
  name: string;
  content: Bytes;
  /** Picture: it's the thing's picture, as its manifest says. One at most. */
  picture?: boolean;
}

/**
 * RemoteExportParams asks for one of the plugin's own things, by its kind and
 * the plugin's name for it (sketch-12), as its folder in a repo is to hold it.
 */
export interface RemoteExportParams {
  kind: string;
  ref: string;
  /**
   * Current is the thing as it is in its repo now, where that isn't the version
   * the plugin last had of it (a RemoteExported's Base): someone else saved it
   * since. The plugin brings what's there into what it has, however its kind
   * merges, and gives the two together, made from Current's version.
   */
  current?: RemoteOpened;
}

/**
 * RemoteExported is one of the plugin's things as its folder is to hold it:
 * where it lives, if it lives in a repo, the version of it there that this was
 * made from, and the package.
 */
export interface RemoteExported extends RemotePackage {
  /**
   * Name is the thing's name in its repo (its folder, as ws names one), for one
   * that's in one: none for one that isn't yet.
   */
  name?: string;
  /**
   * Base is the version of it there that what's given was made from: a
   * RemoteThing's Version, as the plugin last had it from ws (opened, told it
   * was saved, or given as Current). None for one that isn't in a repo.
   */
  base?: string;
}

/**
 * RemoteSavedParams tells the plugin one of its things is in a repo, as it was
 * last exported: the plugin's name for it, and the thing as it's there. Its
 * Version is what the plugin's next export is made from.
 */
export interface RemoteSavedParams {
  kind: string;
  ref: string;
  thing: RemoteThing;
}

/**
 * RemotePromoteParams asks ws to put one of the plugin's own things in a repo:
 * its kind and the plugin's name for it. ws asks the plugin for it
 * (MethodRemoteExport), names its folder from the kind's Remote and its title,
 * commits it as the person, and lands it as its repo lands.
 */
export interface RemotePromoteParams {
  kind: string;
  ref: string;
  /**
   * To is where it's to live, as the person said (repo:folder/): none for where
   * the kind's things go.
   */
  to?: string;
}

/**
 * RemoteSaveParams asks ws to save one of the plugin's own things that's in a
 * repo, as the person has it now.
 */
export interface RemoteSaveParams {
  kind: string;
  ref: string;
}

/** RemoteSaved is what promoting or saving did. */
export interface RemoteSaved {
  /**
   * Thing is the thing as it is in its repo now, or, where its repo takes pull
   * requests, as it is in the capsule it's been left in.
   */
  thing: RemoteThing;
  /**
   * Changed is whether it changed anything there: not when the folder was as
   * the plugin gave it already.
   */
  changed?: boolean;
  /**
   * Merged is whether what's there had changed since the plugin last had it,
   * and the plugin brought the two together.
   */
  merged?: boolean;
  /**
   * Capsule is the capsule it was left in, for the person to open a pull
   * request from, where its repo takes them: it's on no default branch yet, and
   * ws finds it once it's merged. None where it landed.
   */
  capsule?: string;
  /** Said is what was done, in a sentence, for the person. */
  said?: string;
}

/**
 * Proposes is something a conversation's agent may propose of the plugin's: its
 * id (the agent names it plugin:id), what it's called on the card that asks the
 * user, and When, a line or two for the agent's first message on when to
 * propose it. How one's written is the plugin's to say when it's asked
 * (ProposalDraftParams with no input), as it is then.
 */
export interface Proposes {
  id: string;
  title: string;
  icon?: string;
  when?: string;
}

/**
 * ProposalDraftParams is a conversation's agent proposing something of the
 * plugin's: which (ID), and what it wrote (Input, JSON of the plugin's own
 * shape). No Input: it's asking how one's written. Where: the conversation it's
 * proposed in, and its mission's slug, if it's a mission's.
 */
export interface ProposalDraftParams {
  id: string;
  input?: unknown;
  conversation: string;
  mission?: string;
}

/**
 * ProposalDraftResult answers a draft with one of: Guide, how one's written
 * (asked with no input); Refused, what's wrong with what was written and what
 * to write instead, for the agent; or Proposal, what the user's asked to
 * accept.
 */
export interface ProposalDraftResult {
  guide?: string;
  refused?: string;
  proposal?: Proposal;
}

/**
 * Proposal is what the plugin will do once it's accepted, as the user's shown
 * it: a line for the whole (Title: "3 issues in RAM"), and its items, each
 * accepted or not. The plugin is trusted to do what it says here, and only
 * that.
 */
export interface Proposal {
  title: string;
  items: ProposalItem[];
}

/**
 * ProposalItem is one thing to be done: what it's called, the thing it's done
 * to (On, a name: RAM-12; "" for one made), what it'll be, row by row, and at
 * length (Markdown), and Payload, the plugin's own, which ws keeps and sends
 * back as it was when the item's accepted. An item names an earlier one of the
 * same proposal as #1, #2…; what it made is given when it's accepted.
 */
export interface ProposalItem {
  title: string;
  on?: string;
  rows?: ProposalRow[];
  markdown?: string;
  payload: unknown;
}

/**
 * ProposalRow is a label and what it'll be, and, for a change to something
 * that's there, what it was (Was, nil for a row that isn't a change).
 */
export interface ProposalRow {
  label: string;
  value: string;
  was?: string;
}

/**
 * ProposalAcceptParams is the user accepting items of what was drafted (ID): by
 * their number in it, from 1, each with its payload, in order. Made is what
 * items accepted before made, by number, for an item that names one (#1). Key
 * is ws's for the proposal, the same each time it's asked: an item's is Key/N,
 * and one that was made already isn't made again.
 */
export interface ProposalAcceptParams {
  id: string;
  key: string;
  items: AcceptItem[];
  made?: { [n: number]: string };
  conversation: string;
  mission?: string;
}

/**
 * AcceptItem is one item accepted: its number in the proposal, and its payload
 * as drafted.
 */
export interface AcceptItem {
  n: number;
  payload: unknown;
}

/** ProposalAcceptResult is what came of each item asked, in order. */
export interface ProposalAcceptResult {
  items: AcceptedItem[];
}

/**
 * AcceptedItem is what came of one item: Made, the name of what it made or
 * changed (RAM-130), and Say, a line on it; or Problem, why it wasn't done
 * (it's left to be accepted again). Open is a path in the plugin's app to see
 * it at.
 */
export interface AcceptedItem {
  n: number;
  made?: string;
  say?: string;
  open?: string;
  problem?: string;
}

/**
 * What ws asks a plugin, by method: what it's sent with, and what it's answered
 * with.
 */
export interface RequestsToPlugin {
  "initialize": { params: InitializeParams; result: InitializeResult };
  "command/run": { params: CommandRunParams; result: CommandRunResult };
  "shutdown": { params: undefined; result: null };
  "ref/show": { params: RefShowParams; result: RefShowResult };
  "action/run": { params: ActionRunParams; result: ActionRunResult };
  "proposal/draft": { params: ProposalDraftParams; result: ProposalDraftResult };
  "proposal/accept": { params: ProposalAcceptParams; result: ProposalAcceptResult };
  "remote/read": { params: RemoteReadParams; result: RemoteReadResult };
  "remote/export": { params: RemoteExportParams; result: RemoteExported };
  "remote/saved": { params: RemoteSavedParams; result: Record<string, never> };
}

/**
 * What ws tells a plugin, by method: what it's sent with. It's never answered.
 */
export interface NotificationsToPlugin {
  "$/cancel_request": { requestId: string | number };
  "config/changed": ConfigChangedParams;
  "view/looking": ViewLookingParams;
}

/**
 * What a plugin asks ws, by method: what it's sent with, and what it's answered
 * with.
 */
export interface RequestsToWS {
  "command/read": { params: CommandReadParams; result: CommandReadResult };
  "mission/list": { params: MissionListParams; result: MissionListResult };
  "mission/show": { params: MissionShowParams; result: MissionDetail };
  "repo/list": { params: undefined; result: RepoListResult };
  "show": { params: ShowParams; result: Shown };
  "conversation/start": { params: ConversationStartParams; result: ConversationStarted };
  "thing/put": { params: ThingPutParams; result: ThingPutResult };
  "thing/remove": { params: ThingRemoveParams; result: null };
  "thing/list": { params: ThingListParams; result: ThingListResult };
  "remote/list": { params: RemoteListParams; result: RemoteListResult };
  "remote/open": { params: RemoteOpenParams; result: RemoteOpened };
  "remote/promote": { params: RemotePromoteParams; result: RemoteSaved };
  "remote/save": { params: RemoteSaveParams; result: RemoteSaved };
}

/**
 * What a plugin tells ws, by method: what it's sent with. It's never answered.
 */
export interface NotificationsToWS {
  "$/cancel_request": { requestId: string | number };
  "command/output": CommandOutputParams;
  "log": LogParams;
  "view/changed": Record<string, never>;
  "view/badge": ViewBadgeParams;
  "sync/state": SyncStateParams;
}
