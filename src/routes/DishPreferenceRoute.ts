import Route from "./Route";

class DishPreferenceRoute extends Route {
  protected registerRoute(): void {
    this.router.get("/:id", this.dishPreferenceController.getUserDishPreferences);
  }
}

export default DishPreferenceRoute;
