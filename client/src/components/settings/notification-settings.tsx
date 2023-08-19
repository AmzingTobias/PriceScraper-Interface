import { FormEvent, useEffect, useState } from "react";
import { tUserNotificationSettings } from "../../../../server/models/notification.models";

const getNotificationSettings = (): Promise<tUserNotificationSettings> => {
  return new Promise(async (resolve, reject) => {
    try {
      const notificationSettingResponse = await fetch(
        "/api/notifications/user"
      );
      if (notificationSettingResponse.ok) {
        const notificationSettingsJson: tUserNotificationSettings =
          await notificationSettingResponse.json();
        resolve(notificationSettingsJson);
      } else {
        reject("Request failed");
      }
    } catch {
      reject("Notification request error");
    }
  });
};

const updateNotificationSettings = (
  notificationSettings: tUserNotificationSettings
): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const updateNotificationSettingsResponse = await fetch(
        "/api/notifications/user",
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            Enable: notificationSettings.Enabled,
            NoPriceChangeEnable: notificationSettings.NoPriceChangeEnabled,
          }),
        }
      );
      resolve(updateNotificationSettingsResponse.ok);
    } catch {
      reject("Update request failed");
    }
  });
};

const NotificationSettings = () => {
  const [notificationSettings, setNotificationSettings] =
    useState<tUserNotificationSettings>({
      Enabled: false,
      NoPriceChangeEnabled: false,
    });
  const [notificationsUpdated, setNotificationsUpdated] = useState<boolean>();

  useEffect(() => {
    function fetchNotificationSettings() {
      getNotificationSettings()
        .then((settings) => {
          setNotificationSettings(settings);
        })
        .catch((_err: any) => {
          setNotificationSettings({
            Enabled: false,
            NoPriceChangeEnabled: false,
          });
        });
    }
    fetchNotificationSettings();
  }, []);

  const updateNotificationSettingsForm = (event: FormEvent) => {
    event.preventDefault();
    updateNotificationSettings(notificationSettings)
      .then((updated) => {
        setNotificationsUpdated(updated);
      })
      .catch((_err) => setNotificationsUpdated(false));
  };

  return (
    <>
      <h1 className="text-2xl underline font-medium mb-2">
        Notification Settings
      </h1>
      <form onSubmit={updateNotificationSettingsForm}>
        <div className="flex flex-col">
          <div className="text-lg">
            <input
              className="bg-transparent before:bg-transparent m-1"
              type="checkbox"
              checked={notificationSettings && notificationSettings.Enabled}
              onChange={(event) => {
                setNotificationSettings((previousState) => ({
                  ...previousState,
                  Enabled: event.target.checked,
                }));
              }}
            />
            <label>Enabled</label>
          </div>
          <div className="text-lg">
            <input
              className="bg-transparent before:bg-transparent m-1"
              type="checkbox"
              checked={
                notificationSettings &&
                notificationSettings.NoPriceChangeEnabled
              }
              onChange={(event) => {
                setNotificationSettings((previousState) => ({
                  ...previousState,
                  NoPriceChangeEnabled: event.target.checked,
                }));
              }}
            />
            <label>No price change notifications</label>
            <div className="mt-2 font-semibold italic duration-75 animate-pulse">
              {notificationsUpdated !== undefined && notificationsUpdated ? (
                <p className="text-green-500">Settings updated</p>
              ) : null}
              {notificationsUpdated !== undefined &&
              notificationsUpdated === false ? (
                <p className="text-red-500">Settings failed to update</p>
              ) : null}
            </div>
            <div className="mt-4">
              <button
                className="px-8 py-1 rounded-full font-semibold uppercase
        bg-gray-800 border-green-500 border-solid border-4 text-neutral-200
        hover:shadow-fillInsideRoundedFull hover:shadow-green-500 hover:border-green-500 
        hover:duration-300 hover:transition hover:text-gray-800
        focus:border-neutral-200 focus:bg-green-500 focus:text-gray-800"
                type="submit"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default NotificationSettings;
