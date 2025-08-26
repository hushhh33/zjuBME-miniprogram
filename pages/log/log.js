// pages/log/log.js
Page({
  data: {
    currentTab: 'pain',
    
    // 疼痛记录数据
    restPain: 0,
    activityPain: 0,
    nightPain: 0,
    medicineName: '',
    medicineDose: '',
    medicineTime: '',
    painDescription: '',
    
    // 活动度记录数据
    flexionAngle: 0,
    extensionAngle: 0,
    romDescription: '',
    flexionPhotoUrl: '',
    extensionPhotoUrl: '',
    
    // 肌力记录数据
    quadricepsStrength: 3,
    hamstringStrength: 3,
    trainingTypes: []
  },
  
  onLoad() {
    // 加载最新的记录数据作为初始值
    this.loadLatestRecords();
  },
  
  // 加载最新的记录数据
  loadLatestRecords() {
    const records = wx.getStorageSync('recoveryRecords') || [];
    if (records.length === 0) return;
    
    const latestRecord = records[records.length - 1];
    
    // 设置疼痛记录初始值
    this.setData({
      restPain: latestRecord.pain.rest || 0,
      activityPain: latestRecord.pain.activity || 0,
      nightPain: latestRecord.pain.night || 0
    });
    
    // 设置活动度初始值
    if (latestRecord.rangeOfMotion) {
      this.setData({
        flexionAngle: latestRecord.rangeOfMotion.flexion || 0,
        extensionAngle: latestRecord.rangeOfMotion.extension || 0
      });
    }
    
    // 设置肌力初始值
    if (latestRecord.muscleStrength) {
      this.setData({
        quadricepsStrength: latestRecord.muscleStrength.quadriceps || 3,
        hamstringStrength: latestRecord.muscleStrength.hamstring || 3
      });
    }
  },
  
  // 切换标签页
  switchTab(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.tab
    });
  },
  
  // 疼痛记录相关方法
  onRestPainChange(e) {
    this.setData({
      restPain: e.detail.value
    });
  },
  
  onActivityPainChange(e) {
    this.setData({
      activityPain: e.detail.value
    });
  },
  
  onNightPainChange(e) {
    this.setData({
      nightPain: e.detail.value
    });
  },
  
  onMedicineNameChange(e) {
    this.setData({
      medicineName: e.detail.value
    });
  },
  
  onMedicineDoseChange(e) {
    this.setData({
      medicineDose: e.detail.value
    });
  },
  
  onMedicineTimeChange(e) {
    this.setData({
      medicineTime: e.detail.value
    });
  },
  
  onPainDescriptionChange(e) {
    this.setData({
      painDescription: e.detail.value
    });
  },
  
  // 活动度记录相关方法
  onFlexionAngleChange(e) {
    this.setData({
      flexionAngle: e.detail.value
    });
  },
  
  onExtensionAngleChange(e) {
    this.setData({
      extensionAngle: e.detail.value
    });
  },
  
  onRomDescriptionChange(e) {
    this.setData({
      romDescription: e.detail.value
    });
  },
  
  uploadFlexionPhoto() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // 临时文件路径
        const tempFilePath = res.tempFilePaths[0];
        that.setData({
          flexionPhotoUrl: tempFilePath
        });
      }
    });
  },
  
  uploadExtensionPhoto() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // 临时文件路径
        const tempFilePath = res.tempFilePaths[0];
        that.setData({
          extensionPhotoUrl: tempFilePath
        });
      }
    });
  },
  
  // 肌力记录相关方法
  onQuadricepsStrengthChange(e) {
    this.setData({
      quadricepsStrength: e.detail.value
    });
  },
  
  onHamstringStrengthChange(e) {
    this.setData({
      hamstringStrength: e.detail.value
    });
  },
  
  onTrainingChange(e) {
    const value = e.detail.value;
    const trainingTypes = [...this.data.trainingTypes];
    
    if (e.detail.checked) {
      // 添加选中的训练类型
      trainingTypes.push(value);
    } else {
      // 移除取消选中的训练类型
      const index = trainingTypes.indexOf(value);
      if (index !== -1) {
        trainingTypes.splice(index, 1);
      }
    }
    
    this.setData({
      trainingTypes: trainingTypes
    });
  },
  
  // 保存疼痛记录
  savePainRecord() {
    const today = new Date().toISOString().split('T')[0];
    const records = wx.getStorageSync('recoveryRecords') || [];
    
    // 查找今天的记录
    let todayRecordIndex = records.findIndex(record => record.date === today);
    
    if (todayRecordIndex !== -1) {
      // 更新今天的记录
      records[todayRecordIndex].pain = {
        rest: this.data.restPain,
        activity: this.data.activityPain,
        night: this.data.nightPain,
        average: Math.round((this.data.restPain + this.data.activityPain + this.data.nightPain) / 3),
        description: this.data.painDescription,
        medicine: {
          name: this.data.medicineName,
          dose: this.data.medicineDose,
          time: this.data.medicineTime
        }
      };
    } else {
      // 创建新记录
      const newRecord = {
        date: today,
        pain: {
          rest: this.data.restPain,
          activity: this.data.activityPain,
          night: this.data.nightPain,
          average: Math.round((this.data.restPain + this.data.activityPain + this.data.nightPain) / 3),
          description: this.data.painDescription,
          medicine: {
            name: this.data.medicineName,
            dose: this.data.medicineDose,
            time: this.data.medicineTime
          }
        },
        rangeOfMotion: {
          flexion: this.data.flexionAngle,
          extension: this.data.extensionAngle
        },
        muscleStrength: {
          quadriceps: this.data.quadricepsStrength,
          hamstring: this.data.hamstringStrength
        },
        swelling: {
          difference: 0 // 默认为0，等待用户填写
        },
        tasksCompleted: {
          total: 3,
          completed: 0
        }
      };
      
      records.push(newRecord);
    }
    
    // 保存记录
    wx.setStorageSync('recoveryRecords', records);
    
    // 显示成功提示
    wx.showToast({
      title: '疼痛记录已保存',
      icon: 'success',
      duration: 2000
    });
    
    // 返回首页
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      });
    }, 2000);
  },
  
  // 保存活动度记录
  saveRomRecord() {
    const today = new Date().toISOString().split('T')[0];
    const records = wx.getStorageSync('recoveryRecords') || [];
    
    // 查找今天的记录
    let todayRecordIndex = records.findIndex(record => record.date === today);
    
    if (todayRecordIndex !== -1) {
      // 更新今天的记录
      records[todayRecordIndex].rangeOfMotion = {
        flexion: this.data.flexionAngle,
        extension: this.data.extensionAngle,
        description: this.data.romDescription
      };
    } else {
      // 创建新记录
      const newRecord = {
        date: today,
        pain: {
          rest: 0,
          activity: 0,
          night: 0,
          average: 0,
          description: '',
          medicine: {}
        },
        rangeOfMotion: {
          flexion: this.data.flexionAngle,
          extension: this.data.extensionAngle,
          description: this.data.romDescription
        },
        muscleStrength: {
          quadriceps: this.data.quadricepsStrength,
          hamstring: this.data.hamstringStrength
        },
        swelling: {
          difference: 0
        },
        tasksCompleted: {
          total: 3,
          completed: 0
        }
      };
      
      records.push(newRecord);
    }
    
    // 保存记录
    wx.setStorageSync('recoveryRecords', records);
    
    // 显示成功提示
    wx.showToast({
      title: '活动度记录已保存',
      icon: 'success',
      duration: 2000
    });
    
    // 返回首页
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      });
    }, 2000);
  },
  
  // 保存肌力记录
  saveMuscleRecord() {
    const today = new Date().toISOString().split('T')[0];
    const records = wx.getStorageSync('recoveryRecords') || [];
    
    // 查找今天的记录
    let todayRecordIndex = records.findIndex(record => record.date === today);
    
    if (todayRecordIndex !== -1) {
      // 更新今天的记录
      records[todayRecordIndex].muscleStrength = {
        quadriceps: this.data.quadricepsStrength,
        hamstring: this.data.hamstringStrength,
        trainingTypes: this.data.trainingTypes
      };
    } else {
      // 创建新记录
      const newRecord = {
        date: today,
        pain: {
          rest: 0,
          activity: 0,
          night: 0,
          average: 0,
          description: '',
          medicine: {}
        },
        rangeOfMotion: {
          flexion: 0,
          extension: 0,
          description: ''
        },
        muscleStrength: {
          quadriceps: this.data.quadricepsStrength,
          hamstring: this.data.hamstringStrength,
          trainingTypes: this.data.trainingTypes
        },
        swelling: {
          difference: 0
        },
        tasksCompleted: {
          total: 3,
          completed: 0
        }
      };
      
      records.push(newRecord);
    }
    
    // 保存记录
    wx.setStorageSync('recoveryRecords', records);
    
    // 显示成功提示
    wx.showToast({
      title: '肌力记录已保存',
      icon: 'success',
      duration: 2000
    });
    
    // 返回首页
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      });
    }, 2000);
  }
});
