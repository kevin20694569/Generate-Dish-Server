import express from "express";
import path from "path";
import ApiRoute from "./routes/ApiRoute";
import logger from "morgan";
let apiRoute = new ApiRoute();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/", apiRoute.router);

app.use((req, res) => {
  res.type("application/json");
  res.status(404);
  res.end("路徑錯誤");
});

export default app;
