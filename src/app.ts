import express, { type Express } from "express";
import { createRocketsRouter } from "./rockets.js";

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/rockets", createRocketsRouter());

  return app;
}
