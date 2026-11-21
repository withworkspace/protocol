# Generate every protocol's code from its spec: plugin/gen/.
gen:
    pnpm install --frozen-lockfile
    pnpm run build
    pnpm exec tsp compile plugin/spec --config plugin/spec/tspconfig.yaml
    gofmt -w plugin/gen/go

# Fail if what's generated isn't what's committed, or doesn't compile.
check: gen
    git diff --exit-code -- plugin/gen
    just vet-go plugin/gen/go
    pnpm exec tsc --noEmit --strict --target es2023 --module nodenext plugin/gen/ts/protocol.gen.ts

# go vet a folder of generated Go, as a module of its own.
vet-go dir:
    #!/usr/bin/env bash
    set -euo pipefail
    tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
    cp {{dir}}/*.go "$tmp"
    cd "$tmp" && go mod init check >/dev/null 2>&1 && go vet ./...
