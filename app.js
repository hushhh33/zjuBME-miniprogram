// app.js
App({
  onLaunch() {
    // 初始化本地存储
    this.initStorage();
    
    // 获取系统信息
    wx.getSystemInfo({
      success: res => {
        this.globalData.windowHeight = res.windowHeight;
        this.globalData.windowWidth = res.windowWidth;
      }
    });
  },
  
  // 初始化本地存储数据
  initStorage() {
    // 检查是否有用户数据
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.setStorageSync('userInfo', {
        name: "张先生",
        surgeryDate: this.calculateSurgeryDate(28), // 计算28天前的日期
        recoveryRate: 65
      });
    }
    
    // 检查是否有康复记录
    const recoveryRecords = wx.getStorageSync('recoveryRecords');
    if (!recoveryRecords) {
      wx.setStorageSync('recoveryRecords', this.generateSampleRecords());
    }
    
    // 检查是否有训练计划
    const trainingPlans = wx.getStorageSync('trainingPlans');
    if (!trainingPlans) {
      wx.setStorageSync('trainingPlans', this.generateSamplePlans());
    }
  },
  
  // 计算手术日期（几天前）
  calculateSurgeryDate(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  },
  
  // 生成示例康复记录
  generateSampleRecords() {
    const records = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      records.push({
        date: dateStr,
        pain: {
          rest: Math.floor(Math.random() * 5) + 1,
          activity: Math.floor(Math.random() * 6) + 2,
          night: Math.floor(Math.random() * 4) + 1
        },
        rangeOfMotion: {
          flexion: 100 + i * 2,
          extension: 0
        },
        muscleStrength: {
          quadriceps: 3 + Math.floor(i / 3),
          hamstring: 3 + Math.floor(i / 4)
        },
        swelling: {
          difference: 2.0 - i * 0.2
        },
        tasksCompleted: {
          total: 3,
          completed: 3 - Math.floor(i / 3)
        }
      });
    }
    
    return records;
  },
  
  // 生成示例训练计划
  generateSamplePlans() {
    return [
      {
        id: 1,
        name: "直腿抬高训练",
        description: "平躺，将腿伸直抬高至30°，保持5秒后放下",
        sets: 3,
        reps: 15,
        restTime: 60,
        difficulty: "初级",
        target: "股四头肌",
        videoUrl: ""
      },
      {
        id: 2,
        name: "屈膝训练",
        description: "坐姿或平躺，缓慢弯曲膝盖至最大角度，保持2秒后伸直",
        sets: 2,
        reps: "持续10分钟",
        restTime: 0,
        difficulty: "中级",
        target: "膝关节活动度",
        videoUrl: ""
      },
      {
        id: 3,
        name: "靠墙静蹲",
        description: "背部贴墙，双脚分开与肩同宽，缓慢下蹲至膝盖呈45°角",
        sets: 3,
        reps: "每次30秒",
        restTime: 45,
        difficulty: "中级",
        target: "大腿肌群",
        videoUrl: ""
      },
      {
        id: 4,
        name: "踝关节泵",
        description: "平躺，缓慢勾脚再绷脚，重复动作",
        sets: 2,
        reps: 20,
        restTime: 30,
        difficulty: "初级",
        target: "小腿肌肉，促进血液循环",
        videoUrl: ""
      },
      {
        id: 5,
        name: "侧抬腿",
        description: "侧卧，将上方腿保持伸直状态缓慢抬起",
        sets: 3,
        reps: 12,
        restTime: 45,
        difficulty: "初级",
        target: "髋外展肌",
        videoUrl: ""
      }
    ];
  },
  
  globalData: {
    userInfo: null,
    windowHeight: 0,
    windowWidth: 0
  }
})
