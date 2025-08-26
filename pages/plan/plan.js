// pages/plan/plan.js
Page({
  data: {
    currentDay: 0, // 0-6 代表周一到周日
    weeklyPlan: [] // 每周训练计划
  },
  
  onLoad() {
    // 获取今天是星期几（0是周日，转换为1-7，再转为0-6代表周一到周日）
    const today = new Date().getDay();
    const currentDay = today === 0 ? 6 : today - 1;
    
    // 加载训练计划
    this.loadTrainingPlan();
    
    this.setData({
      currentDay: currentDay
    });
  },
  
  // 加载训练计划
  loadTrainingPlan() {
    const allExercises = wx.getStorageSync('trainingPlans') || [];
    
    // 创建每周计划，每天安排不同的训练组合
    const weeklyPlan = [
      // 周一
      [
        allExercises.find(item => item.id === 1), // 直腿抬高训练
        allExercises.find(item => item.id === 4)  // 踝关节泵
      ],
      // 周二
      [
        allExercises.find(item => item.id === 2), // 屈膝训练
        allExercises.find(item => item.id === 5)  // 侧抬腿
      ],
      // 周三（轻度训练日）
      [
        allExercises.find(item => item.id === 1), // 直腿抬高训练（减少组数）
        allExercises.find(item => item.id === 4)  // 踝关节泵
      ],
      // 周四
      [
        allExercises.find(item => item.id === 3), // 靠墙静蹲
        allExercises.find(item => item.id === 5)  // 侧抬腿
      ],
      // 周五
      [
        allExercises.find(item => item.id === 1), // 直腿抬高训练
        allExercises.find(item => item.id === 2)  // 屈膝训练
      ],
      // 周六
      [
        allExercises.find(item => item.id === 3), // 靠墙静蹲
        allExercises.find(item => item.id === 4)  // 踝关节泵
      ],
      // 周日（休息/轻度活动）
      [
        {
          id: 99,
          name: "散步活动",
          description: "缓慢散步10-15分钟，以不引起明显疼痛为宜",
          sets: 1,
          reps: "10-15分钟",
          restTime: 0,
          difficulty: "初级",
          target: "整体活动度，促进血液循环",
          videoUrl: ""
        }
      ]
    ];
    
    this.setData({
      weeklyPlan: weeklyPlan
    });
  },
  
  // 切换日期
  switchDay(e) {
    const day = parseInt(e.currentTarget.dataset.day);
    this.setData({
      currentDay: day
    });
  },
  
  // 播放训练视频
  playExerciseVideo(e) {
    const exerciseId = e.currentTarget.dataset.id;
    const allExercises = wx.getStorageSync('trainingPlans') || [];
    const exercise = allExercises.find(item => item.id === exerciseId) || 
                     (exerciseId === 99 ? {name: "散步活动"} : null);
    
    if (exercise) {
      wx.showModal({
        title: '训练示范',
        content: `即将播放《${exercise.name}》的示范视频`,
        confirmText: '观看',
        cancelText: '取消',
        success(res) {
          if (res.confirm) {
            // 实际项目中这里应该跳转到视频播放页
            wx.showToast({
              title: '视频加载中...',
              icon: 'loading',
              duration: 1500
            });
          }
        }
      });
    }
  },
  
  // 前往记录训练
  goToLogExercise(e) {
    const exerciseId = e.currentTarget.dataset.id;
    // 跳转到记录页面，并携带训练ID
    wx.navigateTo({
      url: `/pages/log/log?exerciseId=${exerciseId}`
    });
  },
  
  // 获取当前日期的训练
  get currentDayExercises() {
    return this.data.weeklyPlan[this.data.currentDay] || [];
  }
});
