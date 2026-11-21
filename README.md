# protocol

The protocols ws speaks with its plugins, written in [TypeSpec](https://typespec.io), and the code each language's plugin framework is built on, generated from them.

- [`plugin/`](plugin): ws core and a plugin's process. JSON-RPC 2.0, one message per line over the plugin's stdin and stdout. Its rules (what comes first, what's on disk, how a plugin's published) are in the kit's [`PROTOCOL.md`](https://github.com/withworkspace/plugin/blob/main/PROTOCOL.md).
- `frame/`: ws's web UI and a plugin's frame (postMessage). Not here yet: it's [`ui-lib`'s `v1.ts`](https://github.com/withworkspace/ui-lib/blob/main/src/v1.ts) until it is.

Each protocol is versioned on its own. Tags are `plugin/vX.Y.Z` and `frame/vX.Y.Z`.

## Layout

```
emitters/
  kit/       the decorators a spec is written with (@protocol, @method, @notification, @sentBy,
             @presence, @intKeys) and what every emitter reads a spec by: its declarations in
             order, and its methods
  go/        TypeSpec → one Go file of types, constants and method names
  ts/        TypeSpec → one TypeScript module of the same, and what each side may send
             the other by method (RequestsToPlugin, NotificationsToWS…), which types a
             framework's calls and handlers
plugin/
  spec/      the plugin protocol, in TypeSpec
  gen/go/    protocol.gen.go, committed: the kit's protocol package is this file
             and its own rules beside it
  gen/ts/    protocol.gen.ts, committed: the TypeScript kit's (withworkspace/plugin, ts/)
```

There's one emitter per language, not one per protocol: the Go emitter would write the frame protocol too, were it wanted in Go.

## Writing a spec

- **A property is named as it is on the wire:** `took_ms`, `pull_request`. Each language names it its own way (Go: `TookMS`).
- **A method is an operation** in an interface. `@method` is its name on the wire, and `@sentBy` (on the interface, or on the operation where it's another) is which side sends it. `@notification` marks one that's never answered. It takes one parameter, its params, or none, and returns what it's answered with, or `void`.
- **A set of words a field is one of is an enum,** named after the constants it makes (`FieldTitle: "title"`). A field that's one of them, or any other word a newer side may send, is `FieldType | string`.
- **A constant is a `const`:** `const ThingsAtOnce = 500;`.
- **Docs are written as Go's are,** a sentence starting with the name, since that reads well in any language. A code example goes in a fenced block (```).
- `@presence` is an optional property whose absence says something its empty value doesn't (in Go, a pointer). `@intKeys` is a `Record` keyed by whole numbers.

## Generating

```
just gen     # emitters built, every spec's code written to its gen/
just check   # and fails if that's not what's committed, or doesn't compile
```

It needs Node 22, pnpm and Go. A framework takes its file from here as it's committed: the kit's `just protocol` brings both.
