import UserModel from "../model/MySQL/UserModel";
import DishPreferenceModel from "../model/MySQL/DishPreferenceModel";
import DishModel from "../model/MySQL/DishModel";
import StepModel from "../model/MySQL/StepModel";
import IngredientsModel from "../model/MySQL/IngredientsModel";
import EnvironmentClass from "../EnvironmentClass";
abstract class BaseController extends EnvironmentClass {
  protected userModel = new UserModel();
  protected dishPreferenceModel = new DishPreferenceModel();
  protected dishModel = new DishModel();
  protected stepModel = new StepModel();
  protected ingredientsModel = new IngredientsModel();
  constructor() {
    super();
  }
}

export default BaseController;
