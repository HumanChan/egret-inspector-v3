<template>
  <div class="boolean-editor">
    <CCCheckbox 
      :value="value"
      :label="property.name"
      @change="handleChange"
    />
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, PropType } from 'vue';
import { Property } from '../data';

const { CCCheckbox } = ccui.components;

export default defineComponent({
  name: 'BooleanEditor',
  components: { CCCheckbox },
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
    const handleChange = (checked: boolean) => {
      emit('update', checked);
    };

    return {
      handleChange
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
</style> 