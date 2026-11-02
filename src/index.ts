import { createApp } from "./app.js";
import { logEvent } from "./logger.js";

const port = Number(process.env.PORT ?? 3000);

createApp().listen(port, () => {
  logEvent("server_started", { url: `http://localhost:${port}` });
});
