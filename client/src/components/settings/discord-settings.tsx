import { FormEvent, useEffect, useState } from "react";

const getDiscordWebhookSettings = (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const discordWebhookResponse = await fetch("/api/notifications/discord");
      if (discordWebhookResponse.ok) {
        const discordWebhookJson = await discordWebhookResponse.json();
        resolve(discordWebhookJson.Webhook);
      } else {
        reject("Bad request");
      }
    } catch {
      reject("Error in request");
    }
  });
};

const deleteWebhook = (): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const discordDeletedResponse = await fetch("/api/notifications/discord", {
        method: "DELETE",
      });
      resolve(discordDeletedResponse.ok);
    } catch {
      reject("Error in request");
    }
  });
};

const createWebhook = (webhook: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const discordCreatedResponse = await fetch("/api/notifications/discord", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          Webhook: webhook,
        }),
      });
      resolve(discordCreatedResponse.ok);
    } catch {
      reject("Request failed to create webhook");
    }
  });
};

const updateWebhook = (webhook: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const discordUpdateResponse = await fetch("/api/notifications/discord", {
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          Webhook: webhook,
        }),
      });
      resolve(discordUpdateResponse.ok);
    } catch {
      reject("Request to update webhook failed");
    }
  });
};

const validateWebhook = (webhook: string): boolean => {
  const regex = /^https:\/\/discord\.com\/api\/webhooks\//;
  return regex.test(webhook);
};

const DiscordSettings = () => {
  const [webhook, setWebhook] = useState<string>();
  const [newWebhook, setNewWebhook] = useState<string>("");
  const [newWebhookWarning, setNewWebhookWarning] = useState<string>("");
  const [webhookWarning, setWebhookWarning] = useState<string>("");

  useEffect(() => {
    getDiscordWebhookSettings()
      .then((webhook) => {
        setWebhook(webhook);
      })
      .catch((_err) => {
        setWebhook(undefined);
      });
  }, []);

  const handleDeleteWebhook = (event: FormEvent) => {
    event.preventDefault();
    deleteWebhook().then((deleted) => {
      if (deleted) {
        setWebhook(undefined);
        setNewWebhook("");
      }
    });
  };

  const handleCreateWebhook = (event: FormEvent) => {
    event.preventDefault();

    if (validateWebhook(newWebhook)) {
      setNewWebhookWarning("");
      createWebhook(newWebhook)
        .then((created) => {
          if (created) {
            setWebhook(newWebhook);
          } else {
            setNewWebhookWarning("Failed to create webhook");
          }
        })
        .catch((_err) => {
          setNewWebhookWarning("Failed to create webhook");
        });
    } else {
      setNewWebhookWarning("Webhook invalid");
    }
  };

  const handleUpdateWebhook = (event: FormEvent) => {
    event.preventDefault();
    if (webhook !== undefined) {
      if (validateWebhook(webhook)) {
        updateWebhook(webhook)
          .then((updated) => {
            if (updated) {
              setWebhookWarning("");
            } else {
              setWebhookWarning("Failed to update");
            }
          })
          .catch((_err) => {
            setWebhookWarning("Failed to update");
          });
      } else {
        setWebhookWarning("Webhook invalid");
      }
    }
  };

  return (
    <>
      <div className="bg-gray-700 p-4 rounded-2xl">
        {webhook !== undefined ? (
          <>
            <input
              className="w-full bg-gray-600 box-border outline-none text-neutral-200
          hover:outline-green-500 focus:outline-green-500 rounded-2xl px-4 py-2"
              type="text"
              value={webhook}
              onChange={(event) => setWebhook(event.target.value)}
            ></input>
            <div className="flex flex-col sm:flex-row mt-5">
              <div>
                <form onSubmit={handleUpdateWebhook}>
                  <div className="flex flex-row items-center">
                    <button
                      className="px-8 py-1 rounded-full font-semibold uppercase
        bg-gray-800 border-green-500 border-solid border-4 text-neutral-200
        hover:shadow-fillInsideRoundedFull hover:shadow-green-500 hover:border-green-500 
        hover:duration-300 hover:transition hover:text-gray-800
        focus:border-neutral-200 focus:bg-green-500 focus:text-gray-800"
                    >
                      Save
                    </button>
                    <p className="font-semibold italic duration-75 animate-pulse text-red-500 ml-4">
                      {webhookWarning}
                    </p>
                  </div>
                </form>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-auto">
                <form onSubmit={handleDeleteWebhook}>
                  <button
                    className="px-8 py-1 rounded-full font-semibold uppercase
        bg-gray-800 border-red-500 border-solid border-4 text-neutral-200
        hover:shadow-fillInsideRoundedFull hover:shadow-red-500 hover:border-red-500 
        hover:duration-300 hover:transition hover:text-gray-800
        focus:border-neutral-200 focus:bg-red-500 focus:text-gray-800"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleCreateWebhook}>
              <input
                className="w-full bg-gray-600 box-border outline-none text-neutral-200
          hover:outline-green-500 focus:outline-green-500 rounded-2xl px-4 py-2"
                type="text"
                value={webhook}
                placeholder="Discord webhook"
                onChange={(event) => setNewWebhook(event.target.value)}
              ></input>
              <div className="flex flex-row mt-5 items-center">
                <button
                  className="px-8 py-1 rounded-full font-semibold uppercase
        bg-gray-800 border-green-500 border-solid border-4 text-neutral-200
        hover:shadow-fillInsideRoundedFull hover:shadow-green-500 hover:border-green-500 
        hover:duration-300 hover:transition hover:text-gray-800
        focus:border-neutral-200 focus:bg-green-500 focus:text-gray-800"
                >
                  Create Webhook
                </button>
                <p className="font-semibold italic duration-75 animate-pulse text-red-500 ml-4">
                  {newWebhookWarning}
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
};

export default DiscordSettings;
