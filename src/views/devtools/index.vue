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

      

      
      <div class="main-content" v-if="treeData && treeData.nodes">
        <!-- Hierarchy Section -->
        <div class="hierarchy-section">
          <Hierarchy 
            :treeData="convertedTreeData" 
            @node-select="handleNodeSelect"
            @node-unselect="handleNodeUnselect"
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

export default defineComponent({
  name: 'EgretInspectorPanel',
  components: {
    Hierarchy,
    Properties
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

    // 转换树数据为cc-ui需要的格式
    const convertedTreeData = computed(() => {
      if (!treeData.value || !treeData.value.nodes) {
        return [];
      }
      
      console.log('Converting tree data:', treeData.value);
      
      // 如果已经是树形结构，直接转换
      if (treeData.value.nodes.length === 1 && treeData.value.nodes[0].children) {
        const result = [TreeData.fromNodeInfo(treeData.value.nodes[0])];
        console.log('Converted tree data (single root):', result);
        return result;
      }
      
      // 否则使用扁平数组构建树形结构
      const result = TreeData.buildTreeFromFlatArray(treeData.value.nodes);
      console.log('Converted tree data (flat array):', result);
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

    const handleNodeInfoResponse = (data: any) => {
      console.log('Node info response:', data);
      if (data.data && data.data.properties) {
        console.log('Setting node properties:', data.data.properties);
        nodeProperties.value = data.data.properties;
      } else {
        console.log('No properties found in response');
        nodeProperties.value = [];
      }
    };

    const handleErrorResponse = (data: any) => {
      console.error('Error response:', data);
      errorMessage.value = data.data || 'Unknown error occurred';
    };

    const handleNodeSelect = (node: TreeData) => {
      console.log('Node selected:', node);
      selectedNode.value = node;
      
      // 获取节点属性
      if (node && node.id) {
        console.log('Requesting node info for:', node.id);
        bridge.send(Msg.RequestNodeInfo, { uuid: node.id });
      } else {
        console.warn('Node has no id:', node);
      }
    };

    const handleNodeUnselect = () => {
      console.log('Node unselected');
      selectedNode.value = null;
      nodeProperties.value = [];
    };

    const handlePropertyUpdate = (property: Property, newValue: any) => {
      console.log('Property update:', property.name, '=', newValue);
      // TODO: 实现属性更新逻辑
      // bridge.send(Msg.RequestSetProperty, {
      //   nodeId: selectedNode.value?.id,
      //   propertyPath: property.path,
      //   value: newValue
      // });
    };

    onMounted(() => {
      console.log('Egret Inspector Panel mounted');
      
      // 监听消息
      bridge.on(Msg.ResponseSupport, handleSupportResponse);
      bridge.on(Msg.ResponseTreeInfo, handleTreeInfoResponse);
      bridge.on(Msg.ResponseNodeInfo, handleNodeInfoResponse);
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
        nodeProperties,
        handleNodeSelect,
        handleNodeUnselect,
        handlePropertyUpdate
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