// The Go emitter: a protocol's types, constants and method names as one Go
// file, for a package that adds its own functions beside it.

import {
  createTypeSpecLibrary,
  emitFile,
  getDoc,
  resolvePath,
  type EmitContext,
  type Enum,
  type JSONSchemaType,
  type Model,
  type ModelProperty,
  type Program,
  type Scalar,
  type Type,
} from "@typespec/compiler";
import { isIntKeys, isPresence, readProtocol, type Decl, type Method } from "@withworkspace/protocol-kit";

export interface GoOptions {
  /** The Go package the file is in. */
  package?: string;
  /** The file's name. */
  file?: string;
}

const optionsSchema: JSONSchemaType<GoOptions> = {
  type: "object",
  additionalProperties: false,
  properties: {
    package: { type: "string", nullable: true },
    file: { type: "string", nullable: true },
  },
  required: [],
};

export const $lib = createTypeSpecLibrary({
  name: "@withworkspace/protocol-go",
  diagnostics: {},
  emitter: { options: optionsSchema },
});

export async function $onEmit(context: EmitContext<GoOptions>) {
  if (context.program.compilerOptions.noEmit) return;
  const pkg = context.options.package ?? "protocol";
  const file = context.options.file ?? "protocol.gen.go";
  const content = new GoWriter(context.program).file(pkg);
  await emitFile(context.program, { path: resolvePath(context.emitterOutputDir, file), content });
}

// Words Go writes in capitals in a name: took_ms is TookMS.
const initialisms = new Set(["id", "url", "uri", "ui", "tty", "ws", "eof", "ms", "json", "http", "api", "rpc"]);

