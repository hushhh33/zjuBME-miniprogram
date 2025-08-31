const app = getApp();
const AV = require('../../libs/av-core-min.js');

Page({
  data: {
    formData: {
      phoneOrEmail: '',
      verificationCode: '',
      password: '',
      confirmPassword: ''
    },
    showPassword: false,
    showConfirmPassword: false,
    countdown: 0,
    isDarkMode: false,
    timer: null
  },

  onLoad() {
    // 检查系统主题
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      isDarkMode: systemInfo.theme === 'dark'
    });
    
    wx.onThemeChange((result) => {
      this.setData({
        isDarkMode: result.theme === 'dark'
      });
    });
  },

  onUnload() {
    // 清除定时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  },

  handleInput(e) {
    const { name, value } = e.detail;
    this.setData({
      [`formData.${name}`]: value
    });
  },

  togglePasswordVisibility(e) {
    const target = e.currentTarget.dataset.target;
    this.setData({
      [`show${target.charAt(0).toUpperCase() + target.slice(1)}`]: 
        !this.data[`show${target.charAt(0).toUpperCase() + target.slice(1)}`]
    });
  },

  getVerificationCode() {
    const { phoneOrEmail } = this.data.formData;
    
    if (!phoneOrEmail) {
      wx.showToast({ title: '请输入手机号或邮箱', icon: 'none' });
      return;
    }

    const isPhone = /^1[3-9]\d{9}$/.test(phoneOrEmail);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phoneOrEmail);
    
    if (!isPhone && !isEmail) {
      wx.showToast({ title: '格式错误', icon: 'none' });
      return;
    }

    // 发送验证码逻辑（实际项目需对接后端）
    this.startCountdown();
    wx.showToast({ title: '验证码已发送', icon: 'success' });
  },

  startCountdown() {
    let countdown = 60;
    this.setData({ countdown });
    
    const timer = setInterval(() => {
      countdown--;
      this.setData({ countdown });
      if (countdown <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    this.setData({ timer });
  },

  async handleSubmit() {
    const { phoneOrEmail, verificationCode, password, confirmPassword } = this.data.formData;
    
    // 表单验证
    if (!phoneOrEmail || !verificationCode || !password || !confirmPassword) {
      wx.showToast({ title: '请完善信息', icon: 'none' });
      return;
    }

    if (password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' });
      return;
    }

    if (password !== confirmPassword) {
      wx.showToast({ title: '密码不一致', icon: 'none' });
      return;
    }

    try {
      // 注册逻辑（使用LeanCloud示例）
      await AV.User.signUp(phoneOrEmail, password, {
        email: isEmail ? phoneOrEmail : '',
        mobilePhoneNumber: isPhone ? phoneOrEmail : ''
      });

      wx.showToast({ title: '注册成功', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/home' });
      }, 1500);
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  },

  toggleTheme() {
    this.setData({ isDarkMode: !this.data.isDarkMode });
  },

  navigateBack() {
    wx.navigateBack();
  },

  async registerWithWechat() {
    try {
      const res = await wx.login();
      const user = await AV.User.loginWithWeapp(res.code);
      wx.showToast({ title: '微信注册成功', icon: 'success' });
      setTimeout(() => wx.switchTab({ url: '/pages/home/home' }), 1500);
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  }
});