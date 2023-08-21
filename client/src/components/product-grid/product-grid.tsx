import ProductCard, { TProductCard } from "../product-card/product-card";

interface IProductGridProps {
  product_info_list: TProductCard[];
}

const ProductGrid: React.FC<IProductGridProps> = ({ product_info_list }) => {
  return (
    <div className="">
      <div
        className="m-10 grid auto-cols-max auto-rows-min gap-6 grid-flow-dense 
      grid-cols-1
      sm:grid-cols-2
      md:grid-cols-3
      xl:grid-cols-4
      2xl:grid-cols-6
      5xl:grid-cols-8
        product-grid "
      >
        {product_info_list.map((item, index) => (
          <div className="grid-item flex justify-center row-span-1 col-span-1">
            <ProductCard key={index} product_info={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
