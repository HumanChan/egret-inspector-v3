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
    },
    width: {
      type: Number,
      default: FPS_CONSTANTS.CHART_WIDTH
    },
    height: {
      type: Number,
      default: FPS_CONSTANTS.CHART_HEIGHT
    }
  },
  setup(props) {
    const chartCanvas = ref<HTMLCanvasElement>();
    const canvasWidth = ref(props.width);
    const canvasHeight = ref(props.height);

    const drawChart = () => {
      if (!chartCanvas.value) return;

      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) return;

      const canvas = chartCanvas.value;
      const width = canvas.width;
      const height = canvas.height;

      // 清空画布
      ctx.clearRect(0, 0, width, height);

      if (props.fpsHistory.length === 0) return;

      // 计算图表参数
      const maxFps = Math.max(...props.fpsHistory, 60);
      const minFps = Math.min(...props.fpsHistory, 0);
      const fpsRange = maxFps - minFps || 60;

      const barWidth = width / props.fpsHistory.length;
      const maxBarHeight = height * 0.8;

      // 绘制背景网格
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      // 水平网格线
      for (let i = 0; i <= 4; i++) {
        const y = (height * 0.1) + (i * maxBarHeight / 4);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 绘制 FPS 柱状图
      props.fpsHistory.forEach((fps, index) => {
        const x = index * barWidth;
        const normalizedFps = (fps - minFps) / fpsRange;
        const barHeight = normalizedFps * maxBarHeight;
        const y = height - barHeight - height * 0.1;

        // 根据 FPS 值设置颜色
        let color;
        const { PERFORMANCE_THRESHOLDS } = FPS_CONSTANTS;
        if (fps >= PERFORMANCE_THRESHOLDS.EXCELLENT) {
          color = '#4caf50'; // 绿色 - 优秀
        } else if (fps >= PERFORMANCE_THRESHOLDS.GOOD) {
          color = '#ff9800'; // 橙色 - 良好
        } else if (fps >= PERFORMANCE_THRESHOLDS.POOR) {
          color = '#ff5722'; // 红色 - 较差
        } else {
          color = '#f44336'; // 深红色 - 严重
        }

        // 绘制柱状图
        ctx.fillStyle = color;
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight);

        // 绘制 FPS 数值
        if (index % 10 === 0 || index === props.fpsHistory.length - 1) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(fps.toString(), x + barWidth / 2, y - 5);
        }
      });

      // 绘制目标 FPS 线
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      const targetFps = 60;
      const targetY = height - ((targetFps - minFps) / fpsRange) * maxBarHeight - height * 0.1;
      
      ctx.beginPath();
      ctx.moveTo(0, targetY);
      ctx.lineTo(width, targetY);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // 监听 FPS 历史数据变化
    watch(() => props.fpsHistory, () => {
      nextTick(() => {
        drawChart();
      });
    }, { deep: true });

    onMounted(() => {
      drawChart();
    });

    return {
      chartCanvas,
      canvasWidth,
      canvasHeight
    };
  }
});
</script>

<style scoped>
.fps-chart {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #333;
}

canvas {
  display: block;
  border-radius: 4px;
}
</style> 