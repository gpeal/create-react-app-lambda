import fetch from 'node-fetch';
const slackURL = process.env.SLACK_WEBHOOK_URL;
export function handler(event, context, callback) {
  const claims = context.clientContext && context.clientContext.user;
  console.log("User", context)
  if (!claims) {
    return callback(null, { statusCode: 401, body: "You must be signed in to call this function" });
  }
  if (event.httpMethod !== "POST") {
    return callback(null, { statusCode: 410, body: "Unsupported Request Method" });
  }
  try {
    const payload = JSON.parse(event.body);
    fetch(slackURL, {
      method: "POST",
      body: JSON.stringify({
        text: payload.text,
        attachments: [
          { "text": `From ${claims.email}` }
        ]
      })
    }).then(() => {
      callback(null, { statusCode: 204 });
    }).catch((e) => {
      callback(null, { statusCode: 500, body: "Internal Server Error: " + e });
    })
  } catch (e) {
    callback(null, { statusCode: 500, body: "Internal Server Error: " + e });
  }
}