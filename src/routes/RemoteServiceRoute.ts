import Route from "./Route";

class RemoteServiceRoute extends Route {
  protected registerRoute(): void {
    this.router.post("/recogniseimages", this.recogniseImageController.recogniseImages);
    this.router.post("/generatedishes", this.generateDishController.generateDishes);
    this.router.post("/generateddishdetail", this.generateDishController.generateDishDetail);
  }
}

export default RemoteServiceRoute;
