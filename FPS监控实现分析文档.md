# Egret Inspector FPS 监控实现分析文档

## 概述

本文档详细分析了 Egret Inspector 老项目中 FPS 监控功能的实现机制。FPS 监控是调试工具中的重要功能，用于实时显示游戏的帧率信息，帮助开发者优化性能。

## 架构概览

FPS 监控功能采用分层架构设计：

```
UI 层 (DevTools Panel)
    ↓
通信层 (Port System)
    ↓
数据层 (Profiler)
    ↓
引擎层 (Egret Ticker)
```

## 核心组件分析

### 1. Profiler 类 (性能分析器)

**位置**: `injectScripts.min.js` 第 860-880 行

**核心实现**:
```javascript
var c = (function (e) {
  __extends(r, e);
  function r() {
    e.apply(this, arguments);
    this._tick = 0;
    this._totalDeltaTime = 0;
  }
  
  r.prototype.run = function () {
    t.Ticker.getInstance().register(this.update, this);
  };
  
  r.prototype.update = function (t) {
    this._tick++;
    this._totalDeltaTime += t;
    if (this._totalDeltaTime >= r._maxDeltaTime) {
      var e = Math.floor((this._tick * 1e3) / this._totalDeltaTime);
      this.trigger('fps', e);
      this._totalDeltaTime = 0;
      this._tick = 0;
    }
  };
  
  r.instance = null;
  r._maxDeltaTime = 500; // 500ms 更新间隔
  return r;
})(t.devtool.EventBase);
```

**工作原理**:
- 注册到 Egret 的 Ticker 系统中
- 累计帧数和时间差
- 每 500ms 计算一次 FPS
- 通过事件系统广播 FPS 数据

### 2. ProfilePanel 类 (UI 面板)

**位置**: `ipt/panel/scripts/Loader.js` 中的 ProfilePanel 定义

**核心实现**:
```javascript
var t = function (e) {
  __extends(n, e);
  function n() {
    e.apply(this, arguments);
    this.maxBarCount = 60;
    this._fpsList = [];
    this._fps = 0;
  }
  
  Object.defineProperty(n.prototype, "fps", {
    get: function () {
      return this._fps;
    },
    set: function (e) {
      this._fps = e;
      this._fpsList.push(e);
      if (this._fpsList.length > this.maxBarCount) {
        this._fpsList.shift();
      }
      this.trigger("fps");
    },
    enumerable: true,
    configurable: true,
  });
  
  n.prototype.init = function () {
    var e = this;
    this.container = $("#profile");
    this.fpsTag = $("#fps");
    this.chartCtx = document.getElementById("fpsChart").getContext("2d");
    this.on("fps", function () {
      e.fpsTag.text(e._fps);
      e.drawChart();
    });
  };
  
  n.prototype.drawChart = function () {
    // 绘制 FPS 图表
    var e = this._fpsList.length;
    var t = this.chartCtx.canvas.width;
    var n = this.chartCtx.canvas.height;
    var r = Math.round(t / this.maxBarCount);
    var i = Math.min.apply(Math, this._fpsList);
    i = 0;
    this.chartCtx.clearRect(0, 0, t, n);
    
    for (var o = 0; o < e; o++) {
      var s = this._fpsList[o] - i;
      var a = (s / (70 - i)) * n;
      var h = r * o;
      var c = n - a;
      var l = (a / n) * 200;
      l = Math.round(l);
      l = Math.max(l, 1);
      var u = 200 - l;
      this.chartCtx.fillStyle = "rgb(" + u + "," + l + ",0)";
      this.chartCtx.fillRect(h, c, r - 1, a);
    }
  };
  
  return n;
}(e.Panel);
```

**功能特点**:
- 维护最近 60 帧的 FPS 数据
- 实时更新 FPS 数值显示
- 绘制 FPS 历史图表
- 使用颜色编码表示性能状态

### 3. 通信机制

**数据流向**:
```
Egret Ticker → Profiler → Inspector → Port → DevTools Panel → ProfilePanel
```

**关键代码片段**:

1. **Inspector 中的 FPS 监听** (第 1407-1408 行):
```javascript
o.on('fps', function (t) {
  i.trigger('fps', t);
});
```

2. **Main 类中的 FPS 转发** (第 2264-2266 行):
```javascript
isp.on('fps', function (t) {
  _this.port.post({ name: 'fps', data: t });
});
```

3. **DevTools Panel 中的 FPS 接收** (Loader.js):
```javascript
t.on("fps", function (e) {
  return n.profilePanel.fps = e.data;
});
```

