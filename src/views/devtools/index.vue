<template>
  <div id="egret-inspector-panel">
    <div class="header">
      <div class="header-left">
        <div class="title-row">
          <h1>Egret Inspector</h1>
          <span class="engine-version" v-if="engineDetected">Egret Version: {{ engineVersion }}</span>
        </div>
      </div>
      <div class="status">
        <span :class="['status-indicator', connectionStatus]">
          {{ connectionStatusText }}
        </span>
      </div>
    </div>
    
    <div class="content">

      

      
      <!-- 添加Hierarchy组件 -->
      <div class="hierarchy-section" v-if="treeData && treeData.nodes">
        <Hierarchy 
          :treeData="convertedTreeData" 
          @node-select="handleNodeSelect"
          @node-unselect="handleNodeUnselect"
        />
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
      
      // 如果已经是树形结构，直接转换
      if (treeData.value.nodes.length === 1 && treeData.value.nodes[0].children) {
        return [TreeData.fromNodeInfo(treeData.value.nodes[0])];
      }
      
      // 否则使用扁平数组构建树形结构
      return TreeData.buildTreeFromFlatArray(treeData.value.nodes);
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
          
          // 引擎检测成功后自动获取节点树
          setTimeout(() => {
            requestTreeInfo();
          }, 500);
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
      
      // 自动请求引擎检测
      setTimeout(() => {
        requestSupport();
      }, 500);
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
  background: #2d2d30;
  min-height: 100vh;
  color: #cccccc;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  padding-bottom: 8px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header h1 {
  margin: 0;
  font-size: 18px;
  color: #cccccc;
}

.engine-version {
  padding: 2px 6px;
  background: #3e3e42;
  border-radius: 3px;
  color: #cccccc;
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-indicator.connected {
  background: #4caf50;
  color: #ffffff;
}

.status-indicator.disconnected {
  background: #f44336;
  color: #ffffff;
}

.status-indicator.connecting {
  background: #ff9800;
  color: #ffffff;
}

.content {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
}

.section {
  background: #252526;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  border: 1px solid #3e3e42;
}

.section h2 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #cccccc;
}





.hierarchy-section {
  flex: 1;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  overflow: hidden;
  background: #252526;
}



.error {
  color: #f44336;
  font-size: 12px;
  padding: 8px;
  background: #2d1b1b;
  border-radius: 4px;
  border-left: 4px solid #f44336;
}
</style> 