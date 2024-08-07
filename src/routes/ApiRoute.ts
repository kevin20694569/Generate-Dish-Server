import Route from "./Route";
import RemoteServiceRoute from "./RemoteServiceRoute";
import UserRoute from "./UserRoute";
import DishPreferenceRoute from "./DishPreferenceRoute";
import RecipeRoute from "./RecipeRoute";
import { nextTick } from "process";

class ApiRoute extends Route {
  protected remoteServiceRoute = new RemoteServiceRoute();
  protected userRoute = new UserRoute();
  protected dishPreferenceRoute = new DishPreferenceRoute();
  private recipeRoute = new RecipeRoute();

  protected registerRoute() {
    this.router.use("/users", (req, res, next) => {
      this.userRoute.router(req, res, next);
    });
    this.router.use("/", this.userController.verifyJwtToken);
    this.router.use("/remote", (req, res, next) => {
      this.remoteServiceRoute.router(req, res, next);
    });

    this.router.use("/preferences", (req, res, next) => {
      this.dishPreferenceRoute.router(req, res, next);
    });
    this.router.use("/recipe", (req, res, next) => {
      this.recipeRoute.router(req, res, next);
    });
  }
}

export default ApiRoute;
