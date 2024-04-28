import http from "http";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../../" + `${process.env.NODE_ENV}.env`) });
import app from "../app";

const port = 4000;
app.set("port", port);
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`server is listening on ${port} !!!`);
});
