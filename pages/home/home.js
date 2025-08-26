// pages/home/home.js
const app = getApp();

Page({
  data: {
    userInfo: {},
    daysAfterSurgery: 0,
    currentRecord: {},
    painTrend: 0,
    romTrend: 0,
    swellingTrend: 0,
    muscleStrengthPercent: 0,
    todayTasks: [],
    tasksCompleted: 0,
    totalTasks: 0,
    dateRanges: ['近7天', '近30天', '全部'],
    selectedDateRange: 0,
    chartRecords: []
  },
  
  onLoad() {
    this.loadUserInfo();
    this.loadRecoveryRecords();
    this.loadTodayTasks();
  },
  
  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    const surgeryDate = new Date(userInfo.surgeryDate);
    const today = new Date();
    const daysAfterSurgery = Math.floor((today - surgeryDate) / (1000 * 60 * 60 * 24));
    
    this.setData({
      userInfo: userInfo,
      daysAfterSurgery: daysAfterSurgery
    });
  },
  
  // 加载康复记录
  loadRecoveryRecords() {
    const records = wx.getStorageSync('recoveryRecords') || [];
    if (records.length === 0) return;
    
    // 获取最新记录
    const currentRecord = records[records.length - 1];
    // 计算疼痛平均值
    currentRecord.pain.average = Math.round((currentRecord.pain.rest + currentRecord.pain.activity + currentRecord.pain.night) / 3);
    
    // 计算与前一天的变化趋势
    let painTrend = 0;
    let romTrend = 0;
    let swellingTrend = 0;
    
    if (records.length > 1) {
      const previousRecord = records[records.length - 2];
      painTrend = previousRecord.pain.average - currentRecord.pain.average;
      romTrend = currentRecord.rangeOfMotion.flexion - previousRecord.rangeOfMotion.flexion;
      swellingTrend = previousRecord.swelling.difference - currentRecord.swelling.difference;
    }
    
    // 计算肌力百分比
    const muscleStrengthPercent = currentRecord.muscleStrength.quadriceps * 20;
    
    // 设置图表数据
    const chartRecords = this.getChartRecords(records, this.data.selectedDateRange);
    
    this.setData({
      currentRecord: currentRecord,
      painTrend: painTrend,
      romTrend: romTrend,
      swellingTrend: swellingTrend,
      muscleStrengthPercent: muscleStrengthPercent,
      chartRecords: chartRecords
    });
  },
  
  // 根据选择的时间范围获取图表数据
  getChartRecords(allRecords, rangeIndex) {
    let recordsToShow = [...allRecords];
    
    switch(rangeIndex) {
      case 0: // 近7天
        recordsToShow = recordsToShow.slice(-7);
        break;
      case 1: // 近30天
        recordsToShow = recordsToShow.slice(-30);
        break;
      case 2: // 全部
      default:
        break;
    }
    
    return recordsToShow;
  },
  
  // 加载今日任务
  loadTodayTasks() {
    const plans = wx.getStorageSync('trainingPlans') || [];
    // 随机选择3个计划作为今日任务
    const shuffled = [...plans].sort(() => 0.5 - Math.random());
    const todayTasks = shuffled.slice(0, 3).map(plan => ({
      ...plan,
      completed: false
    }));
    
    // 检查是否有已保存的今日任务状态
    const today = new Date().toISOString().split('T')[0];
    const savedTasks = wx.getStorageSync(`tasks_${today}`);
    
    if (savedTasks) {
      this.setData({
        todayTasks: savedTasks,
        totalTasks: savedTasks.length,
        tasksCompleted: savedTasks.filter(task => task.completed).length
      });
    } else {
      this.setData({
        todayTasks: todayTasks,
        totalTasks: todayTasks.length,
        tasksCompleted: 0
      });
      // 保存初始任务状态
      wx.setStorageSync(`tasks_${today}`, todayTasks);
    }
  },
  
  // 切换任务完成状态
  toggleTaskCompletion(e) {
    const taskId = e.currentTarget.dataset.id;
    const todayTasks = [...this.data.todayTasks];
    const taskIndex = todayTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      todayTasks[taskIndex].completed = !todayTasks[taskIndex].completed;
      
      const tasksCompleted = todayTasks.filter(task => task.completed).length;
      
      this.setData({
        todayTasks: todayTasks,
        tasksCompleted: tasksCompleted
      });
      
      // 保存任务状态
      const today = new Date().toISOString().split('T')[0];
      wx.setStorageSync(`tasks_${today}`, todayTasks);
      
      // 如果所有任务都完成了，显示鼓励信息
      if (tasksCompleted === this.data.totalTasks) {
        wx.showToast({
          title: '太棒了！完成所有训练',
          icon: 'success',
          duration: 2000
        });
      }
    }
  },
  
  // 日期范围变化
  onDateRangeChange(e) {
    const selectedDateRange = e.detail.value;
    const records = wx.getStorageSync('recoveryRecords') || [];
    const chartRecords = this.getChartRecords(records, selectedDateRange);
    
    this.setData({
      selectedDateRange: selectedDateRange,
      chartRecords: chartRecords
    });
  },
  
  // 打开医生聊天
  openDoctorChat() {
    wx.showModal({
      title: '联系医生',
      content: '是否要与您的主治医生进行在线咨询？',
      confirmText: '立即咨询',
      cancelText: '稍后',
      success(res) {
        if (res.confirm) {
          wx.showToast({
            title: '正在连接医生...',
            icon: 'loading',
            duration: 1500
          });
          setTimeout(() => {
            wx.showToast({
              title: '连接成功',
              icon: 'success',
              duration: 1000
            });
          }, 1500);
        }
      }
    });
  },
  
  // 生成康复报告
  generateReport() {
    wx.showToast({
      title: '正在生成报告',
      icon: 'loading',
      duration: 2000
    });
    
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/report/report'
      });
    }, 2000);
  },
  
  // 前往设置页面
  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  }
});
