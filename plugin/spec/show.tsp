import "@withworkspace/protocol-kit";

using WS.Protocol;

namespace WS.Plugin;

/**
 * ShowParams names one of the workspace's things by its ref, as ws show
 * does: one of a plugin's things (RAM-123), a pull request (api#12), a
 * document (records:docs/plan.md), one of the workspace's conversations,
 * pages or artifacts (w4, p2, a3), or, with Mission, one of a mission's own
 * (t3, d1, s2, c1, r1.c2). A mission itself is its slug, as Ref or as
 * Mission with no Ref. Full is everything a view would otherwise cut short.
 */
model ShowParams {
  ref?: string;
  mission?: string;
  full?: boolean;
}

/**
 * Shown is one of the workspace's things as ws show shows it: what it is,
 * what it links to and what points at it.
 */
model Shown {
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
   * Links are what it links to. Each is asked for in turn with its Ref and
   * this view's Mission.
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
 * ShownLink is something a view links to: its ref, and what it is to the
 * view, in words.
 */
model ShownLink {
  ref: string;
  what: string;
}

/** How one thing points at another. */
enum SaidHow {
  /** a mission, a thread or a talk → what it's about */
  SaidAbout: "about",

  /** a comment or a finding → a file, at lines */
  SaidOn: "on",

  /** a document, a review, a decision → who made it */
  SaidBy: "by",

  /** a document, crew → the stage it's for */
  SaidFor: "for",

  /** a review → what's reviewed */
  SaidOf: "of",

  /** a decision → its thread; a cell → its page */
  SaidIn: "in",

  /** a mission, a document → what it came from */
  SaidFrom: "from",

  /** text → what it names */
  SaidMentions: "mentions",

  /** a capsule → its pull request; a pull request → its mission */
  SaidLands: "lands",
}

/** Said is something that points at what a view shows. */
model Said {
  /**
   * Ref is its ref where it's read: in Mission, or under PullRequest
   * (api#12), or, with neither, the workspace's. A mission's own Ref is its
   * slug, with no Mission. It's asked for in turn with its Ref and Mission as
   * they are, and one under a pull request by the pull request.
   */
  ref: string;

  mission?: string;
  pull_request?: string;

  /**
   * Kind is what it is: mission, brief, handoff, file, decision, comment,
   * review, talk, thread-ask, thread-change, thread-note, thing,
   * pull-request, page, artifact, document, and whatever ws adds.
   */
  kind: string;

  title: string;

  /**
   * State is where it stands, in its kind's words, and Standing whether
   * that's still in play: open, current, a draft.
   */
  state?: string;

  standing: boolean;

  /**
   * How is how it points: one of the Said… constants, or whatever ws adds.
   * Lines is where in a file, as they were when it was said (17, 17-20). At
   * is when it was said, where ws has when: zero where it hasn't.
   */
  how: SaidHow | string;

  lines?: string;
  at?: utcDateTime;

  /** Path is its page in ws's web UI, where it has one. */
  path?: string;
}
