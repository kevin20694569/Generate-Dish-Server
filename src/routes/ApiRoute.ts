import Route from "./Route";
import RemoteServiceRoute from "./RemoteServiceRoute";
import UserRoute from "./UserRoute";
import DishPreferenceRoute from "./DishPreferenceRoute";
import DishRoute from "./DishRoute";

class ApiRoute extends Route {
  protected remoteServiceRoute = new RemoteServiceRoute();
  protected userRoute = new UserRoute();
  protected dishPreferenceRoute = new DishPreferenceRoute();
  protected dishRoute = new DishRoute();

  protected registerRoute() {
    this.router.use("/remote", (req, res, next) => {
      this.remoteServiceRoute.router(req, res, next);
    });
    this.router.use("/users", (req, res, next) => {
      this.userRoute.router(req, res, next);
    });
    this.router.use("/preferences", (req, res, next) => {
      this.dishPreferenceRoute.router(req, res, next);
    });
    this.router.use("/dishes", (req, res, next) => {
      this.dishRoute.router(req, res, next);
    });
  }
}

export default ApiRoute;
