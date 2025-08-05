<template>
  <div class="simple-fps">
    <span class="fps-number" :style="{ color: fpsColor, textShadow: `0 0 12px ${textShadowColor}` }">{{ currentFps }}</span>
    <span class="fps-label" :style="{ color: fpsColor }">fps</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

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

    // 根据 FPS 值计算颜色
    const fpsColor = computed(() => {
      const fps = props.fps;
      if (fps >= 55) {
        return '#4caf50'; // 绿色 - 优秀
      } else if (fps >= 50) {
        return '#ffd700'; // 黄色 - 良好
      } else if (fps >= 45) {
        return '#ff9800'; // 橙色 - 一般
      } else {
        return '#f44336'; // 红色 - 较差
      }
    });

    // 计算文字阴影颜色
    const textShadowColor = computed(() => {
      const fps = props.fps;
      if (fps >= 55) {
        return 'rgba(76, 175, 80, 0.8)'; // 绿色阴影
      } else if (fps >= 50) {
        return 'rgba(255, 215, 0, 0.8)'; // 黄色阴影
      } else if (fps >= 45) {
        return 'rgba(255, 152, 0, 0.8)'; // 橙色阴影
      } else {
        return 'rgba(244, 67, 54, 0.8)'; // 红色阴影
      }
    });

    return {
      currentFps,
      fpsColor,
      textShadowColor
    };
  }
});
</script>

<style scoped>
.simple-fps {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-family: 'Courier New', monospace;
  height: 100%;
  align-items: center;
}

.fps-number {
  font-size: 48px;
  font-weight: bold;
  line-height: 1;
}

.fps-label {
  font-size: 16px;
  opacity: 0.9;
  font-weight: 500;
}
</style> 