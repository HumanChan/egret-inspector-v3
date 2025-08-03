<template>
  <div class="number-editor">
    <input
      type="number"
      :value="value"
      @blur="handleBlur"
      @keydown="handleKeydown"
      class="number-input"
      :step="getStep()"
      :min="getMin()"
      :max="getMax()"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Property } from '../data';

export default defineComponent({
  name: 'NumberEditor',
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
    const getStep = () => {
      const name = props.property.name;
      if (name === 'rotation') return 1;
      if (name === 'alpha') return 0.1;
      if (name === 'scaleX' || name === 'scaleY') return 0.1;
      return 1;
    };

    const getMin = () => {
      const name = props.property.name;
      if (name === 'width' || name === 'height') return 0;
      if (name === 'alpha') return 0;
      return undefined;
    };

    const getMax = () => {
      const name = props.property.name;
      if (name === 'alpha') return 1;
      return undefined;
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        const target = event.target as HTMLInputElement;
        const newValue = parseFloat(target.value);
        if (!isNaN(newValue)) {
          emit('update', newValue);
        }
        target.blur(); // 失去焦点
      }
    };

    const handleBlur = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const newValue = parseFloat(target.value);
      if (!isNaN(newValue)) {
        emit('update', newValue);
      }
    };

    return {
      getStep,
      getMin,
      getMax,
      handleKeydown,
      handleBlur
    };
  }
});
</script>

<style scoped>
.number-editor {
  width: 100%;
}

.number-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #3e3e42;
  border-radius: 3px;
  background: #1e1e1e;
  color: #cccccc;
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.number-input:focus {
  outline: none;
  border-color: #4caf50;
  background: #2d2d30;
}

.number-input::-webkit-inner-spin-button,
.number-input::-webkit-outer-spin-button {
  opacity: 1;
}
</style> 