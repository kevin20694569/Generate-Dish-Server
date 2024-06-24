import Route from "./Route";

class StdRoute extends Route {
  protected registerRoute() {
    this.router.post("/generateDishImageBySD", this.generateImageController.generateDishImageAPIBySD);
  }
}

export default StdRoute;
