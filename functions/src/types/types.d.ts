import { User } from "../middlewares/authenticate";

declare module "express" {
  export interface Request {
    user?: User;
  }
}
