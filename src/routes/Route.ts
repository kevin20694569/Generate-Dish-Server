import { Router } from "express";
import RecogniseImageController from "../controller/RecogniseImageController";
import GenerateDishController from "../controller/GenerateDishController";

import GenerateImageController from "../controller/GenerateImageController";
import DishPreferenceController from "../controller/DishPreferenceController";
import DishController from "../controller/DishController";
import UserController from "../controller/UserController";
import RecipeController from "../controller/RecipeController";

class Route {
  public router: Router = Router();
  protected recogniseImageController = new RecogniseImageController();
  protected generateDishController = new GenerateDishController();
  protected generateImageController = new GenerateImageController();
  protected dishPreferenceController = new DishPreferenceController();
  protected userController = new UserController();
  protected dishController = new DishController();
  protected recipeController = new RecipeController();
  constructor() {
    this.initial();
  }

  protected initial() {
    this.router = Router();
    this.registerRoute();
  }
  protected registerRoute() {}
}

export default Route;
