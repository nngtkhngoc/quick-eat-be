import foodRouter from "./foodRouter.js";

export const routes = (app) => {
  app.use("/api/food", foodRouter);
};
