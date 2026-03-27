// Backend/server.js
require("dotenv").config();
console.log("BACKEND CLIENT ID:", process.env.PAYPAL_CLIENT_ID);
console.log("BACKEND SECRET:", process.env.PAYPAL_CLIENT_SECRET ? "OK" : "MISSING");

const express = require("express");
require("./mongoDB/DB");
const http = require("http");
const app = require("./app");

app.use(express.json());

const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};

const port = normalizePort(process.env.PORT || "5001");
app.set("port", port);

const errorHandler = (error) => {
  if (error.syscall !== "listen") throw error;
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges.");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);
server.on("error", errorHandler);
server.on("listening", () => {
  const address = server.address();
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log(`🚀 Serveur API en marche sur http://localhost:${port}`);
});

server.listen(port);
