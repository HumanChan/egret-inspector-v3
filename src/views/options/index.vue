<template>
  <div class="options">
    <div class="header">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h3>{{ settingsTitle }}</h3>
        <div class="setting-item">
          <label>{{ themeLabel }}</label>
          <CCButton @click="toggleTheme" type="secondary">
            {{ currentTheme }}
          </CCButton>
        </div>
        
        <div class="setting-item">
          <label>{{ languageLabel }}</label>
          <CCButton @click="toggleLanguage" type="secondary">
            {{ currentLanguage }}
          </CCButton>
        </div>
      </div>
      
      <div class="section">
        <h3>{{ infoTitle }}</h3>
        <div class="info-item">
          <strong>{{ nameLabel }}:</strong> {{ extensionName }}
        </div>
        <div class="info-item">
          <strong>{{ versionLabel }}:</strong> {{ version }}
        </div>
        <div class="info-item">
          <strong>{{ authorLabel }}:</strong> {{ author }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, ref } from "vue";
import PluginConfig from "../../../cc-plugin.config";

const { CCButton } = ccui.components;

export default defineComponent({
  name: "Options",
  components: { CCButton },
  setup() {
    const title = ref("Hello World Extension Options");
    const description = ref("Configure your extension settings");
    const settingsTitle = ref("Settings");
    const infoTitle = ref("Extension Information");
    const themeLabel = ref("Theme");
    const languageLabel = ref("Language");
    const nameLabel = ref("Name");
    const versionLabel = ref("Version");
    const authorLabel = ref("Author");
    
    const currentTheme = ref("Light");
    const currentLanguage = ref("English");
    const extensionName = ref(PluginConfig.manifest.name);
    const version = ref(PluginConfig.manifest.version);
    const author = ref(PluginConfig.manifest.author);

    const toggleTheme = () => {
      currentTheme.value = currentTheme.value === "Light" ? "Dark" : "Light";
      console.log(`Theme changed to ${currentTheme.value}`);
    };

    const toggleLanguage = () => {
      currentLanguage.value = currentLanguage.value === "English" ? "中文" : "English";
      console.log(`Language changed to ${currentLanguage.value}`);
    };

    return {
      title,
      description,
      settingsTitle,
      infoTitle,
      themeLabel,
      languageLabel,
      nameLabel,
      versionLabel,
      authorLabel,
      currentTheme,
      currentLanguage,
      extensionName,
      version,
      author,
      toggleTheme,
      toggleLanguage,
    };
  },
});
</script>

<style scoped lang="less">
.options {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  
  .header {
    text-align: center;
    margin-bottom: 40px;
    
    h2 {
      color: #333;
      margin: 0 0 10px 0;
    }
    
    p {
      color: #666;
      margin: 0;
    }
  }
  
  .content {
    .section {
      margin-bottom: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
      
      h3 {
        color: #333;
        margin: 0 0 20px 0;
        font-size: 18px;
      }
      
      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        label {
          font-weight: 500;
          color: #555;
        }
      }
      
      .info-item {
        margin-bottom: 10px;
        color: #666;
        
        strong {
          color: #333;
        }
      }
    }
  }
}
</style> 