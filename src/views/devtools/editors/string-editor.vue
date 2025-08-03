<template>
  <div class="string-editor">
    <input
      type="text"
      :value="value"
      @blur="handleBlur"
      @keydown="handleKeydown"
      class="string-input"
      :placeholder="getPlaceholder()"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Property } from '../data';

export default defineComponent({
  name: 'StringEditor',
  props: {
    property: {
      type: Object as PropType<Property>,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const getPlaceholder = () => {
      const name = props.property.name;
      if (name === 'name') return 'Enter object name';
      if (name === 'blendMode') return 'normal, add, multiply...';
      return 'Enter value';
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        const target = event.target as HTMLInputElement;
        emit('update', target.value);
        target.blur(); // 失去焦点
      }
    };

    const handleBlur = (event: Event) => {
      const target = event.target as HTMLInputElement;
      emit('update', target.value);
    };

    return {
      getPlaceholder,
      handleKeydown,
      handleBlur
    };
  }
});
</script>

<style scoped>
.string-editor {
  width: 100%;
}

.string-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #3e3e42;
  border-radius: 3px;
  background: #1e1e1e;
  color: #cccccc;
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.string-input:focus {
  outline: none;
  border-color: #4caf50;
  background: #2d2d30;
}

.string-input::placeholder {
  color: #666;
}
</style> 