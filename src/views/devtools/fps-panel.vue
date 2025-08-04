<template>
  <div class="fps-panel">
    <div class="fps-header">
      <h3>FPS 监控</h3>
      <button @click="toggleMonitoring" :class="{ 'active': isMonitoring }">
        {{ isMonitoring ? '停止' : '开始' }}
      </button>
    </div>
    <div class="fps-content">
      <FpsIndicator :fps="currentFps" />
      <FpsChart :fps-history="fpsHistory" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import FpsIndicator from './components/fps-indicator.vue';
import FpsChart from './components/fps-chart.vue';
import { Msg } from '../../core/types';
import { bridge } from './bridge';

export default defineComponent({
  name: 'FpsPanel',
  components: {
    FpsIndicator,
    FpsChart
  },
  setup() {
    const currentFps = ref(0);
    const fpsHistory = ref<number[]>([]);
    const isMonitoring = ref(false);

    const toggleMonitoring = () => {
      if (isMonitoring.value) {
        stopMonitoring();
      } else {
        startMonitoring();
      }
    };

    const startMonitoring = () => {
      try {
        bridge.send(Msg.RequestFpsData, { enable: true });
        isMonitoring.value = true;
        console.log('FPS monitoring started');
      } catch (error) {
        console.error('Failed to start FPS monitoring:', error);
      }
    };

    const stopMonitoring = () => {
      try {
        bridge.send(Msg.RequestFpsData, { enable: false });
        isMonitoring.value = false;
        currentFps.value = 0;
        console.log('FPS monitoring stopped');
      } catch (error) {
        console.error('Failed to stop FPS monitoring:', error);
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
    });

    onUnmounted(() => {
      if (isMonitoring.value) {
        stopMonitoring();
      }
    });

    return {
      currentFps,
      fpsHistory,
      isMonitoring,
      toggleMonitoring
    };
  }
});
</script>

<style scoped>
.fps-panel {
  padding: 16px;
  background: #1e1e1e;
  color: white;
}

.fps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.fps-header h3 {
  margin: 0;
}

.fps-header button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #333;
  color: white;
  cursor: pointer;
}

.fps-header button.active {
  background: #4caf50;
}

.fps-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style> 