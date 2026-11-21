import "@withworkspace/protocol-kit";

using WS.Protocol;

namespace WS.Plugin;

/**
 * Proposes is something a conversation's agent may propose of the plugin's:
 * its id (the agent names it plugin:id), what it's called on the card that
 * asks the user, and When, a line or two for the agent's first message on
 * when to propose it. How one's written is the plugin's to say when it's
 * asked (ProposalDraftParams with no input), as it is then.
 */
model Proposes {
  @pattern("^[a-z][a-z0-9-]{0,39}$")
  id: string;

  title: string;
  icon?: string;
  when?: string;
}

/**
 * ProposalDraftParams is a conversation's agent proposing something of the
 * plugin's: which (ID), and what it wrote (Input, JSON of the plugin's own
 * shape). No Input: it's asking how one's written. Where: the conversation
 * it's proposed in, and its mission's slug, if it's a mission's.
 */
model ProposalDraftParams {
  id: string;
  input?: unknown;
  conversation: string;
  mission?: string;
}

/**
 * ProposalDraftResult answers a draft with one of: Guide, how one's written
 * (asked with no input); Refused, what's wrong with what was written and
 * what to write instead, for the agent; or Proposal, what the user's asked
 * to accept.
 */
model ProposalDraftResult {
  guide?: string;
  refused?: string;
  proposal?: Proposal;
}

/**
 * Proposal is what the plugin will do once it's accepted, as the user's
 * shown it: a line for the whole (Title: "3 issues in RAM"), and its items,
 * each accepted or not. The plugin is trusted to do what it says here, and
 * only that.
 */
model Proposal {
  title: string;
  items: ProposalItem[];
}

/**
 * ProposalItem is one thing to be done: what it's called, the thing it's
 * done to (On, a name: RAM-12; "" for one made), what it'll be, row by row,
 * and at length (Markdown), and Payload, the plugin's own, which ws keeps and
 * sends back as it was when the item's accepted. An item names an earlier
 * one of the same proposal as #1, #2…; what it made is given when it's
 * accepted.
 */
model ProposalItem {
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
model ProposalRow {
  label: string;
  value: string;

  @presence
  was?: string;
}

/**
 * ProposalAcceptParams is the user accepting items of what was drafted (ID):
 * by their number in it, from 1, each with its payload, in order. Made is
 * what items accepted before made, by number, for an item that names one
 * (#1). Key is ws's for the proposal, the same each time it's asked: an
 * item's is Key/N, and one that was made already isn't made again.
 */
model ProposalAcceptParams {
  id: string;
  key: string;
  items: AcceptItem[];

  @intKeys
  made?: Record<string>;

  conversation: string;
  mission?: string;
}

/**
 * AcceptItem is one item accepted: its number in the proposal, and its
 * payload as drafted.
 */
model AcceptItem {
  n: int32;
  payload: unknown;
}

/** ProposalAcceptResult is what came of each item asked, in order. */
model ProposalAcceptResult {
  items: AcceptedItem[];
}

/**
 * AcceptedItem is what came of one item: Made, the name of what it made or
 * changed (RAM-130), and Say, a line on it; or Problem, why it wasn't done
 * (it's left to be accepted again). Open is a path in the plugin's app to
 * see it at.
 */
model AcceptedItem {
  n: int32;
  made?: string;
  say?: string;
  open?: string;
  problem?: string;
}
