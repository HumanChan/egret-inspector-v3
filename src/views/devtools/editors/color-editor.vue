<template>
  <div class="color-editor">
    <div class="color-preview" 
         :style="{ backgroundColor: colorValue }"
         @click="showColorPicker = !showColorPicker">
    </div>
    <input
      type="number"
      :value="value"
      @blur="handleBlur"
      @keydown="handleKeydown"
      class="color-input"
      :min="0"
      :max="0xFFFFFF"
    />
    <div v-if="showColorPicker" class="color-picker-overlay" @click="closeColorPicker">
      <div class="color-picker" @click.stop>
        <input
          type="color"
          :value="colorValue"
          @input="handleColorChange"
          class="color-picker-input"
        />
        <div class="color-picker-info">
          <span>HEX: {{ colorValue }}</span>
          <span>RGB: {{ rgbValue }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue';
import { Property } from '../data';

export default defineComponent({
  name: 'ColorEditor',
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
    const showColorPicker = ref(false);

    // 将数值转换为颜色值
    const colorValue = computed(() => {
      const hex = props.value.toString(16).padStart(6, '0');
      return `#${hex}`;
    });

    // 将数值转换为RGB值
    const rgbValue = computed(() => {
      const r = (props.value >> 16) & 0xFF;
      const g = (props.value >> 8) & 0xFF;
      const b = props.value & 0xFF;
      return `rgb(${r}, ${g}, ${b})`;
    });

    const handleBlur = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const newValue = parseInt(target.value);
      if (!isNaN(newValue)) {
        emit('update', newValue);
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        const target = event.target as HTMLInputElement;
        const newValue = parseInt(target.value);
        if (!isNaN(newValue)) {
          emit('update', newValue);
        }
        target.blur(); // 失去焦点
      }
    };

    const handleColorChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const hexValue = target.value.substring(1); // 移除#前缀
      const newValue = parseInt(hexValue, 16);
      emit('update', newValue);
    };

    const closeColorPicker = () => {
      showColorPicker.value = false;
      // 确保在关闭时触发一次更新，以防颜色选择器的值没有正确同步
      emit('update', props.value);
    };

    return {
      showColorPicker,
      colorValue,
      rgbValue,
      handleBlur,
      handleKeydown,
      handleColorChange,
      closeColorPicker
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

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid #3e3e42;
  cursor: pointer;
  transition: border-color 0.2s;
  flex-shrink: 0;
}

.color-preview:hover {
  border-color: #4caf50;
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

.color-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-picker {
  background: #2d2d30;
  border: 1px solid #3e3e42;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
}

.color-picker-input {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.color-picker-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #cccccc;
}

.color-picker-info span {
  font-family: 'Consolas', 'Monaco', monospace;
}
</style> 