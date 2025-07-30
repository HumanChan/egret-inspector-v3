<template>
  <div class="popup">
    <div class="header">
      <h3>{{ title }}</h3>
    </div>
    <div class="content">
      <p>{{ message }}</p>
      <CCButton @click="openPanel" type="primary">
        {{ buttonText }}
      </CCButton>
    </div>
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, ref } from "vue";

const { CCButton } = ccui.components;

export default defineComponent({
  name: "Popup",
  components: { CCButton },
  setup() {
    const title = ref("Hello World Extension");
    const message = ref("Welcome to your Chrome extension!");
    const buttonText = ref("Open Panel");

    const openPanel = () => {
      console.log("Opening panel from popup");
      // 这里可以添加打开面板的逻辑
    };

    return {
      title,
      message,
      buttonText,
      openPanel,
    };
  },
});
</script>

<style scoped lang="less">
.popup {
  width: 300px;
  padding: 20px;
  
  .header {
    text-align: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: #333;
    }
  }
  
  .content {
    text-align: center;
    
    p {
      margin-bottom: 15px;
      color: #666;
    }
  }
}
</style> 