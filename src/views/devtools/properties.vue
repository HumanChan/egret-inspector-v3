<template>
  <div class="properties-panel">
    <div class="properties-header">
      <h3>Properties</h3>
      <div class="node-info" v-if="selectedNode">
        <span class="node-name">{{ selectedNode.name }}</span>
        <span class="node-type">{{ selectedNode.type }}</span>
      </div>
    </div>
    
    <div class="properties-content">
      <div v-if="!selectedNode" class="no-selection">
        Select a node to view properties
      </div>
      
      <div v-else-if="properties.length === 0" class="no-properties">
        No properties available
      </div>
      
      <div v-else class="property-groups">
        <!-- Transform Properties -->
        <div v-if="transformProperties.length > 0" class="property-group">
          <div class="group-header">
            <span class="group-title">Transform</span>
          </div>
          <div class="group-content">
            <PropertyItem 
              v-for="prop in transformProperties" 
              :key="prop.name"
              :property="prop"
              @update="updateProperty"
            />
          </div>
        </div>
        
        <!-- Display Properties -->
        <div v-if="displayProperties.length > 0" class="property-group">
          <div class="group-header">
            <span class="group-title">Display</span>
          </div>
          <div class="group-content">
            <PropertyItem 
              v-for="prop in displayProperties" 
              :key="prop.name"
              :property="prop"
              @update="updateProperty"
            />
          </div>
        </div>
        
        <!-- Layout Properties -->
        <div v-if="layoutProperties.length > 0" class="property-group">
          <div class="group-header">
            <span class="group-title">Layout</span>
          </div>
          <div class="group-content">
            <PropertyItem 
              v-for="prop in layoutProperties" 
              :key="prop.name"
              :property="prop"
              @update="updateProperty"
            />
          </div>
        </div>
        
        <!-- Interaction Properties -->
        <div v-if="interactionProperties.length > 0" class="property-group">
          <div class="group-header">
            <span class="group-title">Interaction</span>
          </div>
          <div class="group-content">
            <PropertyItem 
              v-for="prop in interactionProperties" 
              :key="prop.name"
              :property="prop"
              @update="updateProperty"
            />
          </div>
        </div>
        
        <!-- Container Properties -->
        <div v-if="containerProperties.length > 0" class="property-group">
          <div class="group-header">
            <span class="group-title">Container</span>
          </div>
          <div class="group-content">
            <PropertyItem 
              v-for="prop in containerProperties" 
              :key="prop.name"
              :property="prop"
              @update="updateProperty"
            />
          </div>
        </div>
        
        <!-- Custom Properties -->
        <div v-if="customProperties.length > 0" class="property-group">
          <div class="group-header">
            <span class="group-title">Custom</span>
          </div>
          <div class="group-content">
            <PropertyItem 
              v-for="prop in customProperties" 
              :key="prop.name"
              :property="prop"
              @update="updateProperty"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { Property } from './data';
import PropertyItem from './property-item.vue';

export default defineComponent({
  name: 'Properties',
  components: {
    PropertyItem
  },
  props: {
    selectedNode: {
      type: Object as PropType<any>,
      default: null
    },
    properties: {
      type: Array as PropType<Property[]>,
      default: () => []
    }
  },
  emits: ['property-update'],
  setup(props, { emit }) {
    // 调试信息
    console.log('Properties component props:', props);
    console.log('selectedNode:', props.selectedNode);
    console.log('properties:', props.properties);
    
    // 属性分类
    const transformProperties = computed(() => {
      const result = props.properties.filter(prop => 
        ['$x', '$y', '$scaleX', '$scaleY', '$rotation', '$skewX', '$skewY', '$anchorOffsetX', '$anchorOffsetY', 
         'x', 'y', 'scaleX', 'scaleY', 'rotation', 'anchorOffsetX', 'anchorOffsetY'].includes(prop.name)
      );
      console.log('Transform properties:', result);
      return result;
    });

    const displayProperties = computed(() => {
      const result = props.properties.filter(prop => 
        ['$alpha', '$visible', '$blendMode', '$tintRGB', '_tint', 'alpha', 'visible', 'blendMode', 'color', 'text'].includes(prop.name)
      );
      console.log('Display properties:', result);
      return result;
    });

    const layoutProperties = computed(() => {
      const result = props.properties.filter(prop => 
        ['$mask', '$scrollRect', '$cacheAsBitmap', '$cacheDirty', 'mask', 'scrollRect', 'cacheAsBitmap'].includes(prop.name)
      );
      console.log('Layout properties:', result);
      return result;
    });

    const interactionProperties = computed(() => {
      const result = props.properties.filter(prop => 
        ['$touchEnabled', '$inputEnabled', 'touchEnabled', 'inputEnabled'].includes(prop.name)
      );
      console.log('Interaction properties:', result);
      return result;
    });

    const containerProperties = computed(() => {
      const result = props.properties.filter(prop => 
        ['$children', '$parent', '$stage', '$nestLevel', 'children', 'parent', 'stage'].includes(prop.name)
      );
      console.log('Container properties:', result);
      return result;
    });

    const customProperties = computed(() => {
      const standardProps = [
        // Transform properties
        '$x', '$y', '$scaleX', '$scaleY', '$rotation', '$skewX', '$skewY', '$anchorOffsetX', '$anchorOffsetY',
        'x', 'y', 'scaleX', 'scaleY', 'rotation', 'anchorOffsetX', 'anchorOffsetY',
        // Display properties
        '$alpha', '$visible', '$blendMode', '$tintRGB', '_tint', 'alpha', 'visible', 'blendMode', 'color', 'text',
        // Layout properties
        '$mask', '$scrollRect', '$cacheAsBitmap', '$cacheDirty', 'mask', 'scrollRect', 'cacheAsBitmap',
        // Interaction properties
        '$touchEnabled', '$inputEnabled', 'touchEnabled', 'inputEnabled',
        // Container properties
        '$children', '$parent', '$stage', '$nestLevel', 'children', 'parent', 'stage'
      ];
      const result = props.properties.filter(prop => !standardProps.includes(prop.name));
      console.log('Custom properties:', result);
      return result;
    });

    const updateProperty = (property: Property, newValue: any) => {
      emit('property-update', property, newValue);
    };

    return {
      transformProperties,
      displayProperties,
      layoutProperties,
      interactionProperties,
      containerProperties,
      customProperties,
      updateProperty
    };
  }
});
</script>

<style scoped>
.properties-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #252526;
  color: #cccccc;
  min-height: 0;
}

.properties-header {
  padding: 12px 16px;
  border-bottom: 1px solid #3e3e42;
  background: #2d2d30;
}

.properties-header h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #cccccc;
}

.node-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.node-name {
  font-weight: 500;
  color: #4caf50;
}

.node-type {
  color: #888;
}

.properties-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  min-height: 0;
  max-height: 100%;
}

.no-selection,
.no-properties {
  padding: 20px;
  text-align: center;
  color: #888;
  font-size: 12px;
}

.property-groups {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.property-group {
  border-bottom: 1px solid #3e3e42;
  padding-bottom: 8px;
}

.group-header {
  padding: 8px 16px;
  background: #2d2d30;
  border-bottom: 1px solid #3e3e42;
}

.group-title {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.group-content {
  padding: 4px 0;
}
</style> 