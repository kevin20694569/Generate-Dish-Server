import Route from "./Route";

class UserRoute extends Route {
  protected registerRoute() {
    this.router.post("/login", this.userController.login);
    this.router.post("/register", this.userController.register);
    this.router.put("/password", this.userController.updateUserPassword);
    this.router.put("/", this.userController.updateUserProfile);
    this.router.get("/", this.userController.getUser);
  }
}

export default UserRoute;
