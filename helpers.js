// Helper functions
function generateRandomString() {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = '';
  for (let i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

function checkIfRegistered(email, users) {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user].id;
    }
  } return false;
}

function urlsForUser(id, urlDatabase) {
  let userDataBaseURLs = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userDataBaseURLs[url] = urlDatabase[url];
    }
  }
  return userDataBaseURLs;
}

module.exports = { generateRandomString, checkIfRegistered, urlsForUser }