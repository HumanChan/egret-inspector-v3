<template>
  <div class="devtools-panel">
    <div class="header">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
    
    <div class="content">
      <div class="message">
        <h3>{{ greeting }}</h3>
        <p>{{ currentTime }}</p>
      </div>
      
      <div class="interactions">
        <CCButton @click="incrementCount" type="primary">
          {{ buttonText }} ({{ count }})
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

export default defineComponent({
  name: "DevtoolsPanel",
  components: { CCButton },
  setup() {
    const count = ref(0);
    const isDarkTheme = ref(false);
    const currentTime = ref("");
    const title = ref("Hello World DevTools Panel");
    const description = ref("Welcome to your Chrome DevTools extension!");
    const greeting = ref("Hello from Chrome DevTools!");
    const buttonText = ref("Click Me");
    const themeButtonText = ref("Toggle Theme");
    const infoLabel = ref("Extension Name");
    const versionLabel = ref("Version");
    const panelTypeLabel = ref("Panel Type");
    const extensionInfo = ref(PluginConfig.manifest.name);
    const version = ref(PluginConfig.manifest.version);
    const panelType = ref("DevTools Panel");

    let timer: NodeJS.Timeout;

    const updateTime = () => {
      currentTime.value = new Date().toLocaleString();
    };

    const incrementCount = () => {
      count.value++;
      console.log(`DevTools Panel: Button clicked ${count.value} times`);
    };

    const toggleTheme = () => {
      isDarkTheme.value = !isDarkTheme.value;
      themeButtonText.value = isDarkTheme.value ? "Light Theme" : "Dark Theme";
      console.log(`DevTools Panel: Theme toggled to ${isDarkTheme.value ? 'dark' : 'light'}`);
    };

    onMounted(() => {
      console.log("Hello World DevTools Panel mounted!");
      updateTime();
      timer = setInterval(updateTime, 1000);
    });

    onUnmounted(() => {
      if (timer) {
        clearInterval(timer);
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
      incrementCount,
      toggleTheme,
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
    .message {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      
      h3 {
        color: #2196f3;
        margin: 0 0 10px 0;
        font-size: 18px;
      }
      
      p {
        color: #666;
        margin: 0;
        font-size: 14px;
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
      background: #e3f2fd;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #2196f3;
      
      p {
        margin: 5px 0;
        font-size: 13px;
        color: #333;
        
        strong {
          color: #1976d2;
        }
      }
    }
  }
}
</style> 