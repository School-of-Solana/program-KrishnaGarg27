import { Buffer } from "buffer";

if (!window.Buffer) {
  window.Buffer = Buffer;
}

if (typeof window.TextEncoder === "undefined") {
  window.TextEncoder = require("util").TextEncoder;
}

if (typeof window.TextDecoder === "undefined") {
  window.TextDecoder = require("util").TextDecoder;
}
