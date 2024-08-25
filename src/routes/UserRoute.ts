import Route from "./Route";

class UserRoute extends Route {
  protected registerRoute() {
    this.router.post("/login", this.userController.login);
    this.router.post("/verifyjwttoken", async (req, res, next) => {
      let token = req.headers.authorization;
      try {
        if (token == undefined || token == null) {
          throw new Error("token is null");
        }
        token = token.split(" ")[1];

        let { newToken, user } = await this.userController.verifyJwtToken(token);
        res.setHeader("jwt-token", newToken);
        res.status(200);
      } catch (err) {
        res.status(404);
        res.send({ message: `jwt-token fail ${err}` });
      } finally {
        res.end();
      }
    });
    this.router.post("/register", this.userController.register);
    this.router.put("/password", this.userController.updateUserPassword);
    this.router.put("/", this.userController.updateUserProfile);
    this.router.get("/", this.userController.getUser);
  }
}

export default UserRoute;
