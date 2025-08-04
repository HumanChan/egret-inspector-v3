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
      <div class="tabs">
        <button 
          @click="activeTab = 'hierarchy'" 
          :class="{ active: activeTab === 'hierarchy' }"
          class="tab-btn"
        >
          层级结构
        </button>
        <button 
          @click="activeTab = 'fps'" 
          :class="{ active: activeTab === 'fps' }"
          class="tab-btn"
        >
          FPS 监控
        </button>
      </div>

      <div class="main-content" v-if="treeData && treeData.nodes && activeTab === 'hierarchy'">
        <!-- Hierarchy Section -->
        <div class="hierarchy-section">
          <Hierarchy 
            :treeData="convertedTreeData" 
            @node-select="handleNodeSelect"
            @node-unselect="handleNodeUnselect"
            @node-visibility-toggle="handleNodeVisibilityToggle"
          />
        </div>
        
        <!-- Properties Section -->
        <div class="properties-section">
          <Properties 
            :selectedNode="selectedNode"
            :properties="nodeProperties"
            @property-update="handlePropertyUpdate"
          />
        </div>
      </div>

      <div class="main-content" v-if="activeTab === 'fps'">
        <!-- FPS Panel -->
        <FpsPanel />
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
import { TreeData, Property } from './data';
import Hierarchy from './hierarchy.vue';
import Properties from './properties.vue';
import FpsPanel from './fps-panel.vue';

