import ManageImageCard from "../../components/image/manage-image-card";

interface IManageImagesPageProps {
  userIsAdmin: boolean;
}

const ManageImagesPage: React.FC<IManageImagesPageProps> = ({
  userIsAdmin,
}) => {
  if (!userIsAdmin) {
    return <></>;
  }
  return (
    <>
      <div className="flex flex-col items-center">
        <div className="w-11/12 xl:w-4/5 2xl:w-3/5 mt-8">
          <div className="text-neutral-200 bg-gray-800 flex flex-col rounded-2xl px-2 py-4 lg:p-4">
            <h1 className="text-3xl underline font-bold">Manage Images</h1>
            <ManageImageCard
              imageLink={"/uploads/5723ccd45ff8e68c398c084c8cd13c51"}
              userIsAdmin={userIsAdmin}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageImagesPage;
