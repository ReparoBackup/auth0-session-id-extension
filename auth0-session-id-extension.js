async function (user, context, callback) {

  // Should only be run for verified users
  if (!user.email) {
    console.log('User not verified');
    return callback(null, user, context);
  }

  const setSessionIdForUser = async (user) => {

    const url = `https://your_api.com/setSession/${user}`;
    console.log (url);

    return new Promise ((resolve) => {

      request.post (url, {}, (err, resp, body) => {
        if (resp.statusCode !== 200) {
          console.error ('Failure');
          return callback (new Error (`Error ${resp.statusCode} from setSession: ${body || err}`));
        }

        // console.log ('Body');
        // console.log (body);

        resolve (JSON.parse(body));
      });

    });

  };

  const {sessionId} = await setSessionIdForUser(user.email);

  user.app_metadata = user.app_metadata || {};
  user.app_metadata.sessionId = sessionId;

  console.log (`${user.email} app_metadata=`);
  console.log (user.app_metadata);

  auth0.users.updateAppMetadata (user.user_id, user.app_metadata)
    .then (() => {
      console.log ('Success');

      const ns = 'https://your_domain.com/';
      context.accessToken[`${ns}app_metadata`] = user.app_metadata;

      callback (null, user, context);
    })
    .catch ((err) => {
      console.error (err);
      callback (err);
    });

}