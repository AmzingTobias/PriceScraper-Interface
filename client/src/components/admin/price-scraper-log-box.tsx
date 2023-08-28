import { useEffect, useState } from "react";

function fetchScraperLog(): Promise<string[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const logResponse = await fetch("/api/scraper/log");
      if (logResponse.ok) {
        const logJson = await logResponse.json();
        resolve(logJson);
      } else {
        reject("Error parsing as json");
      }
    } catch {
      reject("Error in request");
    }
  });
}

const PriceScraperLog = () => {
  const [logs, setLogs] = useState<string[]>([]);

  const totalTimerDuration = 20000; // 20 seconds in milliseconds
  const intervalDuration = 750; // 3/4 second in milliseconds

  const [remainingTime, setRemainingTime] = useState(totalTimerDuration);

  useEffect(() => {
    function getScraperLog() {
      fetchScraperLog()
        .then((logsFound) => {
          const amendedLogs = logsFound.map((log) => {
            log = log.replace("�", "£");
            return log;
          });
          setLogs(amendedLogs.reverse());
        })
        .catch(() => setLogs([]));
    }

    getScraperLog();

    const intervalId = setInterval(() => {
      setRemainingTime((prevRemainingTime) => {
        const newRemainingTime = prevRemainingTime - intervalDuration;

        if (newRemainingTime <= 0) {
          getScraperLog();
          // Reset the timer at the end of each loop
          return totalTimerDuration;
        } else {
          return newRemainingTime;
        }
      });
    }, intervalDuration);

    return () => clearInterval(intervalId);
  }, []);

  const hrWidth =
    100 - ((totalTimerDuration - remainingTime) / totalTimerDuration) * 100;

  return (
    <>
      <div className="bg-gray-900 p-3 h-160 overflow-y-scroll">
        <hr
          className="border-green-500 h-1 bg-green-500 mb-3"
          style={{ width: `${hrWidth}%` }}
        />
        {logs.map((log, index) => (
          <p
            key={index}
            className={`my-1 px-2 py-1 text-lg bg-gray-700 bg-opacity-30 ${
              log.startsWith("INFO", 18) ? "text-green-500" : "text-red-500"
            }`}
          >
            {log}
          </p>
        ))}
      </div>
    </>
  );
};

export default PriceScraperLog;
