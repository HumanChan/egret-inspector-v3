<template>
  <div class="property-item" :class="{ readonly: property.readonly }">
    <div class="property-name">{{ property.name }}</div>
    <div class="property-value">
      <component 
        :is="editorComponent" 
        :property="property"
        :value="property.value"
        @update="handleUpdate"
      />
    </div>
    <div class="property-type">{{ property.type }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { Property, DataType } from './data';
import NumberEditor from './editors/number-editor.vue';
import BooleanEditor from './editors/boolean-editor.vue';
import StringEditor from './editors/string-editor.vue';
import ObjectEditor from './editors/object-editor.vue';
import ArrayEditor from './editors/array-editor.vue';

export default defineComponent({
  name: 'PropertyItem',
  components: {
    NumberEditor,
    BooleanEditor,
    StringEditor,
    ObjectEditor,
    ArrayEditor
  },
  props: {
    property: {
      type: Object as PropType<Property>,
      required: true
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const editorComponent = computed(() => {
      if (props.property.readonly) {
        return 'div'; // 只读属性显示为普通文本
      }
      
      switch (props.property.type) {
        case DataType.Number:
          return 'NumberEditor';
        case DataType.Boolean:
          return 'BooleanEditor';
        case DataType.String:
          return 'StringEditor';
        case DataType.Object:
          return 'ObjectEditor';
        case DataType.Array:
          return 'ArrayEditor';
        default:
          return 'StringEditor';
      }
    });

    const handleUpdate = (newValue: any) => {
      emit('update', props.property, newValue);
    };

    return {
      editorComponent,
      handleUpdate
    };
  }
});
</script>

<style scoped>
.property-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #3e3e42;
  transition: background-color 0.2s;
}

.property-item:hover {
  background-color: #2d2d30;
}

.property-item.readonly {
  opacity: 0.7;
}

.property-name {
  flex: 0 0 120px;
  font-size: 12px;
  color: #cccccc;
  font-weight: 500;
}

.property-value {
  flex: 1;
  margin: 0 12px;
}

.property-type {
  flex: 0 0 60px;
  font-size: 10px;
  color: #888;
  text-align: right;
}
</style> 