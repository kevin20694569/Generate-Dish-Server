import UserModel from "../model/MySQL/UserModel";
import DishPreferenceModel from "../model/MySQL/DishPreferenceModel";
import DishModel from "../model/MySQL/DishModel";
import StepModel from "../model/MySQL/StepModel";
import IngredientsModel from "../model/MySQL/IngredientsModel";

import MediaController from "./MediaController";
abstract class BaseController {
  protected userModel = new UserModel();
  protected dishPreferenceModel = new DishPreferenceModel();
  protected dishModel = new DishModel();
  protected stepModel = new StepModel();
  protected ingredientsModel = new IngredientsModel();
  protected imageServerPrefix = process.env.S3ImageURL;
}

export default BaseController;
