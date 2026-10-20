import express from "express";

const port = Number(process.env.PORT ?? 3000);
const app = express();

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`AstroBookings API listening on http://localhost:${port}`);
});
