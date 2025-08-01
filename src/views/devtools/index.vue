<template>
  <div id="egret-inspector-panel">
    <div class="header">
      <h1>Egret Inspector</h1>
      <div class="status">
        <span :class="['status-indicator', connectionStatus]">
          {{ connectionStatusText }}
        </span>
      </div>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Engine Detection</h2>
        <div class="engine-info">
          <p v-if="engineDetected">
            <strong>Egret Engine Detected</strong><br>
            Version: {{ engineVersion }}<br>
            Type: {{ engineType }}
          </p>
          <p v-else>
            <strong>No Egret Engine Detected</strong><br>
            Please refresh the page or check if the game is loaded.
          </p>
        </div>
      </div>
      
      <div class="section">
        <h2>Actions</h2>
        <div class="actions">
          <button @click="requestSupport" :disabled="!isConnected">
            Check Support
          </button>
          <button @click="requestTreeInfo" :disabled="!isConnected">
            Get Tree Info
          </button>
        </div>
      </div>
      
      <!-- 添加Hierarchy组件 -->
      <div class="section" v-if="treeData && treeData.nodes">
        <h2>Node Hierarchy</h2>
        <div class="hierarchy-container">
          <Hierarchy 
            :treeData="convertedTreeData" 
            @node-select="handleNodeSelect"
            @node-unselect="handleNodeUnselect"
          />
        </div>
      </div>
      
      <!-- 添加Hierarchy组件 -->
      <div class="section" v-if="treeData && treeData.nodes">
        <h2>Node Hierarchy</h2>
        <div class="hierarchy-container">
          <Hierarchy 
            :treeData="convertedTreeData" 
            @node-select="handleNodeSelect"
            @node-unselect="handleNodeUnselect"
          />
        </div>
      </div>
      
      <div class="section" v-if="treeData">
        <h2>Tree Data</h2>
        <div class="tree-info">
          <p>Nodes: {{ treeData.nodes?.length || 0 }}</p>
          <p>Timestamp: {{ new Date(treeData.timestamp).toLocaleString() }}</p>
        </div>
      </div>
      
      <div class="section" v-if="errorMessage">
        <h2>Error</h2>
        <div class="error">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from 'vue';
import { bridge } from './bridge';
import { Msg } from '../../core/types';
import { TreeData } from './data';
import Hierarchy from './hierarchy.vue';

export default defineComponent({
  name: 'EgretInspectorPanel',
  components: {
    Hierarchy
  },
  setup() {
    const connectionStatus = ref<'connected' | 'disconnected' | 'connecting'>('connecting');
    const connectionStatusText = ref('Connecting...');
    const isConnected = ref(false);
    const engineDetected = ref(false);
    const engineVersion = ref('unknown');
    const engineType = ref('unknown');
    const treeData = ref(null);
    const errorMessage = ref('');
    const selectedNode = ref<TreeData | null>(null);

    // 转换树数据为cc-ui需要的格式
    const convertedTreeData = computed(() => {
      if (!treeData.value || !treeData.value.nodes) {
        return [];
      }
      
      return treeData.value.nodes.map(node => TreeData.fromNodeInfo(node));
    });

    const updateConnectionStatus = (status: 'connected' | 'disconnected' | 'connecting') => {
      connectionStatus.value = status;
      isConnected.value = status === 'connected';
      
      switch (status) {
        case 'connected':
          connectionStatusText.value = 'Connected';
          break;
        case 'disconnected':
          connectionStatusText.value = 'Disconnected';
          break;
        case 'connecting':
          connectionStatusText.value = 'Connecting...';
          break;
      }
    };

    const requestSupport = () => {
      bridge.send(Msg.RequestSupport, {});
    };

    const requestTreeInfo = () => {
      bridge.send(Msg.RequstTreeInfo, { frameID: 0 });
    };

    const handleSupportResponse = (data: any) => {
      console.log('Support response:', data);
      if (data.data) {
        engineDetected.value = data.data.support;
        if (data.data.support) {
          engineVersion.value = data.data.version || 'unknown';
          engineType.value = data.data.engineType || 'egret';
        }
      }
    };

    const handleTreeInfoResponse = (data: any) => {
      console.log('Tree info response:', data);
      if (data.data) {
        treeData.value = data.data;
      }
    };

    const handleErrorResponse = (data: any) => {
      console.error('Error response:', data);
      errorMessage.value = data.data || 'Unknown error occurred';
    };

    const handleNodeSelect = (node: TreeData) => {
      console.log('Node selected:', node);
      selectedNode.value = node;
    };

    const handleNodeUnselect = () => {
      console.log('Node unselected');
      selectedNode.value = null;
    };

    onMounted(() => {
      console.log('Egret Inspector Panel mounted');
      
      // 监听消息
      bridge.on(Msg.ResponseSupport, handleSupportResponse);
      bridge.on(Msg.ResponseTreeInfo, handleTreeInfoResponse);
      bridge.on(Msg.ResponseError, handleErrorResponse);
      
      // 更新连接状态
      updateConnectionStatus('connected');
      
      // 自动请求支持状态
      setTimeout(() => {
        requestSupport();
      }, 1000);
    });

    onUnmounted(() => {
      console.log('Egret Inspector Panel unmounted');
    });

    return {
      connectionStatus,
      connectionStatusText,
      isConnected,
      engineDetected,
      engineVersion,
      engineType,
      treeData,
      convertedTreeData,
      errorMessage,
      selectedNode,
      requestSupport,
      requestTreeInfo,
      handleNodeSelect,
      handleNodeUnselect
    };
  }
});
</script>

<style scoped>
#egret-inspector-panel {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 16px;
  background: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ddd;
}

.header h1 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-indicator.connected {
  background: #4caf50;
  color: white;
}

.status-indicator.disconnected {
  background: #f44336;
  color: white;
}

.status-indicator.connecting {
  background: #ff9800;
  color: white;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section h2 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.engine-info p {
  margin: 8px 0;
  font-size: 13px;
  color: #666;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.actions button:hover:not(:disabled) {
  background: #f0f0f0;
}

.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hierarchy-container {
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.hierarchy-container {
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.tree-info p {
  margin: 4px 0;
  font-size: 12px;
  color: #666;
}

.error {
  color: #f44336;
  font-size: 12px;
  padding: 8px;
  background: #ffebee;
  border-radius: 4px;
  border-left: 4px solid #f44336;
}
</style> 