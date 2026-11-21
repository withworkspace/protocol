import "@withworkspace/protocol-kit";

using WS.Protocol;

namespace WS.Plugin;

/**
 * CommandRunParams is a command someone ran: everything after the command's
 * name, where it was run from, and what's on the other end.
 */
model CommandRunParams {
  /** ID is ws's name for this run: its output carries it. */
  id: string;

  args: string[];
  dir: string;
  terminal: Terminal;

  /**
   * Input is what's on the command's standard input: InputPiped or
   * InputTerminal, read with command/read. An addition to version 1: a ws
   * from before it says nothing, and gives the command nothing to read.
   */
  input?: Input | string;
}

/** What's on a command's standard input. */
enum Input {
  /** a pipe or a file: ws … < ops.json */
  InputPiped: "piped",

  /** the person, typing */
  InputTerminal: "terminal",
}

/** Terminal is what a command's output is going to. */
model Terminal {
  tty: boolean;
  width: int32;
  color: boolean;
}

/** CommandRunResult ends a command. */
model CommandRunResult {
  exit: int32;
}

/** A running command reading its standard input. */
@sentBy("plugin")
interface CommandInput {
  /**
   * MethodCommandRead is a running command reading its standard input. A
   * request from the plugin, and an addition to version 1: a ws that sends a
   * command/run its Input answers it.
   */
  @method("command/read")
  commandRead(params: CommandReadParams): CommandReadResult;
}

/**
 * ReadAtOnce is the most one command/read gives (64 KiB): it gives what's
 * there, up to Max or this, whichever is less.
 */
const ReadAtOnce = 65536;

/**
 * CommandReadParams asks for what's next on a command's standard input. ID
 * is the command/run's.
 */
model CommandReadParams {
  id: string;
  max: int32;
}

/**
 * CommandReadResult is what was read: some bytes, at least one unless EOF,
 * which says there's no more. Data is base64 in JSON, so it's whatever was
 * piped, cut wherever.
 */
model CommandReadResult {
  data?: bytes;
  eof?: boolean;
}

/** The streams of a command's output. */
enum Stream {
  Stdout: "stdout",
  Stderr: "stderr",
}

/**
 * CommandOutputParams is a piece of a running command's output. ID is the id
 * of the command/run it belongs to.
 */
model CommandOutputParams {
  id: string;
  stream: Stream | string;
  data: string;
}

/** LogParams is a line for ws to show: level is debug, info, warn or error. */
model LogParams {
  level: string;
  message: string;
}

/**
 * ViewBadgeParams is the count beside a view's sidebar entry: the view
 * registered with that path.
 */
model ViewBadgeParams {
  path: string;
  count: int32;
}

/** SyncStateParams says a sync finished. At is RFC 3339. */
model SyncStateParams {
  name: string;
  at: string;
  took_ms: int64;
  error: string;
}
