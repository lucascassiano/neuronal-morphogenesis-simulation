/**
 * What this does?
 * It communicates with a websocket server that mirrors a Redis PubSub stream
 * Why do we need this?
 * To read, on client side, reactive data from a REDIS pubsub streams
 */

export default class WebsocketClient {
  // intializing websocket events
  constructor(address, debug = false) {
    this.ws = new WebSocket(address);
    this.open = false;
    this.debug = debug;

    this.ws.onclose = () => {
      this.open = false;

      if (this.onClose) {
        this.onClose();
      }

      if (this.debug) console.log("[WebsocketClient] :: closed");
    };

    this.ws.onopen = () => {
      this.open = true;

      if (this.debug) console.log("[WebsocketClient] :: open");

      if (this.onOpen) this.onOpen();

    };

    this.ws.onmessage = async (event) => {
      if (this.debug == true) console.log("[WebsocketClient] :: received", event.data);

      if (this.onReceived) this.onReceived(event.data);
    };
  }

  send = (channel, data) => {
    const msg = JSON.stringify({
      channel: channel,
      data: data,
    });

    this.ws.send(msg);
    // console.log(`[WebsocketClient] :: sent > ${channel} _ ${data}`);
  };
}
