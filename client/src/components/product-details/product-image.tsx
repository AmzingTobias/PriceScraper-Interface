interface IProductImageProps {
  imageLink: string;
  width: number;
  height: number;
  alt: string;
}

const ProductImage: React.FC<IProductImageProps> = ({
  imageLink,
  width,
  height,
  alt,
}) => {
  return (
    <>
      <img
        src={imageLink}
        width={width}
        height={height}
        alt={alt}
        style={{ width: width, height: height, maxWidth: width }}
      />
    </>
  );
};

export default ProductImage;
