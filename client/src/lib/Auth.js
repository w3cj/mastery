import API from './API';

class Auth {
  constructor() {
    this.AUTH_URL = 'http://localhost:3000/auth/mastery/github';
    this.currentUser = null;
    this.currentToken = undefined;
  }
  loginRedirect() {
    window.location = this.AUTH_URL;
  }
  isLoggedIn() {
    return this.getCurrentUser() == null ? false : true;
  }
  callbackLogin(cookie) {
    let token = cookie.get('x-auth-token');
    if(token) {
      localStorage.token = token;
      cookie.delete('x-auth-token');
    }
    return API
      .getExchange()
      .then(result => {
        localStorage.token = result.token;
      })
  }
  getCurrentUser() {
    const localStorageToken = localStorage.getItem('token');
    if (localStorageToken && this.currentToken != localStorageToken) {
      this.currentToken = localStorageToken;
      const payload = localStorage.getItem('token').split('.')[1].replace('-', '+').replace('_', '/');
      this.currentUser = JSON.parse(atob(payload));
      return this.currentUser;
    } else if (!localStorageToken) {
      return null;
    } else {
      return this.currentUser;
    }
  }
  logout() {
    this.currentToken = undefined;
    this.currentUser = null;
    localStorage.removeItem('token');
  }
}

export default new Auth();
