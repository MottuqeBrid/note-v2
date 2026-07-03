function setToken(key, value) {
  localStorage.setItem(key, value.replace(/"/g, ""));
}

function getToken(key) {
  const token = localStorage.getItem(key);
  if (!token) {
    const token = sessionStorage.getItem(key);
    return token;
  }
  return token;
}

export { setToken, getToken };
