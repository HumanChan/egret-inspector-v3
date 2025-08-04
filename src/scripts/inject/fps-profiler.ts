import { FpsData } from "../../core/types";
import { FPS_CONSTANTS } from "../const";

/**
 * FPS 监控器类
 * 基于 Egret Ticker 实现 FPS 计算和数据收集
 */
export class FpsProfiler {
  private _tick: number = 0;
  private _totalDeltaTime: number = 0;
  private _maxDeltaTime: number = FPS_CONSTANTS.UPDATE_INTERVAL;
  private _fpsHistory: number[] = [];
  private _maxHistoryLength: number = FPS_CONSTANTS.MAX_HISTORY_LENGTH;
  private _isRunning: boolean = false;
  private _currentFps: number = 0;
  private _lastUpdateTime: number = 0;

  constructor() {
    this._lastUpdateTime = Date.now();
  }

  /**
   * 启动 FPS 监控
   */
  public start(): void {
    if (this._isRunning) {
      console.log('FPS monitoring is already running');
      return;
    }

    this._isRunning = true;
    this._tick = 0;
    this._totalDeltaTime = 0;
    this._lastUpdateTime = Date.now();

    // 注册到 Egret Ticker
    if (window.egret?.Ticker?.getInstance) {
      try {
        const ticker = window.egret.Ticker.getInstance();
        ticker.register(this.update.bind(this), this);
        console.log('FPS monitoring started successfully');
      } catch (error) {
        console.error('Failed to register with Egret Ticker:', error);
        this._isRunning = false;
      }
    } else {
      console.warn('Egret Ticker not found, FPS monitoring may not work correctly');
    }
  }

  /**
   * 停止 FPS 监控
   */
  public stop(): void {
    if (!this._isRunning) {
      console.log('FPS monitoring is not running');
      return;
    }

    this._isRunning = false;

    // 从 Egret Ticker 注销
    if (window.egret?.Ticker?.getInstance) {
      try {
        const ticker = window.egret.Ticker.getInstance();
        ticker.unregister(this.update.bind(this), this);
        console.log('FPS monitoring stopped successfully');
      } catch (error) {
        console.error('Failed to unregister from Egret Ticker:', error);
      }
    }
  }

  /**
   * 更新 FPS 数据
   * @param deltaTime 帧时间差（毫秒）
   */
  private update(deltaTime: number): void {
    if (!this._isRunning) {
      return;
    }

    this._tick++;
    this._totalDeltaTime += deltaTime;

    // 当累计时间达到更新间隔时计算 FPS
    if (this._totalDeltaTime >= this._maxDeltaTime) {
      this._currentFps = Math.floor((this._tick * 1000) / this._totalDeltaTime);
      
      // 添加到历史数据
      this._fpsHistory.push(this._currentFps);
      if (this._fpsHistory.length > this._maxHistoryLength) {
        this._fpsHistory.shift();
      }

      // 重置计数器
      this._totalDeltaTime = 0;
      this._tick = 0;
      this._lastUpdateTime = Date.now();

      // 触发 FPS 更新事件
      this.triggerFpsUpdate();
    }
  }

  /**
   * 获取当前 FPS 数据
   */
  public getFpsData(): FpsData {
    return {
      fps: this._currentFps,
      timestamp: this._lastUpdateTime,
      history: [...this._fpsHistory]
    };
  }

  /**
   * 获取当前 FPS 值
   */
  public getCurrentFps(): number {
    return this._currentFps;
  }

  /**
   * 获取 FPS 历史数据
   */
  public getFpsHistory(): number[] {
    return [...this._fpsHistory];
  }

  /**
   * 检查是否正在运行
   */
  public isRunning(): boolean {
    return this._isRunning;
  }

  /**
   * 设置更新间隔
   * @param interval 更新间隔（毫秒）
   */
  public setUpdateInterval(interval: number): void {
    this._maxDeltaTime = Math.max(100, Math.min(2000, interval));
  }

  /**
   * 设置历史数据长度
   * @param length 历史数据长度
   */
  public setHistoryLength(length: number): void {
    this._maxHistoryLength = Math.max(10, Math.min(200, length));
    
    // 调整现有历史数据长度
    while (this._fpsHistory.length > this._maxHistoryLength) {
      this._fpsHistory.shift();
    }
  }

  /**
   * 清空历史数据
   */
  public clearHistory(): void {
    this._fpsHistory = [];
  }

  /**
   * 触发 FPS 更新事件
   */
  private triggerFpsUpdate(): void {
    const fpsData = this.getFpsData();
    
    // 创建自定义事件
    const event = new CustomEvent('fps-update', {
      detail: fpsData
    });
    
    document.dispatchEvent(event);
  }

  /**
   * 销毁 FPS 监控器
   */
  public destroy(): void {
    this.stop();
    this.clearHistory();
  }
} 