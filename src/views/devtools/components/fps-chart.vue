<template>
  <div class="fps-chart">
    <canvas ref="chartCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, nextTick } from 'vue';
import { FPS_CONSTANTS } from '../../../scripts/const';

export default defineComponent({
  name: 'FpsChart',
  props: {
    fpsHistory: {
      type: Array as () => number[],
      default: () => []
    }
  },
  setup(props) {
    const chartCanvas = ref<HTMLCanvasElement>();
    const canvasWidth = ref(0);
    const canvasHeight = ref(0);

    // 监听容器尺寸变化
    const updateCanvasSize = () => {
      if (chartCanvas.value) {
        // 从父容器获取尺寸，而不是从 canvas 本身
        const parentElement = chartCanvas.value.parentElement;
        if (parentElement) {
          const rect = parentElement.getBoundingClientRect();
          // 确保获取到正确的尺寸
          const width = Math.floor(rect.width);
          const height = Math.floor(rect.height);
          
          if (width > 0 && height > 0) {
            canvasWidth.value = width;
            canvasHeight.value = height;
            console.log('Canvas size updated:', canvasWidth.value, canvasHeight.value);
            
            // 强制重新绘制
            nextTick(() => {
              drawChart();
            });
          }
        }
      }
    };

    const drawChart = () => {
      if (!chartCanvas.value) {
        console.log('Canvas not found');
        return;
      }

      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) {
        console.log('Canvas context not found');
        return;
      }

      const canvas = chartCanvas.value;
      const width = canvas.width;
      const height = canvas.height;

      // 清空画布
      ctx.clearRect(0, 0, width, height);

      console.log('Drawing chart with fpsHistory:', props.fpsHistory);
      
      if (props.fpsHistory.length === 0) {
        console.log('No FPS history data');
        // 绘制一个简单的背景网格，表示图表已加载
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        // 绘制简单的网格
        for (let i = 0; i <= 4; i++) {
          const y = (height * 0.2) + (i * height * 0.6 / 4);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        
        // 显示"等待数据"文字
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('等待 FPS 数据...', width / 2, height / 2);
        return;
      }

             // 计算图表参数
       const maxFps = Math.max(...props.fpsHistory, 60);
       const minFps = Math.min(...props.fpsHistory, 0);
       const fpsRange = maxFps - minFps || 60;

               const barWidth = 10; // 固定柱子宽度为10像素
       const maxBars = Math.floor(width / barWidth); // 计算最大可显示的柱子数量
       const maxBarHeight = height * 0.9; // 增加最大高度，让柱状图填充到底部

      // 绘制背景网格 - 更细腻的网格
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 0.5;
      
             // 水平网格线
       for (let i = 0; i <= 6; i++) {
         const y = (height * 0.05) + (i * maxBarHeight / 6);
         ctx.beginPath();
         ctx.moveTo(0, y);
         ctx.lineTo(width, y);
         ctx.stroke();
       }
       
       // 垂直网格线
       for (let i = 0; i <= 8; i++) {
         const x = (width * 0.1) + (i * width * 0.8 / 8);
         ctx.beginPath();
         ctx.moveTo(x, height * 0.05);
         ctx.lineTo(x, height * 0.95);
         ctx.stroke();
       }

                                                                                                           // 绘制 FPS 柱状图 - 新数据从左侧进入，向右推进
          const historyLength = props.fpsHistory.length;
          
          // 计算显示的数据范围：总是显示最新的maxBars个数据
          const startIndex = Math.max(0, historyLength - maxBars);
          const displayCount = Math.min(maxBars, historyLength);
          
          for (let i = 0; i < displayCount; i++) {
            const dataIndex = startIndex + i; // 数据索引（从老到新）
            const fps = props.fpsHistory[dataIndex];
            
            // 计算x坐标：从左到右绘制，第一个柱子从左侧开始
            const x = i * barWidth;
         const normalizedFps = (fps - minFps) / fpsRange;
         const barHeight = normalizedFps * maxBarHeight;
         const y = height - barHeight - height * 0.05; // 减少顶部边距，让柱状图更接近底部

        // 根据 FPS 值设置颜色
        let color;
        if (fps >= 55) {
          color = '#4caf50'; // 绿色 - 优秀
        } else if (fps >= 50) {
          color = '#ffd700'; // 黄色 - 良好
        } else if (fps >= 45) {
          color = '#ff9800'; // 橙色 - 一般
        } else {
          color = '#f44336'; // 红色 - 较差
        }

        // 绘制柱状图 - 添加渐变效果
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, adjustBrightness(color, -0.3));
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
        
        // 添加高光效果
        ctx.fillStyle = adjustBrightness(color, 0.2);
        ctx.fillRect(x + 1, y, barWidth - 2, Math.min(2, barHeight * 0.1));
      }

             // 绘制目标 FPS 线 (60fps)
       ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
       ctx.lineWidth = 2;
       ctx.setLineDash([5, 5]);
       
              const targetFps = 60;
        const targetY = height - ((targetFps - minFps) / fpsRange) * maxBarHeight - height * 0.05;
       
      ctx.beginPath();
      ctx.moveTo(0, targetY);
      ctx.lineTo(width, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

       // 绘制警戒 FPS 线 (50fps)
       ctx.strokeStyle = 'rgba(255, 152, 0, 0.6)'; // 橙色警戒线
       ctx.lineWidth = 2;
       ctx.setLineDash([3, 3]);
       
              const warningFps = 50;
        const warningY = height - ((warningFps - minFps) / fpsRange) * maxBarHeight - height * 0.05;
       
      ctx.beginPath();
      ctx.moveTo(0, warningY);
      ctx.lineTo(width, warningY);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // 监听 FPS 历史数据变化
    watch(() => props.fpsHistory, () => {
      nextTick(() => {
        updateCanvasSize();
        drawChart();
      });
    }, { deep: true });

    onMounted(() => {
      // 使用多个 nextTick 确保 DOM 完全渲染
      nextTick(() => {
        nextTick(() => {
          updateCanvasSize();
          drawChart();
          
          // 监听容器尺寸变化
          if (chartCanvas.value && chartCanvas.value.parentElement) {
            const resizeObserver = new ResizeObserver(() => {
              updateCanvasSize();
              drawChart();
            });
            resizeObserver.observe(chartCanvas.value.parentElement);
          }
        });
      });
    });

    // 辅助函数：调整颜色亮度
    const adjustBrightness = (hex: string, percent: number) => {
      const num = parseInt(hex.replace("#", ""), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    };

    return {
      chartCanvas,
      canvasWidth,
      canvasHeight,
      adjustBrightness,
      updateCanvasSize
    };
  }
});
</script>

<style scoped>
.fps-chart {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d30 100%);
  height: 100%;
  width: 100%;
  border-radius: 6px;
  border: 1px solid #3e3e42;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
  border-radius: 4px;
  flex: 1;
}
</style> 