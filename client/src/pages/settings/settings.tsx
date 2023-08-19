import { useEffect, useState } from "react";
import { TUserDetails } from "../../../../server/models/user.models";
import LogoutBtn from "../../components/settings/logout-btn";
import NotificationSettings from "../../components/settings/notification-settings";
import NotificationTabs, {
  ENotificationTabs,
} from "../../components/settings/notification-tabs";
import DiscordSettings from "../../components/settings/discord-settings";

interface ISettingsPageProps {
  setUserAuthToken: React.Dispatch<React.SetStateAction<string>>;
  authToken: string;
}

function getUserAccount(): Promise<TUserDetails> {
  return new Promise(async (resolve, reject) => {
    try {
      const usernameResponse = await fetch("/api/users");
      if (usernameResponse.ok) {
        const usernameJson: TUserDetails = await usernameResponse.json();
        resolve(usernameJson);
      } else {
        reject("Token invalid");
      }
    } catch {
      reject("Username request failed");
    }
  });
}

const SettingsPage: React.FC<ISettingsPageProps> = ({
  authToken,
  setUserAuthToken,
}) => {
  const [userAccount, setUserAccount] = useState<TUserDetails>();
  useEffect(() => {
    const fetchUserDetails = () => {
      getUserAccount()
        .then((userDetails) => setUserAccount(userDetails))
        .catch(() => setUserAccount(undefined));
    };
    fetchUserDetails();
  }, []);

  const [activeNotificationTab, setActiveNotificationTab] = useState(
    ENotificationTabs.Discord
  );

  const notificationTabs: ENotificationTabs[] = [ENotificationTabs.Discord];

  return (
    <>
      <div className="flex flex-col items-center">
        <div
          className="
              w-11/12
              xl:w-4/5
              2xl:w-3/5
              mt-8"
        >
          <div
            className="text-neutral-200 bg-gray-800 
      flex flex-col rounded-2xl px-2 py-4 lg:p-4"
          >
            <div className="flex flex-row items-center">
              <div>
                <h1 className="text-3xl underline font-bold">
                  Settings: {userAccount ? userAccount?.Username : ""}
                </h1>
              </div>
              <div className="ml-auto">
                <LogoutBtn setUserAuthToken={setUserAuthToken} />
              </div>
            </div>
            <hr className="my-4" />
            <div>
              <NotificationSettings />
            </div>
            <hr className="my-4" />
            <div>
              <NotificationTabs
                notificationTabs={notificationTabs}
                activeTab={activeNotificationTab}
                setActiveTab={setActiveNotificationTab}
              />
            </div>
            <div>
              {activeNotificationTab === ENotificationTabs.Discord ? (
                <DiscordSettings />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