export function goName(wire: string): string {
  return wire
    .split(/[_\-/]|(?<=[a-z0-9])(?=[A-Z])/)
    .filter(Boolean)
    .map((w) => (initialisms.has(w.toLowerCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join("");
}

class GoWriter {
  private imports = new Set<string>();
  private out: string[] = [];

  constructor(private program: Program) {}

  file(pkg: string): string {
    const protocol = readProtocol(this.program);
    for (const d of protocol.decls) {
      this.decl(d);
      this.out.push("");
    }
    const head = [
      `// Code generated from the ${protocol.name} protocol's spec by github.com/withworkspace/protocol. DO NOT EDIT.`,
      "",
      `package ${pkg}`,
      "",
    ];
    if (this.imports.size) {
      head.push("import (", ...[...this.imports].sort().map((i) => `\t"${i}"`), ")", "");
    }
    return [...head, ...this.out].join("\n").replace(/\n+$/, "\n");
  }

  private decl(d: Decl) {
    switch (d.kind) {
      case "model":
        return this.model(d.type, d.doc);
      case "enum":
        return this.enum(d.type, d.doc);
      case "const":
        this.comment(d.doc, "");
        this.out.push(`const ${d.name} = ${literal(d.value)}`);
        return;
      case "methods":
        return this.methods(d.methods, d.doc);
    }
  }

  private model(m: Model, doc?: string) {
    this.comment(doc, "");
    this.out.push(`type ${m.name} struct {`);
    if (m.baseModel) this.out.push(`\t${m.baseModel.name}`);
    for (const p of m.properties.values()) this.field(p);
    this.out.push("}");
  }

  private field(p: ModelProperty) {
    this.comment(getDoc(this.program, p), "\t");
    let type = this.type(p.type, p);
    let tag = p.name;
    if (p.optional) {
      const pointer = isPresence(this.program, p) || (isNamedModel(p.type) && !this.isTime(p.type));
      if (pointer) type = "*" + type;
      tag += this.isTime(p.type) ? ",omitzero" : ",omitempty";
    }
    this.out.push(`\t${goName(p.name)} ${type} \`json:"${tag}"\``);
  }

  private enum(e: Enum, doc?: string) {
    const members = [...e.members.values()];
    if (members.length === 1) {
      const m = members[0];
      this.comment(getDoc(this.program, m) ?? doc, "");
      this.out.push(`const ${m.name} = ${literal(m.value ?? m.name)}`);
      return;
    }
    this.comment(doc, "");
    this.out.push("const (");
    for (const m of members) {
      const mdoc = getDoc(this.program, m);
      const value = literal(m.value ?? m.name);
      if (mdoc && trailing(mdoc, m.name)) {
        this.out.push(`\t${m.name} = ${value} // ${mdoc}`);
      } else {
        this.comment(mdoc, "\t");
        this.out.push(`\t${m.name} = ${value}`);
      }
    }
    this.out.push(")");
  }

  private methods(methods: Method[], doc?: string) {
    this.comment(doc, "");
    this.out.push("const (");
    for (const m of methods) {
      this.comment(m.doc, "\t");
      const sig = m.notification
        ? `notification: ${this.typeName(m.params)}`
        : `request: ${this.typeName(m.params)} → ${this.typeName(m.result)}`;
      const from = m.sentBy === "either" ? "either side" : `from ${m.sentBy}`;
      this.out.push(`\tMethod${goName(m.op.name)} = ${literal(m.wire)} // ${from}, ${sig}`);
    }
    this.out.push(")");
  }

  private typeName(t?: Type): string {
    if (!t) return "nothing";
    if (t.kind === "Model" && !t.name && !t.indexer) return `{${[...t.properties.keys()].join(", ")}}`;
    return t.kind === "Model" && t.name ? t.name : this.type(t);
  }

  private isTime(t: Type): boolean {
    return t.kind === "Scalar" && ["utcDateTime", "offsetDateTime"].includes(stdScalar(t).name);
  }

  private type(t: Type, p?: ModelProperty): string {
    switch (t.kind) {
      case "Scalar":
        return this.scalar(t);
      case "Intrinsic":
        if (t.name === "unknown") {
          this.imports.add("encoding/json");
          return "json.RawMessage";
        }
        throw new Error(`no Go type for ${t.name}`);
      case "Model": {
        if (t.indexer) {
          const value = this.type(t.indexer.value);
          if (t.indexer.key.name === "integer") return `[]${value}`;
          return `map[${p && isIntKeys(this.program, p) ? "int" : "string"}]${value}`;
        }
        if (!t.name) throw new Error("a model with no name: give it one, so each language has a name for it");
        return t.name;
      }
      case "Enum":
        return enumBase(t);
      case "String":
        return "string";
      case "Number":
        return "int";
      case "Boolean":
        return "bool";
      case "Union": {
        const kinds = new Set([...t.variants.values()].map((v) => this.type(v.type)));
        return kinds.size === 1 ? [...kinds][0] : "any";
      }
      default:
        throw new Error(`no Go type for a ${t.kind}`);
    }
  }

  private scalar(s: Scalar): string {
    const std = stdScalar(s).name;
    switch (std) {
      case "string":
      case "url":
      case "plainDate":
      case "plainTime":
        return "string";
      case "boolean":
        return "bool";
      case "int64":
        return "int64";
      case "integer":
      case "int32":
      case "int16":
      case "int8":
      case "safeint":
      case "uint8":
      case "uint16":
      case "uint32":
        return "int";
      case "float":
      case "float32":
      case "float64":
      case "numeric":
      case "decimal":
        return "float64";
      case "bytes":
        return "[]byte";
      case "utcDateTime":
      case "offsetDateTime":
        this.imports.add("time");
        return "time.Time";
      default:
        throw new Error(`no Go type for the scalar ${std}`);
    }
  }

  // Go doc comments, wrapped: paragraphs reflowed, and a fenced block (```)
  // kept as it is, as Go's indented one.
  private comment(doc: string | undefined, indent: string) {
    if (!doc) return;
    const width = 74 - indent.replace(/\t/g, "    ").length;
    const blocks: { code: boolean; text: string }[] = [];
    doc.trim().split(/^```.*$/m).forEach((part, i) => {
      if (i % 2 === 1) blocks.push({ code: true, text: part.replace(/^\n|\n$/g, "") });
      else for (const p of part.split(/\n\s*\n/)) if (p.trim()) blocks.push({ code: false, text: p.trim() });
    });
    blocks.forEach((b, i) => {
      if (i > 0) this.out.push(`${indent}//`);
      if (b.code) {
        for (const l of b.text.split("\n")) this.out.push(`${indent}//\t${l}`);
        return;
      }
      for (const l of wrap(b.text.split("\n").map((l) => l.trim()).join(" "), width)) this.out.push(`${indent}// ${l}`);
    });
  }
}

function isNamedModel(t: Type): boolean {
  return t.kind === "Model" && !t.indexer && !!t.name;
}

function stdScalar(s: Scalar): Scalar {
  let cur = s;
  while (cur.baseScalar && cur.namespace?.name !== "TypeSpec") cur = cur.baseScalar;
  return cur;
}

function enumBase(e: Enum): string {
  const numeric = [...e.members.values()].every((m) => typeof m.value === "number");
  return numeric ? "int" : "string";
}

function literal(v: string | number | boolean): string {
  return typeof v === "string" ? JSON.stringify(v) : String(v);
}

// A member's doc goes after it when it's one short line that isn't a
// sentence about it by name.
function trailing(doc: string, name: string): boolean {
  return !doc.includes("\n") && doc.length <= 60 && !doc.startsWith(name);
}

function wrap(text: string, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && line.length + 1 + word.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}
