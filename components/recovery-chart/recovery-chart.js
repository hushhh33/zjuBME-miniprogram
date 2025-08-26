// components/recovery-chart/recovery-chart.js
Component({
  properties: {
    records: {
      type: Array,
      value: [],
      observer: function(newVal) {
        // 当数据变化时重新绘制图表
        if (newVal && newVal.length > 0) {
          this.initChart();
        }
      }
    }
  },
  
  data: {},
  
  ready() {
    // 组件准备就绪时初始化图表
    if (this.properties.records && this.properties.records.length > 0) {
      this.initChart();
    }
  },
  
  methods: {
    // 初始化图表
    initChart() {
      const records = this.properties.records;
      if (!records || records.length === 0) return;
      
      // 获取canvas上下文
      const ctx = wx.createCanvasContext('recoveryChart', this);
      
      // 获取canvas尺寸（使用组件的宽高）
      const query = wx.createSelectorQuery().in(this);
      query.select('.chart-container').boundingClientRect(rect => {
        const width = rect.width;
        const height = rect.height;
        
        // 绘制图表
        this.drawChart(ctx, records, width, height);
      }).exec();
    },
    
    // 绘制图表
    drawChart(ctx, records, width, height) {
      // 图表边距
      const margin = { top: 30, right: 20, bottom: 40, left: 40 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;
      
      // 清除画布
      ctx.clearRect(0, 0, width, height);
      
      // 准备数据
      const dates = records.map(record => {
        const date = new Date(record.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });
      
      const painData = records.map(record => record.pain ? record.pain.average : 0);
      const romData = records.map(record => record.rangeOfMotion ? record.rangeOfMotion.flexion : 0);
      const muscleData = records.map(record => record.muscleStrength ? record.muscleStrength.quadriceps : 0);
      
      // 获取各数据范围
      const maxPain = Math.max(...painData, 10); // 疼痛最大10分
      const maxRom = Math.max(...romData, 150);  // 活动度最大150度
      const maxMuscle = Math.max(...muscleData, 5); // 肌力最大5级
      
      // 绘制坐标轴
      this.drawAxes(ctx, margin, chartWidth, chartHeight, dates, maxPain, maxRom, maxMuscle);
      
      // 绘制网格线
      this.drawGrid(ctx, margin, chartWidth, chartHeight, dates.length - 1, maxPain, maxRom, maxMuscle);
      
      // 绘制数据曲线
      this.drawLine(ctx, margin, chartWidth, chartHeight, painData, maxPain, '#FF6B6B'); // 疼痛曲线
      this.drawLine(ctx, margin, chartWidth, chartHeight, romData, maxRom, '#4A90E2');   // 活动度曲线
      this.drawLine(ctx, margin, chartWidth, chartHeight, muscleData, maxMuscle, '#4CD964'); // 肌力曲线
      
      // 绘制数据点
      this.drawPoints(ctx, margin, chartWidth, chartHeight, painData, maxPain, '#FF6B6B');
      this.drawPoints(ctx, margin, chartWidth, chartHeight, romData, maxRom, '#4A90E2');
      this.drawPoints(ctx, margin, chartWidth, chartHeight, muscleData, maxMuscle, '#4CD964');
      
      // 绘制完成
      ctx.draw();
    },
    
    // 绘制坐标轴
    drawAxes(ctx, margin, width, height, dates, maxPain, maxRom, maxMuscle) {
      // X轴和Y轴
      ctx.beginPath();
      ctx.setStrokeStyle('#E5E5EA');
      ctx.setLineWidth(1);
      
      // X轴
      ctx.moveTo(margin.left, margin.top + height);
      ctx.lineTo(margin.left + width, margin.top + height);
      
      // Y轴（左侧，疼痛和肌力）
      ctx.moveTo(margin.left, margin.top);
      ctx.lineTo(margin.left, margin.top + height);
      
      // Y轴（右侧，活动度）
      ctx.moveTo(margin.left + width, margin.top);
      ctx.lineTo(margin.left + width, margin.top + height);
      
      ctx.stroke();
      
      // 绘制X轴标签（日期）
      const xStep = width / (dates.length - 1 || 1);
      dates.forEach((date, i) => {
        const x = margin.left + i * xStep;
        ctx.fillStyle = '#6E6E73';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(date, x, margin.top + height + 5);
      });
      
      // 绘制左侧Y轴标签（疼痛和肌力）
      const yStepPain = height / 5; // 5个刻度
      for (let i = 0; i <= 5; i++) {
        const y = margin.top + height - i * yStepPain;
        const painValue = Math.round((i * yStepPain / height) * maxPain);
        const muscleValue = Math.round((i * yStepPain / height) * maxMuscle);
        
        // 网格线
        ctx.beginPath();
        ctx.setStrokeStyle('#F0F0F0');
        ctx.setLineWidth(1);
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + width, y);
        ctx.stroke();
        
        // 疼痛值标签
        ctx.fillStyle = '#FF6B6B';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(painValue, margin.left - 5, y);
        
        // 肌力值标签
        ctx.fillStyle = '#4CD964';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(muscleValue, margin.left + 5, y);
      }
      
      // 绘制右侧Y轴标签（活动度）
      const yStepRom = height / 5; // 5个刻度
      for (let i = 0; i <= 5; i++) {
        const y = margin.top + height - i * yStepRom;
        const romValue = Math.round((i * yStepRom / height) * maxRom);
        
        ctx.fillStyle = '#4A90E2';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(romValue, margin.left + width + 5, y);
      }
    },
    
    // 绘制网格线
    drawGrid(ctx, margin, width, height, xCount, maxPain, maxRom, maxMuscle) {
      // 垂直网格线
      const xStep = width / xCount;
      for (let i = 1; i < xCount; i++) {
        const x = margin.left + i * xStep;
        
        ctx.beginPath();
        ctx.setStrokeStyle('#F0F0F0');
        ctx.setLineWidth(1);
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, margin.top + height);
        ctx.stroke();
      }
    },
    
    // 绘制曲线
    drawLine(ctx, margin, width, height, data, maxValue, color) {
      if (data.length <= 1) return;
      
      const xStep = width / (data.length - 1);
      
      ctx.beginPath();
      ctx.setStrokeStyle(color);
      ctx.setLineWidth(2);
      
      data.forEach((value, i) => {
        const x = margin.left + i * xStep;
        // 数据归一化到图表高度
        const normalizedValue = value / maxValue;
        const y = margin.top + height - (normalizedValue * height);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    },
    
    // 绘制数据点
    drawPoints(ctx, margin, width, height, data, maxValue, color) {
      const xStep = width / (data.length - 1 || 1);
      const pointRadius = 3;
      
      data.forEach((value, i) => {
        const x = margin.left + i * xStep;
        const normalizedValue = value / maxValue;
        const y = margin.top + height - (normalizedValue * height);
        
        // 绘制外圈
        ctx.beginPath();
        ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
        ctx.setFillStyle(color);
        ctx.fill();
        
        // 绘制内圈（白色）
        ctx.beginPath();
        ctx.arc(x, y, pointRadius / 2, 0, 2 * Math.PI);
        ctx.setFillStyle('#FFFFFF');
        ctx.fill();
      });
    }
  }
});
