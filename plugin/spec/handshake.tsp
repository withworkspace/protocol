import "@withworkspace/protocol-kit";

using WS.Protocol;

namespace WS.Plugin;

/** What ws sends a plugin. */
@sentBy("ws")
interface ToPlugin {
  /** Always first. */
  @method("initialize")
  initialize(params: InitializeParams): InitializeResult;

  @method("config/changed")
  @notification
  configChanged(params: ConfigChangedParams): void;

  @method("command/run")
  commandRun(params: CommandRunParams): CommandRunResult;

  /**
   * Finish and exit. The answer is null. ws closes stdin after it, and
   * kills a plugin still running five seconds later.
   */
  @method("shutdown")
  shutdown(): void;

  /**
   * MethodRefShow asks what one of the plugin's things is, by its name. An
   * addition to version 1: a plugin from before it answers
   * CodeMethodNotFound, and registers no refs.
   */
  @method("ref/show")
  refShow(params: RefShowParams): RefShowResult;

  /**
   * MethodActionRun runs one of the plugin's actions, its own or on one of
   * its things. An addition to version 1: a plugin that registers actions
   * answers it.
   */
  @method("action/run")
  actionRun(params: ActionRunParams): ActionRunResult;

  /**
   * MethodViewLooking is an addition to version 1: a ws from before it never
   * says who's looking, and a plugin from before it drops it.
   */
  @method("view/looking")
  @notification
  viewLooking(params: ViewLookingParams): void;

  /**
   * MethodProposalDraft is a conversation's agent proposing one of the
   * plugin's Proposes. With no input, it's asking how one's written. An
   * addition to version 1: a plugin that registers Proposes answers it.
   */
  @method("proposal/draft")
  proposalDraft(params: ProposalDraftParams): ProposalDraftResult;

  /**
   * MethodProposalAccept is the user accepting what was drafted, all of it
   * or some of its items.
   */
  @method("proposal/accept")
  proposalAccept(params: ProposalAcceptParams): ProposalAcceptResult;
}

/** What a plugin sends ws: notifications all. */
@sentBy("plugin")
interface ToWS {
  @method("command/output")
  @notification
  commandOutput(params: CommandOutputParams): void;

  @method("log")
  @notification
  log(params: LogParams): void;

  /** What the app shows is stale. ws tells the open app, which asks the plugin again. */
  @method("view/changed")
  @notification
  viewChanged(params: {}): void;

  @method("view/badge")
  @notification
  viewBadge(params: ViewBadgeParams): void;

  @method("sync/state")
  @notification
  syncState(params: SyncStateParams): void;
}

/** InitializeParams is what ws tells a plugin as it starts. */
model InitializeParams {
  /** Protocol is the newest version ws speaks. */
  protocol: int32;

  /**
   * Protocols are every version ws speaks. A ws from before versions were
   * chosen doesn't send it, and speaks only Protocol.
   */
  protocols?: int32[];

  ws: WSInfo;
  plugin: PluginInfo;
  workspace: Workspace;

  /**
   * Config is what's set, secrets included, by key. A key that isn't set is
   * absent.
   */
  config: Record<unknown>;

  view: ViewInfo;
}

/** WSInfo is the ws on the other end. */
model WSInfo {
  version: string;

  /**
   * Executable is ws's own program, for a plugin that runs ws's commands. A
   * ws from before it said doesn't.
   */
  executable?: string;
}

/** PluginInfo is the plugin as ws knows it: its plugin.toml, and its folders. */
model PluginInfo {
  name: string;
  version: string;
  dir: string;
  data: string;
}

/** Workspace is the workspace the plugin is installed in. */
model Workspace {
  root: string;
}

/**
 * ViewInfo is where a plugin serves its own HTTP (its app's files and what
 * its app asks it): a unix socket to listen on, and the path ws serves it
 * under.
 */
model ViewInfo {
  listen: string;
  base: string;
}

/**
 * InitializeResult is a plugin's answer: the version it chose, the versions
 * it speaks, and what it adds.
 */
model InitializeResult {
  /**
   * Protocol is the version chosen (Choose), which everything after
   * initialize is in. 0: ws and the plugin have none in common, and the
   * plugin registers nothing.
   */
  protocol: int32;

  /**
   * Protocols are every version the plugin speaks, so that ws can say which
   * side is behind when there's none in common.
   */
  protocols?: int32[];

  registration: Registration;
}
