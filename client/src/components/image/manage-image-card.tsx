interface IManageImageCardProps {
  userIsAdmin: boolean;
  imageLink: string;
}

const ManageImageCard: React.FC<IManageImageCardProps> = ({
  userIsAdmin,
  imageLink,
}) => {
  return (
    <>
      <div className="w-60 block">
        <img
          className="duration-200 transition shadow-xl shadow-gray-800"
          width={320}
          height={480}
          style={{ width: 245, height: 340 }}
          src={imageLink}
          alt={"cover art"}
        />
      </div>
    </>
  );
};

export default ManageImageCard;
