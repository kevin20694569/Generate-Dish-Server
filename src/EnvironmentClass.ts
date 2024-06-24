abstract class EnvironmentClass {
  protected imageServerPrefix = process.env.S3ImageURL;
  protected dishImageServerPrefix = this.imageServerPrefix + "/dish-image";
  protected stepImageServerPrefix = this.imageServerPrefix + "/step-image";
  protected userImageServerPrefix = this.imageServerPrefix + "/user-image";
}

export default EnvironmentClass;
