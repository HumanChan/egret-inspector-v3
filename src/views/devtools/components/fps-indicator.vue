<template>
  <div class="fps-indicator" :class="performanceClass">
    <div class="fps-value">{{ currentFps }}</div>
    <div class="fps-label">FPS</div>
    <div class="performance-status">{{ performanceStatus }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { FPS_CONSTANTS } from '../../../scripts/const';

export default defineComponent({
  name: 'FpsIndicator',
  props: {
    fps: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const currentFps = computed(() => {
      return Math.round(props.fps);
    });

    const performanceClass = computed(() => {
      const { PERFORMANCE_THRESHOLDS } = FPS_CONSTANTS;
      if (props.fps >= PERFORMANCE_THRESHOLDS.EXCELLENT) return 'excellent';
      if (props.fps >= PERFORMANCE_THRESHOLDS.GOOD) return 'good';
      if (props.fps >= PERFORMANCE_THRESHOLDS.POOR) return 'poor';
      return 'critical';
    });

    const performanceStatus = computed(() => {
      const { PERFORMANCE_THRESHOLDS } = FPS_CONSTANTS;
      if (props.fps >= PERFORMANCE_THRESHOLDS.EXCELLENT) return '优秀';
      if (props.fps >= PERFORMANCE_THRESHOLDS.GOOD) return '良好';
      if (props.fps >= PERFORMANCE_THRESHOLDS.POOR) return '较差';
      return '严重';
    });

    return {
      currentFps,
      performanceClass,
      performanceStatus
    };
  }
});
</script>

<style scoped>
.fps-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: #2a2a2a;
  color: white;
  font-family: 'Courier New', monospace;
  min-width: 80px;
  transition: all 0.3s ease;
}

.fps-value {
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
}

.fps-label {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 4px;
}

.performance-status {
  font-size: 10px;
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
}

/* 性能状态样式 */
.fps-indicator.excellent {
  background: linear-gradient(135deg, #4caf50, #45a049);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.fps-indicator.good {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
}

.fps-indicator.poor {
  background: linear-gradient(135deg, #ff5722, #e64a19);
  box-shadow: 0 2px 8px rgba(255, 87, 34, 0.3);
}

.fps-indicator.critical {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style> 