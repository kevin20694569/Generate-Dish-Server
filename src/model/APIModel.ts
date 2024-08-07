interface ImageObject {
  index: number;
  url: string;
}
interface OpenAiDishJsonResponse {
  name: string;
  cuisine: string;
  summary: string;
  costtime: string;

  complexity: string;
  image_url?: string;
  imageprompt: string;
}
interface StepResponse {
  description: string;
  imageurl: string;
}

export { ImageObject, OpenAiDishJsonResponse, StepResponse };
