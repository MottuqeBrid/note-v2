function setToken(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getToken(key) {
  return localStorage.getItem(key);
}

export { setToken, getToken };
