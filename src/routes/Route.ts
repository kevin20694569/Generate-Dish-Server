import { Router } from "express";
import RecogniseImageController from "../controller/RecogniseImageController";
import GenerateDishController from "../controller/GenerateDishController";

import GenerateImageController from "../controller/GenerateImageController";
import UserController from "../controller/UserController";

class Route {
  public router = Router();
  protected recogniseImageController = new RecogniseImageController();
  protected generateDishController = new GenerateDishController();
  protected generateImageController = new GenerateImageController();
  protected userController = new UserController();
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
