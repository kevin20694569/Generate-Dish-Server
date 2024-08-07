abstract class EnvironmentClass {
  protected imageServerPrefix = process.env.S3ImageURL;
  protected dishImageServerPrefix = this.imageServerPrefix + "/dish-image";
  protected stepImageServerPrefix = this.imageServerPrefix + "/step-image";
  protected userImageServerPrefix = this.imageServerPrefix + "/user-image";
  protected recognizedServerPrefix = this.imageServerPrefix + "/recognized-image";
  protected recommend_recipe_url_prefix = process.env.recommend_recipe_url_prefix;
}

export default EnvironmentClass;
