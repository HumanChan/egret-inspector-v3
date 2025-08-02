<template>
  <div class="array-editor">
    <div class="array-preview" @click="toggleExpanded">
      <span class="array-type">Array</span>
      <span class="array-length">{{ getArrayLength() }}</span>
      <span class="expand-icon">{{ isExpanded ? '▼' : '▶' }}</span>
    </div>
    
    <div v-if="isExpanded" class="array-content">
      <div class="array-items">
        <div 
          v-for="(item, index) in arrayValue" 
          :key="index"
          class="array-item"
        >
          <span class="item-index">[{{ index }}]:</span>
          <span class="item-value">{{ formatValue(item) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue';
import { Property } from '../data';

export default defineComponent({
  name: 'ArrayEditor',
  props: {
    property: {
      type: Object as PropType<Property>,
      required: true
    },
    value: {
      type: [Array, String],
      required: true
    }
  },
  emits: ['update'],
  setup(props) {
    const isExpanded = ref(false);

    const arrayValue = computed(() => {
      if (Array.isArray(props.value)) {
        return props.value;
      }
      return [];
    });

    const getArrayLength = () => {
      if (Array.isArray(props.value)) {
        return `[${props.value.length} items]`;
      }
      return '[0 items]';
    };

    const formatValue = (value: any) => {
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';
      if (typeof value === 'string') return `"${value}"`;
      if (typeof value === 'number') return value;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          return `[${value.length} items]`;
        }
        return `{${Object.keys(value).length} properties}`;
      }
      return String(value);
    };

    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value;
    };

    return {
      isExpanded,
      arrayValue,
      getArrayLength,
      formatValue,
      toggleExpanded
    };
  }
});
</script>

<style scoped>
.array-editor {
  width: 100%;
}

.array-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border: 1px solid #3e3e42;
  border-radius: 3px;
  background: #1e1e1e;
  cursor: pointer;
  transition: background-color 0.2s;
}

.array-preview:hover {
  background: #2d2d30;
}

.array-type {
  font-size: 12px;
  color: #ff9800;
  font-weight: 500;
}

.array-length {
  flex: 1;
  font-size: 11px;
  color: #888;
}

.expand-icon {
  font-size: 10px;
  color: #666;
}

.array-content {
  margin-top: 4px;
  padding: 8px;
  background: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 3px;
}

.array-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.array-item {
  display: flex;
  gap: 8px;
  font-size: 11px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.item-index {
  color: #ff9800;
  font-weight: 500;
  min-width: 40px;
}

.item-value {
  color: #cccccc;
  flex: 1;
}
</style> 