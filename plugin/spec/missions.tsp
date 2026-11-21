import "@withworkspace/protocol-kit";

using WS.Protocol;

namespace WS.Plugin;

/**
 * What a plugin asks ws: requests, each answered. Each is an addition to
 * version 1: a ws from before it answers CodeMethodNotFound.
 */
@sentBy("plugin")
interface Asks {
  @method("mission/list")
  missionList(params: MissionListParams): MissionListResult;

  @method("mission/show")
  missionShow(params: MissionShowParams): MissionDetail;

  @method("repo/list")
  repoList(): RepoListResult;

  @method("show")
  show(params: ShowParams): Shown;
}

/**
 * The states of a mission. One that's ended is landed, answered, handed-on
 * or dropped; one that's archived has ended, and is put away.
 */
enum MissionState {
  /** its brief isn't confirmed yet */
  MissionBriefing: "briefing",

  /** confirmed, and nothing's been made */
  MissionDraft: "draft",

  MissionActive: "active",

  /** its pull requests are open */
  MissionReview: "review",

  MissionLanded: "landed",
  MissionParked: "parked",
  MissionAnswered: "answered",
  MissionHandedOn: "handed-on",
  MissionDropped: "dropped",
  MissionArchived: "archived",
}

/** Whose move a mission's headline says it is. */
enum Court {
  /** crew, a briefing agent or the orchestrator is on it */
  CourtAgent: "agent",

  /** it waits on the person */
  CourtYou: "you",

  /** it waits on GitHub: reviewers, checks, a merge */
  CourtOutside: "outside",
}

/**
 * MissionListParams says which missions: those in play, and with Archived,
 * those archived too.
 */
model MissionListParams {
  archived?: boolean;
}

/** MissionListResult is the workspace's missions, those in play first. */
model MissionListResult {
  missions: Mission[];
}

/** MissionShowParams names a mission by its slug. */
model MissionShowParams {
  slug: string;
}

/** Mission is a mission as a list shows it. */
model Mission {
  slug: string;
  title: string;

  /** State is one of the Mission states. */
  state: MissionState | string;

  created: utcDateTime;

  /** Updated is when anything of it last changed. */
  updated: utcDateTime;

  /**
   * Headline is where it stands now, and whose move it is. Nil for an
   * archived mission.
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
model Headline {
  /** Court is one of the Courts: whose move it is. */
  court: Court | string;

  text: string;
}

/**
 * MissionCapsule is a capsule a mission works in: a repo's branch, in a
 * folder of its own while it exists, and its pull request once it has one.
 */
model MissionCapsule {
  repo: string;
  name: string;
  branch?: string;

  /** Path is its folder, while it exists. */
  path?: string;

  pull_request?: PullRequest;

  /**
   * Landed: a capsule of a repo with no pull requests has landed its commits
   * on the default branch.
   */
  landed?: boolean;
}

/** PullRequest is a pull request on GitHub, as ws last heard of it. */
model PullRequest {
  number: int32;
  title?: string;
  url: string;

  /** State is open, merged or closed. */
  state: string;
}

/**
 * MissionDetail is a mission as its page shows it: as a list does, with its
 * brief and its plan.
 */
model MissionDetail extends Mission {
  brief: string;
  plan?: string;
}

/** RepoListResult is the workspace's repos, in ws's order. */
model RepoListResult {
  repos: Repo[];
}

/** Repo is one of the workspace's repos, and its capsules. */
model Repo {
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
model Capsule {
  name: string;
  branch?: string;
  path: string;

  /** Ground: it's the repo's default branch, which work starts from. */
  ground?: boolean;

  /** Mission is the slug of the mission in play that works in it. */
  mission?: string;
}
