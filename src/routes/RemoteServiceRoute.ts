import Route from "./Route";

class RemoteServiceRoute extends Route {
  protected registerRoute() {
    this.router.post("/recogniseimages", this.recogniseImageController.recogniseImages);
    this.router.post("/generatedishes", this.generateDishController.generateDishes);
    this.router.post("/generateddishdetail", this.generateDishController.generateDishDetail);

    this.router.post("/generateDishImageBySD", this.generateImageController.generateDishImageAPIBySD);
  }
}

export default RemoteServiceRoute;
