<template>
  <div class="top-fps">
    <div class="fps-content">
      <div class="fps-chart-wrapper">
        <FpsChart :fps-history="fpsHistory" />
      </div>
      <div class="fps-indicator-wrapper">
        <FpsIndicator :fps="currentFps" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import FpsIndicator from './fps-indicator.vue';
import FpsChart from './fps-chart.vue';
import { Msg } from '../../../core/types';
import { bridge } from '../bridge';

export default defineComponent({
  name: 'TopFps',
  components: {
    FpsIndicator,
    FpsChart
  },
  setup() {
    const currentFps = ref(0);
    const fpsHistory = ref<number[]>([]);
    const isMonitoring = ref(false);

    const startMonitoring = () => {
      try {
        bridge.send(Msg.RequestFpsData, { enable: true });
        isMonitoring.value = true;
        console.log('FPS monitoring started');
      } catch (error) {
        console.error('Failed to start FPS monitoring:', error);
      }
    };

    const handleFpsUpdate = (data: any) => {
      try {
        if (data.data) {
          currentFps.value = data.data.fps;
          fpsHistory.value = data.data.history;
        }
      } catch (error) {
        console.error('Failed to handle FPS update:', error);
      }
    };

    onMounted(() => {
      bridge.on(Msg.FpsUpdate, handleFpsUpdate);
      // 自动开始监控
      startMonitoring();
    });

    onUnmounted(() => {
      if (isMonitoring.value) {
        try {
          bridge.send(Msg.RequestFpsData, { enable: false });
        } catch (error) {
          console.error('Failed to stop FPS monitoring:', error);
        }
      }
    });

    return {
      currentFps,
      fpsHistory,
      isMonitoring
    };
  }
});
</script>

<style scoped>
.top-fps {
  display: flex;
  height: 100%;
  width: 400px;
  background: linear-gradient(135deg, #252526 0%, #2d2d30 100%);
  border: 1px solid #3e3e42;
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.fps-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0;
  min-height: 0;
}

.fps-chart-wrapper {
  flex: 1;
  height: 100%;
  min-height: 35px;
}

.fps-indicator-wrapper {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  height: 100%;
  min-width: 80px;
}

/* 调整FPS图表在顶部区域的样式 */
.fps-chart-wrapper :deep(.fps-chart) {
  height: 100%;
  min-height: 40px;
}

.fps-chart-wrapper :deep(canvas) {
  height: 100% !important;
  max-height: none !important;
}
</style> 