export default defineComponent({
  name: 'EgretInspectorPanel',
  components: {
    Hierarchy,
    Properties,
    FpsPanel
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
    const nodeProperties = ref<Property[]>([]);
    const activeTab = ref<'hierarchy' | 'fps'>('hierarchy');

    // 转换树数据为cc-ui需要的格式
    const convertedTreeData = computed(() => {
      if (!treeData.value || !treeData.value.nodes) {
        return [];
      }
      
      // Converting tree data
      
      // 如果已经是树形结构，直接转换
      if (treeData.value.nodes.length === 1 && treeData.value.nodes[0].children) {
        const result = [TreeData.fromNodeInfo(treeData.value.nodes[0])];
        // Converted tree data (single root)
        return result;
      }
      
      // 否则使用扁平数组构建树形结构
      const result = TreeData.buildTreeFromFlatArray(treeData.value.nodes);
              // Converted tree data (flat array)
      return result;
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
      // Support response
      if (data.data) {
        engineDetected.value = data.data.support;
        if (data.data.support) {
          engineVersion.value = data.data.version || 'unknown';
          engineType.value = data.data.engineType || 'egret';
          
          // 引擎检测成功后自动获取节点树
          setTimeout(() => {
            requestTreeInfo();
          }, 20);
        }
      }
    };

    const handleTreeInfoResponse = (data: any) => {
      // Tree info response
      if (data.data) {
        treeData.value = data.data;
      }
    };

    const handleNodeInfoResponse = (data: any) => {
      // Node info response
      if (data.data && data.data.properties) {
        // Setting node properties
        nodeProperties.value = data.data.properties;
      } else {
        // No properties found in response
        nodeProperties.value = [];
      }
    };

    const handleErrorResponse = (data: any) => {
      console.error('Error response:', data);
      errorMessage.value = data.data || 'Unknown error occurred';
    };

    const handleSetPropertyResponse = (data: any) => {
      // Set property response
      if (data.data) {
        if (data.data.success) {
          // Property updated successfully
          // 属性更新成功后，刷新属性列表以确保数据一致性
          if (selectedNode.value && selectedNode.value.id) {
            // Refreshing node properties after update
            bridge.send(Msg.RequestNodeInfo, { uuid: selectedNode.value.id });
          }
        } else {
          console.warn('Property update failed:', data.data.error);
          errorMessage.value = data.data.error || 'Property update failed';
          // 服务器更新失败，可以在这里回滚UI状态
          // 但由于我们已经刷新了属性列表，所以不需要手动回滚
        }
      }
    };

    const handleVisibleResponse = (data: any) => {
      // Visible response
      if (data.data) {
        if (data.data.success) {
          // Visible property updated successfully
          console.log('Node visibility updated successfully');
        } else {
          console.warn('Visible update failed:', data.data.error);
          errorMessage.value = data.data.error || 'Visible update failed';
        }
      }
    };

    const handleFpsResponse = (data: any) => {
      // FPS response
      if (data.data) {
        if (data.data.success) {
          console.log('FPS monitoring response:', data.data);
        } else {
          console.warn('FPS monitoring failed:', data.data.error);
          errorMessage.value = data.data.error || 'FPS monitoring failed';
        }
      }
    };

    const handleFpsUpdate = (data: any) => {
      // FPS update
      console.log('FPS update received:', data);
      // FPS 更新事件会通过 FpsPanel 组件处理
    };

    const handleNodeSelect = (node: TreeData) => {
      // Node selected
      selectedNode.value = node;
      
      // 获取节点属性
      if (node && node.id) {
        // Requesting node info
        bridge.send(Msg.RequestNodeInfo, { uuid: node.id });
      } else {
        console.warn('Node has no id:', node);
      }
    };

    const handleNodeUnselect = () => {
      // Node unselected
      selectedNode.value = null;
      nodeProperties.value = [];
    };

    const handlePropertyUpdate = (property: Property, newValue: any) => {
      // === PROPERTY UPDATE START ===
      // Property update info
      // Selected node info
      
      if (selectedNode.value && selectedNode.value.id) {
        // 乐观更新：立即更新UI中的属性值
        const propertyIndex = nodeProperties.value.findIndex(p => p.name === property.name);
        if (propertyIndex !== -1) {
          nodeProperties.value[propertyIndex] = {
            ...nodeProperties.value[propertyIndex],
            value: newValue
          };
        }
        
        // Sending property update request
        const requestData = {
          nodeId: selectedNode.value.id,
          propertyPath: property.path,
          value: newValue
        };
        // Request data
        bridge.send(Msg.RequestSetProperty, requestData);
      } else {
        console.warn('No selected node for property update');
      }
      // === PROPERTY UPDATE END ===
    };

    const handleNodeVisibilityToggle = (data: { nodeId: string; visible: boolean }) => {
      // Node visibility toggle
      if (data.nodeId) {
        // 发送可见性切换请求
        const requestData = {
          nodeId: data.nodeId,
          visible: data.visible
        };
        bridge.send(Msg.RequestVisible, requestData);
      }
    };

    onMounted(() => {
      // Egret Inspector Panel mounted
      
      // 监听消息
      bridge.on(Msg.ResponseSupport, handleSupportResponse);
      bridge.on(Msg.ResponseTreeInfo, handleTreeInfoResponse);
      bridge.on(Msg.ResponseNodeInfo, handleNodeInfoResponse);
      bridge.on(Msg.ResponseError, handleErrorResponse);
      bridge.on(Msg.ResponseSetProperty, handleSetPropertyResponse);
      bridge.on(Msg.ResponseVisible, handleVisibleResponse);
      bridge.on(Msg.ResponseFpsData, handleFpsResponse);
      bridge.on(Msg.FpsUpdate, handleFpsUpdate);
      
      // 更新连接状态
      updateConnectionStatus('connected');
      
      // 自动请求引擎检测
      setTimeout(() => {
        requestSupport();
      }, 20);
    });

    onUnmounted(() => {
      // Egret Inspector Panel unmounted
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
        nodeProperties,
        activeTab,
        handleNodeSelect,
        handleNodeUnselect,
        handlePropertyUpdate,
        handleNodeVisibilityToggle
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

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid #3e3e42;
}

.tab-btn {
  padding: 8px 12px;
  background: #3e3e42;
  border: 1px solid #3e3e42;
  border-radius: 4px 4px 0 0;
  color: #cccccc;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.tab-btn.active {
  background: #252526;
  border-bottom: 1px solid #252526;
  border-color: #252526;
  color: #4caf50; /* Highlight color for active tab */
}

.main-content {
  display: flex;
  flex: 1;
  gap: 8px;
  height: 100%;
  min-height: 0;
}

.hierarchy-section {
  flex: 1;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  overflow: hidden;
  background: #252526;
  min-height: 0;
}

.properties-section {
  flex: 1;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  overflow: hidden;
  background: #252526;
  display: flex;
  flex-direction: column;
  min-height: 0;
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