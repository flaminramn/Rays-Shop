module.exports = async function (context, req) {
  try {
    // Fetch time from a public time API
    const res = await fetch('https://worldtimeapi.org/api/timezone/America/New_York');
    const data = await res.json();
    
    // Parse the datetime from the API
    const timeString = new Date(data.datetime).toLocaleString("en-US", {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { time: timeString }
    };
  } catch (err) {
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { error: 'Failed to fetch time from server' }
    };
  }
};