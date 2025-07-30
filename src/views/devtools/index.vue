<template>
  <div class="devtools-panel">
    <div class="header">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
    
    <div class="content">
      <!-- 引擎信息显示 -->
      <div class="engine-info" v-if="engineDetected">
        <h3>🎮 Egret Engine Detected</h3>
        <div class="engine-details">
          <p><strong>Engine Type:</strong> {{ engineInfo.type }}</p>
          <p><strong>Version:</strong> {{ engineInfo.version }}</p>
          <p><strong>Features:</strong> {{ engineInfo.features.join(', ') }}</p>
          <p><strong>Detection Time:</strong> {{ formatTime(engineInfo.timestamp) }}</p>
        </div>
      </div>
      
      <!-- 未检测到引擎时的显示 -->
      <div class="no-engine" v-else>
        <h3>🔍 Engine Detection</h3>
        <p>No Egret engine detected on this page.</p>
        <p>Please make sure you're on a page with an Egret game.</p>
      </div>
      
      <div class="status-info">
        <h3>📊 Status Information</h3>
        <p><strong>Connection Status:</strong> {{ connectionStatus }}</p>
        <p><strong>Last Update:</strong> {{ lastUpdateTime }}</p>
      </div>
      
      <div class="interactions">
        <CCButton @click="refreshEngineInfo" type="primary" :disabled="!engineDetected">
          Refresh Engine Info
        </CCButton>
        
        <CCButton @click="toggleTheme" type="secondary">
          {{ themeButtonText }}
        </CCButton>
      </div>
      
      <div class="info">
        <p><strong>{{ infoLabel }}:</strong> {{ extensionInfo }}</p>
        <p><strong>{{ versionLabel }}:</strong> {{ version }}</p>
        <p><strong>{{ panelTypeLabel }}:</strong> {{ panelType }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import PluginConfig from "../../../cc-plugin.config";

const { CCButton } = ccui.components;

interface EngineInfo {
  type: 'egret' | 'lark' | null;
  version: string;
  features: string[];
  timestamp: number;
}

export default defineComponent({
  name: "DevtoolsPanel",
  components: { CCButton },
  setup() {
    const count = ref(0);
    const isDarkTheme = ref(false);
    const currentTime = ref("");
    const title = ref("Egret Inspector");
    const description = ref("Chrome DevTools extension for Egret Engine debugging");
    const greeting = ref("Egret Inspector is ready!");
    const buttonText = ref("Click Me");
    const themeButtonText = ref("Toggle Theme");
    const infoLabel = ref("Extension Name");
    const versionLabel = ref("Version");
    const panelTypeLabel = ref("Panel Type");
    const extensionInfo = ref(PluginConfig.manifest.name);
    const version = ref(PluginConfig.manifest.version);
    const panelType = ref("DevTools Panel");
    
    // 引擎信息相关
    const engineDetected = ref(false);
    const engineInfo = ref<EngineInfo>({
      type: null,
      version: 'unknown',
      features: [],
      timestamp: 0
    });
    const connectionStatus = ref('Disconnected');
    const lastUpdateTime = ref('Never');
    
    let timer: NodeJS.Timeout;
    let port: chrome.runtime.Port | null = null;

    const updateTime = () => {
      currentTime.value = new Date().toLocaleString();
    };

    const formatTime = (timestamp: number) => {
      return new Date(timestamp).toLocaleString();
    };

    const refreshEngineInfo = () => {
      if (port) {
        const message = {
          type: 'debug',
          data: { action: 'getEngineInfo' },
          id: Date.now().toString(),
          timestamp: Date.now(),
          source: 'devtools'
        };
        
        console.log('DevTools sending getEngineInfo request:', message);
        port.postMessage(message);
      } else {
        console.warn('DevTools port not connected');
        connectionStatus.value = 'Disconnected';
      }
    };

    const toggleTheme = () => {
      isDarkTheme.value = !isDarkTheme.value;
      themeButtonText.value = isDarkTheme.value ? "Light Theme" : "Dark Theme";
      console.log(`DevTools Panel: Theme toggled to ${isDarkTheme.value ? 'dark' : 'light'}`);
    };

    const connectToBackground = () => {
      try {
        port = chrome.runtime.connect({ name: 'egret-inspector-devtools' });
        
        port.onMessage.addListener((message) => {
          console.log('DevTools received message:', message);
          
          if (message.type === 'detect' && message.data) {
            // 处理引擎检测消息
            if (message.data.detected) {
              engineDetected.value = true;
              engineInfo.value = {
                type: message.data.engineType || 'egret',
                version: message.data.version || 'unknown',
                features: message.data.features || [],
                timestamp: message.data.timestamp || Date.now()
              };
              connectionStatus.value = 'Connected';
              lastUpdateTime.value = new Date().toLocaleString();
            }
          }
          
          if (message.type === 'response' && message.data) {
            // 处理响应消息
            if (message.data.engineInfo) {
              engineDetected.value = true;
              engineInfo.value = message.data.engineInfo;
              connectionStatus.value = 'Connected';
              lastUpdateTime.value = new Date().toLocaleString();
            } else if (message.data.detected !== undefined) {
              // 处理检测结果响应
              engineDetected.value = message.data.detected;
              if (message.data.engineInfo) {
                engineInfo.value = message.data.engineInfo;
              }
              connectionStatus.value = 'Connected';
              lastUpdateTime.value = new Date().toLocaleString();
            }
          }
          
          if (message.type === 'debug' && message.data) {
            // 处理调试消息
            console.log('Debug message received:', message.data);
          }
        });
        
        port.onDisconnect.addListener(() => {
          console.log('DevTools port disconnected');
          connectionStatus.value = 'Disconnected';
          port = null;
        });
        
        connectionStatus.value = 'Connecting...';
        console.log('DevTools connected to background script');
      } catch (error) {
        console.error('Failed to connect to background script:', error);
        connectionStatus.value = 'Connection Failed';
      }
    };

    onMounted(() => {
      console.log("Egret Inspector DevTools Panel mounted!");
      updateTime();
      timer = setInterval(updateTime, 1000);
      
      // 连接到后台脚本
      connectToBackground();
      
      // 延迟获取引擎信息，确保连接建立
      setTimeout(() => {
        if (port) {
          refreshEngineInfo();
        }
      }, 1000);
    });

    onUnmounted(() => {
      if (timer) {
        clearInterval(timer);
      }
      if (port) {
        port.disconnect();
      }
    });

    return {
      count,
      isDarkTheme,
      currentTime,
      title,
      description,
      greeting,
      buttonText,
      themeButtonText,
      infoLabel,
      versionLabel,
      panelTypeLabel,
      extensionInfo,
      version,
      panelType,
      engineDetected,
      engineInfo,
      connectionStatus,
      lastUpdateTime,
      toggleTheme,
      refreshEngineInfo,
      formatTime,
    };
  },
});
</script>

<style scoped lang="less">
.devtools-panel {
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  height: 100vh;
  overflow-y: auto;
  
  .header {
    text-align: center;
    margin-bottom: 30px;
    
    h2 {
      color: #333;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    
    p {
      color: #666;
      margin: 0;
      font-size: 14px;
    }
  }
  
  .content {
    .engine-info {
      background: #e8f5e8;
      border: 2px solid #4caf50;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      
      h3 {
        color: #2e7d32;
        margin: 0 0 15px 0;
        font-size: 18px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .engine-details {
        p {
          margin: 8px 0;
          font-size: 14px;
          color: #333;
          
          strong {
            color: #2e7d32;
            min-width: 120px;
            display: inline-block;
          }
        }
      }
    }
    
    .no-engine {
      background: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      text-align: center;
      
      h3 {
        color: #856404;
        margin: 0 0 15px 0;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      p {
        color: #856404;
        margin: 5px 0;
        font-size: 14px;
      }
    }
    
    .status-info {
      background: #e3f2fd;
      border: 2px solid #2196f3;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      
      h3 {
        color: #1976d2;
        margin: 0 0 15px 0;
        font-size: 18px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      p {
        margin: 8px 0;
        font-size: 14px;
        color: #333;
        
        strong {
          color: #1976d2;
          min-width: 120px;
          display: inline-block;
        }
      }
    }
    
    .interactions {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-bottom: 30px;
      
      button {
        min-width: 120px;
      }
    }
    
    .info {
      background: #f3e5f5;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #9c27b0;
      
      p {
        margin: 5px 0;
        font-size: 13px;
        color: #333;
        
        strong {
          color: #7b1fa2;
        }
      }
    }
  }
}
</style> 