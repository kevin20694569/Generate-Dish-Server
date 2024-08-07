import UserModel from "../model/MySQL/UserModel";
import GeneratePreferenceModel from "../model/MySQL/GeneratePreferenceModel";
import RecipeModel from "../model/MySQL/RecipeModel";
import StepModel from "../model/MySQL/StepModel";
import IngredientsModel from "../model/MySQL/IngredientsModel";
import EnvironmentClass from "../EnvironmentClass";
import HistoryRecipeModel from "../model/MySQL/HistoryRecipeModel";
import TagModel from "../model/MySQL/TagModel";
import LikeRecipeModel from "../model/MySQL/LikeRecipeModel";
import BrowsedRecipeModel from "../model/MySQL/BrowsedRecipeModel";

abstract class BaseController extends EnvironmentClass {
  protected userModel = new UserModel();
  protected generatePreferenceModel = new GeneratePreferenceModel();
  protected recipeModel = new RecipeModel();
  protected stepModel = new StepModel();
  protected ingredientsModel = new IngredientsModel();
  protected historyRecipeModel = new HistoryRecipeModel();
  protected tagModel = new TagModel();
  protected likeReicpeModel = new LikeRecipeModel();
  protected browsedRecipeModel = new BrowsedRecipeModel();
}

export default BaseController;
