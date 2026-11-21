import "@withworkspace/protocol-kit";

using WS.Protocol;

namespace WS.Plugin;

/** Version is the newest version of the protocol this package speaks. */
const Version = 1;

/** JSON-RPC's error codes, and the one for a request given up on. */
enum ErrorCode {
  CodeMethodNotFound: -32601,
  CodeInvalidParams: -32602,
  CodeInternal: -32603,
  CodeCancelled: -32800,

  /**
   * CodeNotFound is the answer for something asked for by name that isn't
   * there: ws's for a mission with no such slug, a plugin's for a ref it has
   * nothing by.
   */
  CodeNotFound: -32001,
}

/** Giving up on a request. */
@sentBy("either")
interface Cancel {
  /** MethodCancelRequest is how either side gives up on a request it made. */
  @method("$/cancel_request")
  @notification
  cancelRequest(params: {
    requestId: string | int64;
  }): void;
}
