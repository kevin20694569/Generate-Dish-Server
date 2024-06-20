interface User {
  id: string;
  name: string;
  email: string;
  password: string | null;
  image_id?: string | null;
  created_time?: string;
}
interface DishPreference {
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

interface Dish {
  id: string;
  name: string;
  cuisine: string;
  preference_id: string;
  user_id: string;
  summary: string;
  costtime: string;
  complexity: string;
  image_id: string;
  created_time?: string;
  image_url?: string;
  imageprompt: string;
  image_buffer?: string;
  image_b64_json?: string;
}

interface DishStep {
  id: string;
  step_order: number;
  description: string;
  imageprompt: string;
  image_url?: string;
  image_id: string;
  dish_id: string;
  created_time?: string;
}

interface Ingredient {
  id: string;
  order_index: number;
  name: string;
  quantity: string;
  dish_id: string;
  created_time?: string;
}

enum Complexity {
  easy = "簡單",
  normal = "普通",
  hard = "困難",
}

export { User, DishPreference, Complexity, Dish, DishStep, Ingredient };
