type Product = 
  | { product_code: string; is_closed_amount: false }
  | { product_code: string; is_closed_amount: true; close_amount: number };

type DataProduct = {
  product_name: string;
  products: Product[];
};

type Gateway = {
  gateway_code: string;
  data_products?: DataProduct[];
};

export type VAProductCodes = Gateway[];