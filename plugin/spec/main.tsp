import "@withworkspace/protocol-kit";
import "./connection.tsp";
import "./handshake.tsp";
import "./registration.tsp";
import "./refs.tsp";
import "./actions.tsp";
import "./config.tsp";
import "./commands.tsp";
import "./missions.tsp";
import "./show.tsp";
import "./conversations.tsp";
import "./things.tsp";
import "./remote.tsp";
import "./proposals.tsp";

using WS.Protocol;

/**
 * The plugin protocol: what ws and a plugin send each other over the
 * plugin's stdin and stdout, as JSON-RPC 2.0, one message per line. Its
 * rules, what's on disk and how a plugin's published are in PROTOCOL.md.
 */
@protocol("plugin")
namespace WS.Plugin;
