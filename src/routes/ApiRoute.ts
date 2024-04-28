import Route from "./Route";
import RemoteServiceRoute from "./RemoteServiceRoute";
import UserRoute from "./UserRoute";

class ApiRoute extends Route {
  protected remoteServiceRoute = new RemoteServiceRoute();
  protected userRoute = new UserRoute();

  protected registerRoute(): void {
    this.router.use("/remote", (req, res, next) => {
      this.remoteServiceRoute.router(req, res, next);
    });
    this.router.use("/users", (req, res, next) => {
      this.userRoute.router(req, res, next);
    });
  }
}

export default ApiRoute;
