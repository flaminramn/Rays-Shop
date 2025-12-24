module.exports = async function (context, req) {
  const now = new Date().toISOString();
  context.res = {
    headers: { 'Content-Type': 'application/json' },
    body: { time: now }
  };
};
