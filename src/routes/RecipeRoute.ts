import Route from "./Route";

class RecipeRoute extends Route {
  protected registerRoute(): void {
    this.router.post("/recommend-recipes", this.recipeController.getRecommendRecipes);
    this.router.post("/like", this.recipeController.markAsLiked);
    this.router.get("/", this.recipeController.selectRecipesByPreferenceID);
    this.router.get("/like", this.recipeController.getLikedRecipes);
    this.router.post("/browse", this.recipeController.addRecipeToBrowsed);
    this.router.get("/browse", this.recipeController.getBrowsedRecipe);
    this.router.post("/search/like", this.recipeController.searchRecipeFromLikedRecipes);
    this.router.post("/search", this.recipeController.searchRecipes);
  }
}

export default RecipeRoute;
