import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://syncspace-server-jfmb.onrender.com";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false
});