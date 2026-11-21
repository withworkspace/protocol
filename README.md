# protocol

The protocols ws speaks with its plugins, written in [TypeSpec](https://typespec.io), with the code each language's plugin framework is built on generated from them.

- `plugin/`: ws core and a plugin's process (JSON-RPC 2.0 over stdio).
- `frame/`: ws's web UI and a plugin's frame (postMessage).

Each is versioned on its own: tags are `plugin/vX.Y.Z` and `frame/vX.Y.Z`.
