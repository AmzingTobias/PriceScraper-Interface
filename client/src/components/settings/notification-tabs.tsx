export enum ENotificationTabs {
  Discord = "Discord",
}

interface INotificationTabsProps {
  setActiveTab: React.Dispatch<React.SetStateAction<ENotificationTabs>>;
  activeTab: ENotificationTabs;
  notificationTabs: ENotificationTabs[];
}

const NotificationTabs: React.FC<INotificationTabsProps> = ({
  activeTab,
  setActiveTab,
  notificationTabs,
}) => {
  const handleTabClick = (tab: ENotificationTabs) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col sm:flex-row">
      {notificationTabs.map((tab, index) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`w-full sm:w-auto  ${
            tab === activeTab
              ? "text-green-500 cursor-default hover:no-underline"
              : "text-white bg-gray-900 hover:bg-gray-900 hover:text-green-500"
          }   text-xl  font-semibold py-3 px-5 ${
            index !== notificationTabs.length - 1
              ? "sm:border-r sm:border-neutral-200"
              : ""
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default NotificationTabs;
