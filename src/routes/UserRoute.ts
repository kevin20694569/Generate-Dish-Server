import Route from "./Route";

class UserRoute extends Route {
  protected registerRoute() {
    this.router.post("/login", this.userController.login);
    this.router.post("/register", this.userController.register);
  }
}

export default UserRoute;
