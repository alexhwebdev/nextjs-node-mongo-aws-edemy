// NextJS custom server : https://nextjs.org/docs/app/building-your-application/configuring/custom-server

const express = require("express");
// import express from "express"
const next = require("next");
// import next from 'next'
const { createProxyMiddleware } = require("http-proxy-middleware");
// import { createProxyMiddleware } from 'http-proxy-middleware';

const dev = process.env.NODE_ENV !== "production";
console.log('dev', dev) // true
const app = next({ dev }); // use next to create app server
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();
    // apply proxy in dev mode
    if (dev) {
      server.use(
        "/api", // everytime there is "/api" createProxyMiddleare
        createProxyMiddleware({
          target: "http://localhost:8000",
          changeOrigin: true,
        })
      );
    }
    // any req coming into the server
    server.all("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(3000, (err) => {
      if (err) throw err;
      console.log("> Ready on http://localhost:8000");
    });
  })
  .catch((err) => {
    console.log("Error", err);
  });
