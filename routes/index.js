import foodRouter from "./foodRouter.js";
import categoryRouter from "./categoryRouter.js";
import brandRouter from "./brandRouter.js";
import tagRouter from "./tagRouter.js";
import cookRouter from "./cookRouter.js";
import userRouter from "./userRouter.js";
import cartRouter from "./cartRouter.js";
import oAuthRouter from "./oAuthRouter.js";

export const routes = (app) => {
  app.use("/api/food", foodRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/tags", tagRouter);
  app.use("/api/brands", brandRouter);
  app.use("/api/cook", cookRouter);
  app.use("/api/users", userRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/oauth", oAuthRouter);
};
