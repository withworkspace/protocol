import "@withworkspace/protocol-kit";

using WS.Protocol;

namespace WS.Plugin;

/**
 * NotifyRoute is where a kind of notification is sent until the person says
 * otherwise: to their feed, or nowhere. Sending it to the desktop as well is
 * theirs alone to choose.
 */
enum NotifyRoute {
  RouteFeed: "feed",
  RouteOff: "off",
}

/**
 * Notifies is a kind of notification the plugin sends the person
 * (notification/add): its id, what Settings calls it, and About, a line on
 * when it's sent. Each kind is the person's to send to their feed, to the
 * desktop as well, or nowhere, under the plugin's name in Settings ›
 * Notifications; Default is where it's sent until they say (feed, unless
 * it says off). A plugin sends only the kinds it registered.
 */
model Notifies {
  @pattern("^[a-z][a-z0-9-]{0,39}$")
  id: string;

  title: string;
  about?: string;
  default?: NotifyRoute;
}

/**
 * What a plugin tells the person of: a request, answered, and an addition
 * to version 1. A ws from before it doesn't have the method.
 */
@sentBy("plugin")
interface Notifications {
  @method("notification/add")
  notificationAdd(params: NotificationAddParams): NotificationAdded;
}

/**
 * NotificationAddParams is a notification: which of the plugin's kinds it
 * is (one of Registration.Notifies' ids), and what happened, as a sentence.
 * Refs is what it's about as ws names things (RAM-123, api#12), the first
 * what opening it goes to. Key is the plugin's own name for what happened:
 * one sent again with a key already sent isn't added twice, so a plugin
 * that sees the same change twice needn't remember it told of it.
 * Attention marks one that went wrong. At is when it happened, if not now.
 */
model NotificationAddParams {
  kind: string;
  text: string;
  refs?: string[];
  key?: string;
  attention?: boolean;
  at?: utcDateTime;
}

/**
 * NotificationAdded says what became of it: its number in the feed (n12),
 * Added false where one with the same key was there already (N is that
 * one's), and Muted where the person sends its kind nowhere: it's kept all
 * the same, so it's there if they change their mind.
 */
model NotificationAdded {
  n: int64;
  added: boolean;
  muted?: boolean;
}
