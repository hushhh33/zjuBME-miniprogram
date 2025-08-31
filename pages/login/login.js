const AV = require('../../libs/av-core-min.js');

Page({
  data: {
    username: '',
    password: '',
    showPassword: false,
    rememberMe: false,
    isDarkMode: false,
    loading: false
  },

  onLoad() {
    this.checkSystemTheme();
    this.loadSavedAccount();
    wx.onThemeChange(res => {
      this.setData({ isDarkMode: res.theme === 'dark' });
    });
  },

  checkSystemTheme() {
    wx.getSystemInfo({
      success: res => {
        this.setData({ isDarkMode: res.theme === 'dark' });
      }
    });
  },

  loadSavedAccount() {
    const saved = wx.getStorageSync('savedAccount');
    if (saved?.rememberMe) {
      this.setData({ username: saved.username, rememberMe: true });
    }
  },

  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: e.detail.value });
  },

  togglePassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  toggleRemember(e) {
    this.setData({ rememberMe: e.detail.value });
  },

  toggleTheme() {
    this.setData({ isDarkMode: !this.data.isDarkMode });
  },

  async handleLogin() {
    const { username, password, rememberMe } = this.data;
    
    if (!username || !password) {
      wx.showToast({ title: '请输入账号密码', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    try {
      // 登录逻辑
      await AV.User.logIn(username, password);
      
      // 保存账号
      if (rememberMe) {
        wx.setStorageSync('savedAccount', { username, rememberMe: true });
      } else {
        wx.removeStorageSync('savedAccount');
      }

      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/home' });
      }, 1500);
    } catch (error) {
      wx.showToast({ title: '账号或密码错误', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loginWithWechat() {
    try {
      const res = await wx.login();
      await AV.User.loginWithWeapp(res.code);
      wx.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/home/home' }), 1500);
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  }
});