## 技术实现细节

### 1. FPS 计算算法

**计算公式**:
```
FPS = (帧数 × 1000) / 总时间差(毫秒)
```

**实现逻辑**:
- 累计帧数 (`_tick`)
- 累计时间差 (`_totalDeltaTime`)
- 当累计时间达到 500ms 时计算 FPS
- 重置计数器继续下一轮统计

### 2. 图表绘制算法

**颜色编码**:
- 绿色 (0, 255, 0): 高性能 (60 FPS)
- 黄色 (255, 255, 0): 中等性能 (30-60 FPS)
- 红色 (255, 0, 0): 低性能 (<30 FPS)

**绘制逻辑**:
- 每个柱状图代表一帧的 FPS
- 柱高根据 FPS 值计算
- 颜色根据性能等级动态调整

### 3. 数据管理

**缓存策略**:
- 最多保存 60 帧的 FPS 数据
- 使用队列结构 (FIFO)
- 自动清理过期数据

**更新频率**:
- 每 500ms 更新一次 FPS 数据
- 图表实时重绘
- UI 立即响应

## 性能优化

### 1. 内存管理
- 限制 FPS 历史数据长度
- 及时清理过期数据
- 避免内存泄漏

### 2. 渲染优化
- 使用 Canvas 2D 上下文
- 批量绘制操作
- 减少不必要的重绘

### 3. 事件优化
- 使用事件委托
- 避免频繁的 DOM 操作
- 合理的事件监听器管理

## 扩展性设计

### 1. 模块化架构
- Profiler 独立于 UI 层
- 通过事件系统解耦
- 支持多种渲染后端

### 2. 配置化设计
- 可配置的更新间隔
- 可调整的图表参数
- 灵活的颜色方案

### 3. 多引擎支持
- 支持 Egret 引擎
- 支持 Lark 引擎
- 可扩展其他引擎

## 故障排除

### 1. 常见问题
- FPS 显示异常: 检查 Ticker 注册
- 图表不更新: 验证事件传递
- 性能影响: 调整更新频率

### 2. 调试方法
- 检查 Profiler 实例状态
- 验证事件监听器
- 监控内存使用情况

## 总结

FPS 监控功能采用了成熟的分层架构设计，通过 Profiler 收集数据，通过事件系统传递信息，最终在 UI 层展示。整个系统具有良好的扩展性和可维护性，为新项目的开发提供了重要的参考价值。

**关键优势**:
- 实时性能监控
- 直观的可视化展示
- 低性能开销
- 良好的用户体验

**技术亮点**:
- 基于 Egret Ticker 的高精度计时
- 事件驱动的松耦合架构
- Canvas 2D 的高效渲染
- 智能的数据缓存策略

---

## 新项目 FPS 监控实现

### 技术栈升级

新项目采用了现代化的技术栈，相比老项目有以下改进：

**老项目技术栈**:
- JavaScript + 原生 DOM
- 事件系统 + 回调函数
- 手动内存管理

**新项目技术栈**:
- TypeScript + Vue.js
- 响应式数据绑定
- 组件化架构
- 统一消息系统

### 核心组件实现

#### 1. FpsProfiler 类 (`src/scripts/inject/fps-profiler.ts`)
- 基于 Egret Ticker 的 FPS 计算
- 类型安全的实现
- 配置化的参数管理

#### 2. FPS UI 组件
- FpsIndicator: FPS 数值指示器
- FpsChart: FPS 历史图表
- FpsPanel: FPS 监控主面板

#### 3. 消息系统扩展
- 在 `src/core/types.ts` 中添加 FPS 相关消息类型
- 统一的消息路由机制
- 类型安全的消息传递

#### 4. 常量配置
- 在 `src/scripts/const.ts` 中添加 FPS 相关常量
- 集中化配置管理
- 可配置的性能阈值

### 架构改进

1. **类型安全**: TypeScript 提供编译时类型检查
2. **组件化**: Vue.js 组件化架构，易于维护和扩展
3. **响应式**: 自动数据绑定，减少手动 DOM 操作
4. **现代化**: 使用现代前端技术栈，性能更好
5. **可配置**: 集中化配置管理，易于调整参数
6. **国际化**: 支持多语言，用户体验更好

### 总结

新项目的 FPS 监控功能在保持老项目成熟设计理念的基础上，采用了现代化的技术栈，提供了更好的类型安全性、可维护性和用户体验。整个实现遵循了项目架构规范，具有良好的扩展性和稳定性。 