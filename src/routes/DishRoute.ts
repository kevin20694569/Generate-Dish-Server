import Route from "./Route";

class DishRoute extends Route {
  protected registerRoute(): void {
    this.router.get("/:id", this.dishController.selectDishDetail);
  }
}

export default DishRoute;
