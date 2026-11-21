import "@withworkspace/protocol-kit";

using WS.Protocol;

namespace WS.Plugin;

/**
 * A kind's things that live in a repo (Remote). ws finds them, so it asks
 * the plugin what one's file is found by (a request to the plugin), and the
 * plugin asks ws which there are and for one's file (requests to ws). Each
 * is an addition to version 1.
 */
@sentBy("plugin")
interface Remotes {
  /**
   * MethodRemoteRead is ws asking what a main file is found by. Asked once
   * for each version of a file, of a kind whose Remote Reads.
   */
  @method("remote/read")
  @sentBy("ws")
  remoteRead(params: RemoteReadParams): RemoteReadResult;

  /**
   * MethodRemoteList is a plugin asking which things of a kind are in the
   * workspace's repos.
   */
  @method("remote/list")
  remoteList(params: RemoteListParams): RemoteListResult;

  /** MethodRemoteOpen is a plugin asking for one's main file. */
  @method("remote/open")
  remoteOpen(params: RemoteOpenParams): RemoteOpened;

  /**
   * MethodRemoteExport is ws asking the plugin for one of its things as its
   * folder in a repo is to hold it, to promote it or to save it. Asked of a
   * kind whose Remote Exports.
   */
  @method("remote/export")
  @sentBy("ws")
  remoteExport(params: RemoteExportParams): RemoteExported;

  /**
   * MethodRemoteSaved is ws telling the plugin that one of its things is in
   * a repo, as it was exported. The answer is {}.
   */
  @method("remote/saved")
  @sentBy("ws")
  remoteSaved(params: RemoteSavedParams): {};

  /**
   * MethodRemotePromote is a plugin asking ws to put one of its things in a
   * repo, for the person who asked it to. ws asks the plugin for the thing
   * (MethodRemoteExport).
   */
  @method("remote/promote")
  remotePromote(params: RemotePromoteParams): RemoteSaved;

  /**
   * MethodRemoteSave is a plugin asking ws to save one of its things that's
   * in a repo, as the person has it now.
   */
  @method("remote/save")
  remoteSave(params: RemoteSaveParams): RemoteSaved;
}

/**
 * RemoteReadMax is the most of a main file ws sends to be read (32 MiB): one
 * that's larger is found by its title alone.
 */
const RemoteReadMax = 33554432;

/**
 * RemoteReadParams is a main file to read: the thing's kind and name (its
 * folder, as ws names one), what its manifest calls it, and the file.
 */
model RemoteReadParams {
  kind: string;
  name: string;
  title?: string;

  /** File is the main file's name, and Content what's in it. */
  file: string;

  content: bytes;
}

/**
 * RemoteReadResult is what the file says: a value for each of the kind's
 * fields that it has one for, as a Thing has them. Its title is its
 * manifest's: one given here is dropped.
 */
model RemoteReadResult {
  fields: Record<string>;
}

/**
 * RemoteListParams asks which things of a kind are in the workspace's
 * repos.
 */
model RemoteListParams {
  kind: string;
}

/** RemoteListResult is those things, in order of name. */
model RemoteListResult {
  things: RemoteThing[];
}

/** RemoteThing is a thing that lives in a repo, as ws found it. */
model RemoteThing {
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
   * RepoLabel is what ws calls the repo (Records), and Group where the thing
   * is among its kind's things there: the folders between the place its
   * kind's things go and its own folder (cross-stack, plans/q4), "" for one
   * straight in the place. They're how a plugin lists its things as they're
   * organised in their repos: by repo, then by group. For one that's in none
   * of the places its kind's things go, Group is the folders it's in from
   * the repo's top.
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
   * Version is what its folder holds, as ws names it: the same while every
   * file in it is, and another when any of them changes. It's ws's to make:
   * a plugin keeps it, and gives it back.
   */
  version: string;

  /**
   * Changed is when it last changed in its repo, and ChangedBy who by, where
   * ws knows.
   */
  changed?: utcDateTime;

  changed_by?: string;
}

/** RemoteOpenParams asks for one thing's main file, by its kind and name. */
model RemoteOpenParams {
  kind: string;
  name: string;
}

/**
 * RemoteOpened is the thing, and its main file as it is on its repo's
 * default branch. One ws has nothing by that name for is CodeNotFound.
 */
model RemoteOpened extends RemoteThing {
  content: bytes;
}

/**
 * RemotePackage is a thing as its folder in a repo holds it: what it's
 * called, its main file, and the files the plugin made from the main file.
 * ws writes the folder as it's given, with a ManifestName of its own, in
 * place of whatever was there.
 */
model RemotePackage {
  title: string;

  /** Main is the main file's content: its name is the kind's. */
  main: bytes;

  /** Files are what's made from it, each by its name in the folder. */
  files?: RemoteFile[];
}

/** RemoteFile is a file made from a thing's main file: a picture of it. */
model RemoteFile {
  /**
   * Name is the file's name in the folder, with RemoteSlug where the thing's
   * slug goes ({slug}.svg): a name alone, with no folder.
   */
  name: string;

  content: bytes;

  /** Picture: it's the thing's picture, as its manifest says. One at most. */
  picture?: boolean;
}

/**
 * RemoteExportParams asks for one of the plugin's own things, by its kind and
 * the plugin's name for it (sketch-12), as its folder in a repo is to hold
 * it.
 */
model RemoteExportParams {
  kind: string;
  ref: string;

  /**
   * Current is the thing as it is in its repo now, where that isn't the
   * version the plugin last had of it (a RemoteExported's Base): someone else
   * saved it since. The plugin brings what's there into what it has, however
   * its kind merges, and gives the two together, made from Current's
   * version.
   */
  current?: RemoteOpened;
}

/**
 * RemoteExported is one of the plugin's things as its folder is to hold it:
 * where it lives, if it lives in a repo, the version of it there that this
 * was made from, and the package.
 */
model RemoteExported extends RemotePackage {
  /**
   * Name is the thing's name in its repo (its folder, as ws names one), for
   * one that's in one: none for one that isn't yet.
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
 * RemoteSavedParams tells the plugin one of its things is in a repo, as it
 * was last exported: the plugin's name for it, and the thing as it's there.
 * Its Version is what the plugin's next export is made from.
 */
model RemoteSavedParams {
  kind: string;
  ref: string;
  thing: RemoteThing;
}

/**
 * RemotePromoteParams asks ws to put one of the plugin's own things in a
 * repo: its kind and the plugin's name for it. ws asks the plugin for it
 * (MethodRemoteExport), names its folder from the kind's Remote and its
 * title, commits it as the person, and lands it as its repo lands.
 */
model RemotePromoteParams {
  kind: string;
  ref: string;

  /**
   * To is where it's to live, as the person said (repo:folder/): none for
   * where the kind's things go.
   */
  to?: string;
}

/**
 * RemoteSaveParams asks ws to save one of the plugin's own things that's in
 * a repo, as the person has it now.
 */
model RemoteSaveParams {
  kind: string;
  ref: string;
}

/** RemoteSaved is what promoting or saving did. */
model RemoteSaved {
  /**
   * Thing is the thing as it is in its repo now, or, where its repo takes
   * pull requests, as it is in the capsule it's been left in.
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
   * request from, where its repo takes them: it's on no default branch yet,
   * and ws finds it once it's merged. None where it landed.
   */
  capsule?: string;

  /** Said is what was done, in a sentence, for the person. */
  said?: string;
}
