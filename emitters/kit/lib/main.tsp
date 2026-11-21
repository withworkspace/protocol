import "../dist/index.js";

using TypeSpec.Reflection;

namespace WS.Protocol;

/**
 * The namespace is a protocol: its name (plugin, frame), which its emitted
 * code and its tags are named by.
 */
extern dec protocol(target: Namespace, name: valueof string);

/** The method's name on the wire: config/changed. */
extern dec method(target: Operation, name: valueof string);

/** A notification: sent, and never answered. Without it, a method is a request. */
extern dec notification(target: Operation);

/**
 * Which side sends an interface's methods, or one method where it isn't its
 * interface's: ws, the plugin, or either.
 */
extern dec sentBy(target: Interface | Operation, side: valueof "ws" | "plugin" | "either");

/**
 * An optional property whose absence says something its empty value doesn't:
 * a row's Was, where "" was empty and absent wasn't a change.
 */
extern dec presence(target: ModelProperty);

/** A Record whose keys are whole numbers, written in JSON as strings. */
extern dec intKeys(target: ModelProperty);
