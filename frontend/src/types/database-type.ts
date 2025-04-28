export type Images = {
    id: string;
    url: string;
    userId?: string;
    users?: Users;
    sellerId?: string;
    sellers?: Sellers;
    shopId?: string;
    shop?: Shops;
    productsId?: string;
    products?: Products;
  };
  
  export type Users = {
    id: string;
    name: string;
    email: string;
    password?: string;
    following: string[];
    avatar: Images[];
    createdAt: string;
    updatedAt: string;
    shopReviews: ShopReviews[];
  };
  
  export type Sellers = {
    id: string;
    name: string;
    email: string;
    password: string;
    phone_number: string;
    country: string;
    shop?: Shops;
    shopId?: string;
    discount_codes: DiscountCodes[];
    products: Products[];
    images: Images[];
    createdAt: string;
    updatedAt: string;
  };
  
  export type ShopReviews = {
    id: string;
    userId: string;
    users: Users;
    shopId: string;
    shop: Shops;
    ratings: number;
    review: string;
    createdAt: string;
    updatedAt: string;
  };
  
  export type Shops = {
    id: string;
    name: string;
    bio: string;
    category: string;
    address: string;
    avatar: Images[];
    coverBanner?: string;
    openingHours?: string;
    website?: string;
    ratings: number;
    reviews: ShopReviews[];
    seller: Sellers;
    sellerId: string;
    createdAt: string;
    updatedAt: string;
    products: Products[];
  };
  
  export type SiteConfig = {
    id: string;
    categories: string[];
  };
  
  export type DiscountCodes = {
    id: string;
    title: string;
    discountValue: string;
    discountCode: string;
    discountType: string;
    sellerId: string;
    seller: Sellers;
    createdAt: string;
    updatedAt: string;
    products: Products[];
  };
  
  export type Products = {
    id: string;
    title: string;
    price: string;
    category: string;
    description: string;
    tags: string[];
    stock: string;
    cash_on_delivery: string;
    custom_specifications?: any; // Prisma Json 型態，這邊用 any，如果你要更精準，可以自己定義 interface
    images: Images[];
    ratings: number;
    sellerId: string;
    seller: Sellers;
    discount_codesId?: string;
    discount_codes?: DiscountCodes;
    shopId: string;
    shop: Shops;
    createdAt: string;
    updatedAt: string;
  };
  