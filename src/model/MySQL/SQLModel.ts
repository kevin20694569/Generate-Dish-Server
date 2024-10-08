interface User {
  id: string;
  name: string;
  email: string;
  password: string | null;
  image_id?: string | null;
  created_time?: string;
}
interface Generate_Preference {
  id: string;
  user_id: string;
  quantity: string;
  cuisine: string;
  excluded_food: string;
  referenced_in_history?: boolean;
  complexity: string;
  timelimit: string;
  equipments: string;
  temperature: number;
  additional_text: string;
  created_time?: string;
}

interface Recipe {
  id: string;
  title: string;
  recipe_id: string;
  image_url: string;
  url: string;
  description: string;
  like_count: number;
  costtime: number;
  quantity: number;

  liked?: boolean;
}

interface LikeRecipe {
  user_id: string;
  recipe_id: string;
  created_time: string;
}

class HistoryRecipe {
  user_id: string;
  recipe_id: string;
  generate_preference_id: string;
  history_order: number;
  created_time: string | undefined;

  constructor(user_id: string, recipe_id: string, generate_preference_id: string, history_order: number, created_time?: string) {
    this.user_id = user_id;
    this.recipe_id = recipe_id;
    this.generate_preference_id = generate_preference_id;
    this.history_order = history_order;
    this.created_time = created_time;
  }
}

interface Step {
  recipe_id: string;
  order: number;
  description: string;
  image_url?: string;
}

interface Ingredient {
  recipe_id: string;
  order: number;
  name: string;
  quantity: string;
}

interface Tag {
  order: number;
  title: string;
  recipe_id: string;
}

enum Complexity {
  easy = "簡單",
  normal = "普通",
  hard = "困難",
}

export { User, Generate_Preference, Complexity, Recipe, Step, Ingredient, Tag, HistoryRecipe, LikeRecipe };
