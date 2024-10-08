import express from "express";
import path from "path";
import ApiRoute from "./routes/ApiRoute";
import logger from "morgan";
import cors from "cors";

let apiRoute = new ApiRoute();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger("dev"));

app.use("/", apiRoute.router);

app.use((req, res) => {
  res.status(404);
  res.end("路徑錯誤");
});

export default app;
