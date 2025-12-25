module.exports = async function (context, req) {
  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York", // Change to your timezone
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: { time: now }
  };
};
