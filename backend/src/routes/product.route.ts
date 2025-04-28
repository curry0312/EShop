import { Router } from "express";
import {
  createDiscountCode,
  createProduct,
  deleteDiscountCode,
  deleteProduct,
  getCategories,
  getDiscountCodes,
  getProducts,
  getSpecificDiscountCode,
} from "../controller/product.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

const productRouter = Router();

//!** Category Routes **//

productRouter.get("/get-categories", getCategories);

//!** Product Routes **//

productRouter.post("/create-product", isAuthenticated, createProduct);

productRouter.get("/get-products", isAuthenticated, getProducts);

productRouter.delete(
  "/delete-product/:productId",
  isAuthenticated,
  deleteProduct
);

//!** Discount Code Routes **//

productRouter.post("/create-discountCode", isAuthenticated, createDiscountCode);

productRouter.get("/get-discountCodes", isAuthenticated, getDiscountCodes);

productRouter.get(
  "/get-discountCode/:discountCode",
  isAuthenticated,
  getSpecificDiscountCode
);

productRouter.delete(
  "/delete-discountCode/:discountCodeId",
  isAuthenticated,
  deleteDiscountCode
);

export default productRouter;
