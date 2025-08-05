<template>
  <div class="resource-panel">
    <div class="resource-layout">
      <!-- 左侧资源列表 -->
      <div class="resource-left">
        <div class="resource-list-header">
          <h3>资源列表</h3>
        </div>
        <div class="resource-list-content">
          <div class="placeholder-content">
            <div class="placeholder-icon">📁</div>
            <h4>资源列表</h4>
            <p>资源文件列表功能正在开发中...</p>
          </div>
        </div>
      </div>
      
      <!-- 右侧资源预览 -->
      <div class="resource-right">
        <div class="resource-preview-header">
          <h3>资源预览</h3>
        </div>
        <div class="resource-preview-content">
          <div class="placeholder-content">
            <div class="placeholder-icon">🖼️</div>
            <h4>资源预览</h4>
            <p>资源预览功能正在开发中...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ResourcePanel',
  setup() {
    return {
      // 暂时没有具体功能实现
    };
  }
});
</script>

<style scoped>
.resource-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #252526;
  color: #cccccc;
  overflow: hidden;
}

.resource-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.resource-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #3e3e42;
  min-width: 0;
}

.resource-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.resource-list-header,
.resource-preview-header {
  padding: 12px 16px;
  background: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  flex-shrink: 0;
}

.resource-list-header h3,
.resource-preview-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #cccccc;
}

.resource-list-content,
.resource-preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  overflow-y: auto;
  min-height: 0;
}

.placeholder-content {
  text-align: center;
  max-width: 300px;
}

.placeholder-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.placeholder-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #cccccc;
}

.placeholder-content p {
  margin: 0;
  font-size: 12px;
  color: #999999;
  line-height: 1.4;
}
</style> 