function setToken(key, value) {
  localStorage.setItem(key, value.replace(/"/g, ""));
}

function getToken(key) {
  return localStorage.getItem(key);
}

export { setToken, getToken };
