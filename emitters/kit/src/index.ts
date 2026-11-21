// The protocol kit: the decorators a protocol's spec is written with, and
// what every language's emitter reads it by: its declarations in the order
// they're written, and its methods, each with its name on the wire, which
// side sends it, and whether it's answered.

import {
  getDoc,
  navigateProgram,
  type DecoratorContext,
  type Enum,
  type Interface,
  type Model,
  type ModelProperty,
  type Namespace,
  type Operation,
  type Program,
  type Type,
} from "@typespec/compiler";
import { SyntaxKind, type Node } from "@typespec/compiler/ast";

const key = (name: string) => Symbol.for(`@withworkspace/protocol-kit.${name}`);
const keys = {
  protocol: key("protocol"),
  method: key("method"),
  notification: key("notification"),
  sentBy: key("sentBy"),
  presence: key("presence"),
  intKeys: key("intKeys"),
};

export type Side = "ws" | "plugin" | "either";

function $protocol(context: DecoratorContext, target: Namespace, name: string) {
  context.program.stateMap(keys.protocol).set(target, name);
}
function $method(context: DecoratorContext, target: Operation, name: string) {
  context.program.stateMap(keys.method).set(target, name);
}
function $notification(context: DecoratorContext, target: Operation) {
  context.program.stateSet(keys.notification).add(target);
}
function $sentBy(context: DecoratorContext, target: Interface | Operation, side: Side) {
  context.program.stateMap(keys.sentBy).set(target, side);
}
function $presence(context: DecoratorContext, target: ModelProperty) {
  context.program.stateSet(keys.presence).add(target);
}
function $intKeys(context: DecoratorContext, target: ModelProperty) {
  context.program.stateSet(keys.intKeys).add(target);
}

export const $decorators = {
  "WS.Protocol": {
    protocol: $protocol,
    method: $method,
    notification: $notification,
    sentBy: $sentBy,
    presence: $presence,
    intKeys: $intKeys,
  },
};

/** Whether a property's absence says something its empty value doesn't. */
export const isPresence = (program: Program, p: ModelProperty) => program.stateSet(keys.presence).has(p);

/** Whether a Record property's keys are whole numbers. */
export const isIntKeys = (program: Program, p: ModelProperty) => program.stateSet(keys.intKeys).has(p);

/** One of the protocol's methods. */
export interface Method {
  op: Operation;
  /** Its name on the wire: config/changed. */
  wire: string;
  notification: boolean;
  sentBy: Side;
  /** What it's sent with: none for a method with no params. */
  params?: Type;
  /** What it's answered with: none for a notification or a request answered with nothing. */
  result?: Type;
  doc?: string;
}

/** A protocol's declarations, in the order they're written. */
export type Decl =
  | { kind: "model"; type: Model; doc?: string }
  | { kind: "enum"; type: Enum; doc?: string }
  | { kind: "const"; name: string; value: string | number | boolean; doc?: string }
  | { kind: "methods"; type: Interface; doc?: string; methods: Method[] };

export interface Protocol {
  name: string;
  namespace: Namespace;
  decls: Decl[];
  methods: Method[];
}

/** The protocol the program's spec is: the namespace marked @protocol. */
export function readProtocol(program: Program): Protocol {
  let namespace: Namespace | undefined;
  navigateProgram(program, {
    namespace(ns) {
      if (program.stateMap(keys.protocol).has(ns)) namespace = ns;
    },
  });
  if (!namespace) throw new Error("no namespace is marked @protocol");
  const ns = namespace;
  const name = program.stateMap(keys.protocol).get(ns) as string;

  const decls: Decl[] = [];
  const methods: Method[] = [];
  const checker = program.checker;
  const inProtocol = (t: { namespace?: Namespace }) => {
    for (let n = t.namespace; n; n = n.namespace) if (n === ns) return true;
    return false;
  };

  const visit = (statements: readonly Node[], nsNames: string[]) => {
    for (const s of statements) {
      switch (s.kind) {
        case SyntaxKind.NamespaceStatement: {
          // WS.Plugin is WS holding Plugin. One with no block (namespace
          // WS.Plugin;) holds the rest of its file.
          let n: any = s;
          const names = [...nsNames];
          for (;;) {
            names.push(n.id.sv);
            if (n.statements?.kind === SyntaxKind.NamespaceStatement) n = n.statements;
            else break;
          }
          if (Array.isArray(n.statements)) visit(n.statements, names);
          else nsNames = names;
          break;
        }
        case SyntaxKind.ModelStatement: {
          const t = checker.getTypeForNode(s) as Model;
          if (inProtocol(t)) decls.push({ kind: "model", type: t, doc: getDoc(program, t) });
          break;
        }
        case SyntaxKind.EnumStatement: {
          const t = checker.getTypeForNode(s) as Enum;
          if (inProtocol(t)) decls.push({ kind: "enum", type: t, doc: getDoc(program, t) });
          break;
        }
        case SyntaxKind.InterfaceStatement: {
          const t = checker.getTypeForNode(s) as Interface;
          if (!inProtocol(t)) break;
          const ms = [...t.operations.values()].map((op) => readMethod(program, t, op));
          methods.push(...ms);
          decls.push({ kind: "methods", type: t, doc: getDoc(program, t), methods: ms });
          break;
        }
        case SyntaxKind.ConstStatement: {
          if (nsNames.join(".") !== fullName(ns)) break;
          decls.push(readConst(s as any));
          break;
        }
      }
    }
  };
  for (const file of program.sourceFiles.values()) visit(file.statements, []);
  return { name, namespace: ns, decls, methods };
}

function fullName(ns: Namespace): string {
  const parts: string[] = [];
  for (let n: Namespace | undefined = ns; n && n.name; n = n.namespace) parts.unshift(n.name);
  return parts.join(".");
}

function readMethod(program: Program, iface: Interface, op: Operation): Method {
  const wire = program.stateMap(keys.method).get(op) as string | undefined;
  if (!wire) throw new Error(`${iface.name}.${op.name} has no @method`);
  const sentBy = (program.stateMap(keys.sentBy).get(op) ?? program.stateMap(keys.sentBy).get(iface)) as Side | undefined;
  if (!sentBy) throw new Error(`${iface.name}.${op.name}: neither it nor its interface says who sends it (@sentBy)`);
  const notification = program.stateSet(keys.notification).has(op);
  const params = [...op.parameters.properties.values()];
  if (params.length > 1) throw new Error(`${iface.name}.${op.name} takes ${params.length} parameters: a method takes one, its params`);
  const ret = op.returnType;
  const result = ret.kind === "Intrinsic" && (ret.name === "void" || ret.name === "never") ? undefined : ret;
  if (notification && result) throw new Error(`${iface.name}.${op.name} is a notification, which is never answered: it returns void`);
  return { op, wire, notification, sentBy, params: params[0]?.type, result, doc: getDoc(program, op) };
}

function readConst(node: any): Decl {
  const name: string = node.id.sv;
  const v = node.value;
  let value: string | number | boolean;
  switch (v.kind) {
    case SyntaxKind.StringLiteral:
      value = v.value;
      break;
    case SyntaxKind.NumericLiteral:
      value = v.value;
      break;
    case SyntaxKind.BooleanLiteral:
      value = v.value;
      break;
    default:
      throw new Error(`const ${name} is not a string, number or boolean literal`);
  }
  const doc = (node.docs ?? [])
    .flatMap((d: any) => d.content.map((c: any) => c.text as string))
    .join("\n")
    .trim();
  return { kind: "const", name, value, doc: doc || undefined };
}
