<template>
  <div class="color-editor">
    <CCColor 
      :color="colorValue"
      @change="handleColorChange"
      class="color-picker-component"
    />
    <input
      type="text"
      :value="hexValue"
      @blur="handleHexBlur"
      @keydown="handleKeydown"
      class="color-input"
      placeholder="#000000"
    />
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, PropType, computed } from 'vue';
import { Property } from '../data';

const { CCColor } = ccui.components;

export default defineComponent({
  name: 'ColorEditor',
  components: { CCColor },
  props: {
    property: {
      type: Object as PropType<Property>,
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    // 将数值转换为颜色值
    const colorValue = computed(() => {
      let colorNum = 0;
      
      // 处理不同的颜色值格式
      if (typeof props.value === 'number') {
        colorNum = props.value;
      } else if (typeof props.value === 'string') {
        const strValue = props.value as string;
        // 如果是字符串格式，尝试解析
        if (strValue.startsWith('#')) {
          colorNum = parseInt(strValue.substring(1), 16);
        } else if (strValue.startsWith('0x')) {
          colorNum = parseInt(strValue.substring(2), 16);
        } else {
          colorNum = parseInt(strValue, 16);
        }
      }
      
      // 确保颜色值在有效范围内
      if (isNaN(colorNum) || colorNum < 0) colorNum = 0;
      if (colorNum > 0xFFFFFF) colorNum = 0xFFFFFF;
      
      const hex = colorNum.toString(16).padStart(6, '0');
      return `#${hex}`;
    });

    // 将数值转换为十六进制显示值
    const hexValue = computed(() => {
      let colorNum = 0;
      
      // 处理不同的颜色值格式
      if (typeof props.value === 'number') {
        colorNum = props.value;
      } else if (typeof props.value === 'string') {
        const strValue = props.value as string;
        // 如果是字符串格式，尝试解析
        if (strValue.startsWith('#')) {
          colorNum = parseInt(strValue.substring(1), 16);
        } else if (strValue.startsWith('0x')) {
          colorNum = parseInt(strValue.substring(2), 16);
        } else {
          colorNum = parseInt(strValue, 16);
        }
      }
      
      // 确保颜色值在有效范围内
      if (isNaN(colorNum) || colorNum < 0) colorNum = 0;
      if (colorNum > 0xFFFFFF) colorNum = 0xFFFFFF;
      
      const hex = colorNum.toString(16).padStart(6, '0');
      return `#${hex}`;
    });

    // 将数值转换为RGB值
    const rgbValue = computed(() => {
      const r = (props.value >> 16) & 0xFF;
      const g = (props.value >> 8) & 0xFF;
      const b = props.value & 0xFF;
      return `rgb(${r}, ${g}, ${b})`;
    });

    const handleHexBlur = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const hexValue = target.value.trim();
      
      // 验证十六进制格式
      if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
        const hex = hexValue.substring(1); // 移除#前缀
        const newValue = parseInt(hex, 16);
        emit('update', newValue);
      } else if (/^[0-9A-Fa-f]{6}$/.test(hexValue)) {
        // 如果没有#前缀，自动添加
        const newValue = parseInt(hexValue, 16);
        emit('update', newValue);
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        const target = event.target as HTMLInputElement;
        const hexValue = target.value.trim();
        
        if (/^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
          const hex = hexValue.substring(1);
          const newValue = parseInt(hex, 16);
          emit('update', newValue);
        } else if (/^[0-9A-Fa-f]{6}$/.test(hexValue)) {
          const newValue = parseInt(hexValue, 16);
          emit('update', newValue);
        }
        target.blur();
      }
    };

    const handleColorChange = (color: string) => {
      const hexValue = color.substring(1); // 移除#前缀
      const newValue = parseInt(hexValue, 16);
      emit('update', newValue);
    };

    return {
      colorValue,
      hexValue,
      rgbValue,
      handleHexBlur,
      handleKeydown,
      handleColorChange
    };
  }
});
</script>

<style scoped>
.color-editor {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.color-picker-component {
  flex-shrink: 0;
}

.color-input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #3e3e42;
  border-radius: 3px;
  background: #1e1e1e;
  color: #cccccc;
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.color-input:focus {
  outline: none;
  border-color: #4caf50;
  background: #2d2d30;
}
</style> 