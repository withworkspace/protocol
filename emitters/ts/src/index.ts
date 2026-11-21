// The TypeScript emitter: a protocol's types, constants and method names as
// one module, with what each side may send the other by method, so that a
// framework's calls and handlers are typed by the spec.

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
import { docBlocks, isIntKeys, readProtocol, wrap, type Decl, type Method } from "@withworkspace/protocol-kit";

export interface TSOptions {
  /** The file's name. */
  file?: string;
}

const optionsSchema: JSONSchemaType<TSOptions> = {
  type: "object",
  additionalProperties: false,
  properties: { file: { type: "string", nullable: true } },
  required: [],
};

export const $lib = createTypeSpecLibrary({
  name: "@withworkspace/protocol-ts",
  diagnostics: {},
  emitter: { options: optionsSchema },
});

export async function $onEmit(context: EmitContext<TSOptions>) {
  if (context.program.compilerOptions.noEmit) return;
  const file = context.options.file ?? "protocol.gen.ts";
  const content = new TSWriter(context.program).file();
  await emitFile(context.program, { path: resolvePath(context.emitterOutputDir, file), content });
}

/** "plugin" sends to ws; "ws" sends to the plugin. */
type To = "ToPlugin" | "ToWS";

class TSWriter {
  private out: string[] = [];
  private aliases = new Set<"Bytes" | "Time">();

  constructor(private program: Program) {}

