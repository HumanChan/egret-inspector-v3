<template>
  <div class="boolean-editor">
    <label class="toggle-label">
      <input
        type="checkbox"
        :checked="value"
        @change="handleChange"
        @blur="handleBlur"
        class="toggle-input"
      />
      <span class="toggle-slider">
        <span class="toggle-thumb"></span>
      </span>
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Property } from '../data';

export default defineComponent({
  name: 'BooleanEditor',
  props: {
    property: {
      type: Object as PropType<Property>,
      required: true
    },
    value: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const handleChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      // 立即更新值，提供即时反馈
      emit('update', target.checked);
    };

    const handleBlur = (event: Event) => {
      const target = event.target as HTMLInputElement;
      emit('update', target.checked);
    };

    return {
      handleChange,
      handleBlur
    };
  }
});
</script>

<style scoped>
.boolean-editor {
  width: 100%;
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.toggle-slider {
  position: relative;
  width: 36px;
  height: 20px;
  background-color: #3e3e42;
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid #555;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background-color: #888;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.toggle-input:checked ~ .toggle-slider {
  background-color: #4caf50;
  border-color: #4caf50;
}

.toggle-input:checked ~ .toggle-slider .toggle-thumb {
  transform: translateX(16px);
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.toggle-input:focus ~ .toggle-slider {
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
}

.toggle-input:hover ~ .toggle-slider {
  border-color: #4caf50;
}

.toggle-input:hover ~ .toggle-slider .toggle-thumb {
  background-color: #aaa;
}

.toggle-input:checked:hover ~ .toggle-slider .toggle-thumb {
  background-color: #f0f0f0;
}
</style> 