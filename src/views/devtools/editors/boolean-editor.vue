<template>
  <div class="boolean-editor">
    <label class="checkbox-label">
      <input
        type="checkbox"
        :checked="value"
        @change="handleChange"
        class="checkbox-input"
      />
      <span class="checkbox-custom"></span>
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
      emit('update', target.checked);
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
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkbox-custom {
  height: 16px;
  width: 16px;
  background-color: #1e1e1e;
  border: 1px solid #3e3e42;
  border-radius: 3px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-custom:after {
  content: "";
  position: absolute;
  display: none;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid #4caf50;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-input:checked ~ .checkbox-custom {
  background-color: #4caf50;
  border-color: #4caf50;
}

.checkbox-input:checked ~ .checkbox-custom:after {
  display: block;
}

.checkbox-input:focus ~ .checkbox-custom {
  border-color: #4caf50;
}
</style> 