  file(): string {
    const protocol = readProtocol(this.program);
    for (const d of protocol.decls) {
      this.decl(d);
      this.out.push("");
    }
    this.methodMaps(protocol.methods);

    const head = [
      `// Code generated from the ${protocol.name} protocol's spec by github.com/withworkspace/protocol. DO NOT EDIT.`,
      "",
    ];
    if (this.aliases.has("Bytes")) head.push("/** Bytes, as JSON has them: base64. */", "export type Bytes = string;", "");
    if (this.aliases.has("Time")) head.push("/** A moment, as JSON has it: RFC 3339. */", "export type Time = string;", "");
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
        this.out.push(`export const ${d.name} = ${literal(d.value)};`);
        return;
      case "methods":
        return this.methods(d.methods, d.doc);
    }
  }

  private model(m: Model, doc?: string) {
    this.comment(doc, "");
    const ext = m.baseModel ? ` extends ${m.baseModel.name}` : "";
    this.out.push(`export interface ${m.name}${ext} {`);
    for (const p of m.properties.values()) this.field(p);
    this.out.push("}");
  }

  private field(p: ModelProperty) {
    this.comment(getDoc(this.program, p), "  ");
    const name = /^[A-Za-z_$][\w$]*$/.test(p.name) ? p.name : JSON.stringify(p.name);
    this.out.push(`  ${name}${p.optional ? "?" : ""}: ${this.type(p.type, p)};`);
  }

  // An enum is its constants, and a type that's one of them.
  private enum(e: Enum, doc?: string) {
    const members = [...e.members.values()];
    this.groupComment(doc);
    for (const m of members) {
      this.comment(getDoc(this.program, m), "");
      this.out.push(`export const ${m.name} = ${literal(m.value ?? m.name)};`);
    }
    this.out.push(`export type ${e.name} = ${members.map((m) => `typeof ${m.name}`).join(" | ")};`);
  }

  private methods(methods: Method[], doc?: string) {
    this.groupComment(doc);
    for (const m of methods) {
      this.comment(m.doc, "");
      this.out.push(`export const Method${pascal(m.op.name)} = ${literal(m.wire)};`);
    }
  }

  // What each side may send the other, by method: a request's params and
  // what it's answered with, and a notification's params.
  private methodMaps(methods: Method[]) {
    const to = (m: Method): To[] => (m.sentBy === "either" ? ["ToPlugin", "ToWS"] : m.sentBy === "ws" ? ["ToPlugin"] : ["ToWS"]);
    const maps: Record<string, string[]> = {};
    for (const m of methods) {
      for (const side of to(m)) {
        const key = `${m.notification ? "Notifications" : "Requests"}${side}`;
        const params = m.params ? this.type(m.params) : "undefined";
        const entry = m.notification
          ? `  ${JSON.stringify(m.wire)}: ${params};`
          : `  ${JSON.stringify(m.wire)}: { params: ${params}; result: ${m.result ? this.type(m.result) : "null"} };`;
        (maps[key] ??= []).push(entry);
      }
    }
    const docs: Record<string, string> = {
      RequestsToPlugin: "What ws asks a plugin, by method: what it's sent with, and what it's answered with.",
      NotificationsToPlugin: "What ws tells a plugin, by method: what it's sent with. It's never answered.",
      RequestsToWS: "What a plugin asks ws, by method: what it's sent with, and what it's answered with.",
      NotificationsToWS: "What a plugin tells ws, by method: what it's sent with. It's never answered.",
    };
    for (const key of ["RequestsToPlugin", "NotificationsToPlugin", "RequestsToWS", "NotificationsToWS"]) {
      this.comment(docs[key], "");
      this.out.push(`export interface ${key} {`, ...(maps[key] ?? []), "}", "");
    }
  }

  private type(t: Type, p?: ModelProperty): string {
    switch (t.kind) {
      case "Scalar":
        return this.scalar(t);
      case "Intrinsic":
        if (t.name === "unknown") return "unknown";
        if (t.name === "null") return "null";
        throw new Error(`no TypeScript type for ${t.name}`);
      case "Model": {
        if (t.indexer) {
          const value = this.type(t.indexer.value);
          if (t.indexer.key.name === "integer") return /^\w+$/.test(value) ? `${value}[]` : `(${value})[]`;
          return p && isIntKeys(this.program, p) ? `{ [n: number]: ${value} }` : `Record<string, ${value}>`;
        }
        if (t.name) return t.name;
        const props = [...t.properties.values()];
        if (props.length === 0) return "Record<string, never>";
        return `{ ${props.map((q) => `${q.name}${q.optional ? "?" : ""}: ${this.type(q.type, q)}`).join("; ")} }`;
      }
      case "Enum":
        return t.name;
      case "String":
        return JSON.stringify(t.value);
      case "Number":
        return String(t.value);
      case "Boolean":
        return String(t.value);
      case "Union": {
        const variants = [...t.variants.values()].map((v) => v.type);
        // An enum or any other word: the enum's words are offered, and any
        // string is taken, for what a newer side sends.
        const hasEnum = variants.some((v) => v.kind === "Enum");
        return variants
          .map((v) => (hasEnum && v.kind === "Scalar" && this.scalar(v) === "string" ? "(string & {})" : this.type(v)))
          .join(" | ");
      }
      default:
        throw new Error(`no TypeScript type for a ${t.kind}`);
    }
  }

  private scalar(s: Scalar): string {
    let std = s;
    while (std.baseScalar && std.namespace?.name !== "TypeSpec") std = std.baseScalar;
    switch (std.name) {
      case "string":
      case "url":
      case "plainDate":
      case "plainTime":
        return "string";
      case "boolean":
        return "boolean";
      case "bytes":
        this.aliases.add("Bytes");
        return "Bytes";
      case "utcDateTime":
      case "offsetDateTime":
        this.aliases.add("Time");
        return "Time";
      case "integer":
      case "int64":
      case "int32":
      case "int16":
      case "int8":
      case "safeint":
      case "uint8":
      case "uint16":
      case "uint32":
      case "float":
      case "float32":
      case "float64":
      case "numeric":
      case "decimal":
        return "number";
      default:
        throw new Error(`no TypeScript type for the scalar ${std.name}`);
    }
  }

  // A group's doc, said of what follows: a line comment, so that the JSDoc
  // of its first member is that member's.
  private groupComment(doc: string | undefined) {
    if (!doc) return;
    docBlocks(doc).forEach((b, i) => {
      if (i > 0) this.out.push("//");
      const lines = b.code ? b.text.split("\n") : wrap(b.text.split("\n").map((l) => l.trim()).join(" "), 74);
      for (const l of lines) this.out.push(l ? `// ${l}` : "//");
    });
  }

  // JSDoc: paragraphs reflowed, fenced blocks kept.
  private comment(doc: string | undefined, indent: string) {
    if (!doc) return;
    const width = 77 - indent.length;
    const lines: string[] = [];
    docBlocks(doc).forEach((b, i) => {
      if (i > 0) lines.push("");
      if (b.code) lines.push("```", ...b.text.split("\n"), "```");
      else lines.push(...wrap(b.text.split("\n").map((l) => l.trim()).join(" "), width));
    });
    if (lines.length === 1 && lines[0].length <= width - 4) {
      this.out.push(`${indent}/** ${lines[0]} */`);
      return;
    }
    this.out.push(`${indent}/**`, ...lines.map((l) => (l ? `${indent} * ${l}` : `${indent} *`)), `${indent} */`);
  }
}

function pascal(name: string): string {
  return name[0].toUpperCase() + name.slice(1);
}

function literal(v: string | number | boolean): string {
  return typeof v === "string" ? JSON.stringify(v) : String(v);
}
