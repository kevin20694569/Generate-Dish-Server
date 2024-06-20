import Route from "./Route";

class DishRoute extends Route {
  protected registerRoute(): void {
    this.router.get("/:id", this.dishController.selectDishDetail);
    this.router.get("/byuserid/:id", this.dishController.selectDishesByUserID);
  }
}

export default DishRoute;
