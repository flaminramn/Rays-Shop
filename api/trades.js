let trades = []; // This is temporary and resets on each deployment

module.exports = async function (context, req) {
  if (req.method === "POST") {
    const { symbol, type, strikes, expiration, premium, status } = req.body;

    if (!symbol || !type || !strikes || !expiration || !premium || !status) {
      context.res = {
        status: 400,
        body: { error: "Missing trade fields." }
      };
      return;
    }

    trades.push({ symbol, type, strikes, expiration, premium, status });
    context.res = {
      status: 200,
      body: { message: "Trade added", trades }
    };
  } else if (req.method === "GET") {
    context.res = {
      status: 200,
      body: trades
    };
  } else {
    context.res = {
      status: 405,
      body: "Method not allowed"
    };
  }
};
