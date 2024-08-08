import dotenv from "dotenv";
import path from "path";
import https from "https";
import fs from "fs";
dotenv.config();
if (process.env.NODE_ENV == "development") {
  dotenv.config({ path: path.resolve(__dirname, "../../" + `${process.env.NODE_ENV}.env`) });
}
const prikey = fs.readFileSync(path.resolve(__dirname, "../../util/.pem/key.pem"), "utf8");
const cert = fs.readFileSync(path.resolve(__dirname, "../../util/.pem/ca.pem"), "utf8");
const credentials = {
  key: prikey,
  cert: cert,
};

import app from "../app";

const port = process.env.PORT;
app.set("port", port);
const server = https.createServer(credentials, app);

server.listen(port, () => {
  console.log(`server is listening on ${port} !!!`);
});
