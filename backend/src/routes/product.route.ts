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
import { isSellerAuthenticated } from "../middleware/isAuthenticated";

const productRouter = Router();

//!** Category Routes **//

productRouter.get("/get-categories", isSellerAuthenticated ,getCategories);

//!** Product Routes **//

productRouter.post("/create-product", isSellerAuthenticated, createProduct);

productRouter.get("/get-products", isSellerAuthenticated, getProducts);

productRouter.delete(
  "/delete-product/:productId",
  isSellerAuthenticated,
  deleteProduct
);

//!** Discount Code Routes **//

productRouter.post("/create-discountCode", isSellerAuthenticated, createDiscountCode);

productRouter.get("/get-discountCodes", isSellerAuthenticated, getDiscountCodes);

productRouter.get(
  "/get-discountCode/:discountCode",
  isSellerAuthenticated,
  getSpecificDiscountCode
);

productRouter.delete(
  "/delete-discountCode/:discountCodeId",
  isSellerAuthenticated,
  deleteDiscountCode
);

export default productRouter;
