<template>
  <div class="object-editor">
    <div class="object-preview" @click="toggleExpanded">
      <span class="object-type">{{ getObjectType() }}</span>
      <span class="object-keys">{{ getObjectKeys() }}</span>
      <span class="expand-icon">{{ isExpanded ? '▼' : '▶' }}</span>
    </div>
    
    <div v-if="isExpanded" class="object-content">
      <div class="object-properties">
        <div 
          v-for="(value, key) in objectValue" 
          :key="key"
          class="object-property"
        >
          <span class="property-key">{{ key }}:</span>
          <span class="property-value">{{ formatValue(value) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue';
import { Property } from '../data';

export default defineComponent({
  name: 'ObjectEditor',
  props: {
    property: {
      type: Object as PropType<Property>,
      required: true
    },
    value: {
      type: [Object, String],
      required: true
    }
  },
  emits: ['update'],
  setup(props) {
    const isExpanded = ref(false);

    const objectValue = computed(() => {
      if (typeof props.value === 'object' && props.value !== null) {
        return props.value;
      }
      return {};
    });

    const getObjectType = () => {
      if (typeof props.value === 'object' && props.value !== null) {
        return props.value.constructor?.name || 'Object';
      }
      return 'Object';
    };

    const getObjectKeys = () => {
      if (typeof props.value === 'object' && props.value !== null) {
        const keys = Object.keys(props.value);
        return keys.length > 0 ? `{${keys.length} properties}` : '{empty}';
      }
      return '{empty}';
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
      objectValue,
      getObjectType,
      getObjectKeys,
      formatValue,
      toggleExpanded
    };
  }
});
</script>

<style scoped>
.object-editor {
  width: 100%;
}

.object-preview {
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

.object-preview:hover {
  background: #2d2d30;
}

.object-type {
  font-size: 12px;
  color: #4caf50;
  font-weight: 500;
}

.object-keys {
  flex: 1;
  font-size: 11px;
  color: #888;
}

.expand-icon {
  font-size: 10px;
  color: #666;
}

.object-content {
  margin-top: 4px;
  padding: 8px;
  background: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 3px;
}

.object-properties {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.object-property {
  display: flex;
  gap: 8px;
  font-size: 11px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.property-key {
  color: #4caf50;
  font-weight: 500;
  min-width: 60px;
}

.property-value {
  color: #cccccc;
  flex: 1;
}
</style> 