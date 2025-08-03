<template>
  <div class="properties-panel">
    <div class="properties-header">
      <div class="header-top">
        <h3>Properties</h3>
        <div class="toggle-controls">
          <label class="toggle-control">
            <input
              type="checkbox"
              v-model="showInternal"
              class="toggle-input"
            />
            <span class="toggle-slider">
              <span class="toggle-thumb"></span>
            </span>
            <span class="toggle-label">Internal</span>
          </label>
          <label class="toggle-control">
            <input
              type="checkbox"
              v-model="showFunctions"
              class="toggle-input"
            />
            <span class="toggle-slider">
              <span class="toggle-thumb"></span>
            </span>
            <span class="toggle-label">Functions</span>
          </label>
        </div>
      </div>
      <div class="node-info" v-if="selectedNode">
        <span class="node-name">{{ selectedNode.name }}</span>
        <span class="node-type">{{ selectedNode.type }}</span>
      </div>
      
      <!-- 搜索输入框 -->
      <div class="search-container">
        <input 
          v-model="searchKeyword"
          @input="handleSearch"
          placeholder="Search properties..."
          class="search-input"
        />
        <button 
          v-if="searchKeyword"
          @click="clearSearch"
          class="clear-button"
          title="Clear search"
        >
          ×
        </button>
      </div>
    </div>
    
    <div class="properties-content">
      <div v-if="!selectedNode" class="no-selection">
        Select a node to view properties
      </div>
      
      <div v-else-if="properties.length === 0" class="no-properties">
        No properties available
      </div>
      
      <div v-else-if="searchKeyword && !hasSearchResults" class="no-results">
        No properties match "{{ searchKeyword }}"
      </div>
      
      <div v-else class="property-groups">
        <!-- Internal Properties -->
        <div v-if="internalProperties.length > 0" class="property-group internal-group">
          <div class="group-header">
            <span class="group-title">Internal</span>
          </div>
          <div class="group-content">
            <PropertyItem 
              v-for="prop in internalProperties" 
              :key="prop.name"
              :property="prop"
              @update="updateProperty"
            />
          </div>
        </div>
        
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
        
        <!-- Function Properties -->
        <div v-if="functionProperties.length > 0" class="property-group">
          <div class="group-header">
            <span class="group-title">Functions</span>
          </div>
          <div class="group-content">
            <PropertyItem 
              v-for="prop in functionProperties" 
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
import { defineComponent, computed, ref, PropType, watch } from 'vue';
import { Property, DataType } from './data';
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
    // 搜索状态
    const searchKeyword = ref('');
    
    // 显示控制状态
    const showInternal = ref(false);
    const showFunctions = ref(false);
    
    // 监听toggle状态变化
    watch(showInternal, (newValue) => {
      // Show Internal changed
    });
    
    watch(showFunctions, (newValue) => {
      // Show Functions changed
    });
    
    // 调试信息
    // Properties component props
    // selectedNode and properties info
    
    // 搜索处理函数
    const handleSearch = () => {
      // 搜索逻辑在computed属性中处理
      // Search keyword
    };
    
    // 清空搜索
    const clearSearch = () => {
      searchKeyword.value = '';
    };
    
    // 属性过滤函数
    const filterProperties = (properties: Property[], keyword: string) => {
      if (!keyword.trim()) return properties;
      const lowerKeyword = keyword.toLowerCase();
      return properties.filter(prop => 
        prop.name.toLowerCase().includes(lowerKeyword)
      );
    };
    
    // 检查是否有搜索结果
    const hasSearchResults = computed(() => {
      if (!searchKeyword.value.trim()) return true;
      
      const allProperties = [
        ...internalProperties.value,
        ...transformProperties.value,
        ...displayProperties.value,
        ...layoutProperties.value,
        ...interactionProperties.value,
        ...containerProperties.value,
        ...customProperties.value,
        ...functionProperties.value
      ];
      
      return allProperties.length > 0;
    });
    
    // 属性分类（应用搜索过滤）
    const internalProperties = computed(() => {
      if (!showInternal.value) return [];
      const baseProps = props.properties.filter(prop => 
        prop.name.startsWith('$')
      );
      const result = filterProperties(baseProps, searchKeyword.value);
      return result;
    });

    const transformProperties = computed(() => {
      const baseProps = props.properties.filter(prop => 
        ['x', 'y', 'scaleX', 'scaleY', 'rotation', 'anchorOffsetX', 'anchorOffsetY'].includes(prop.name)
      );
      const result = filterProperties(baseProps, searchKeyword.value);
      return result;
    });

    const displayProperties = computed(() => {
      const baseProps = props.properties.filter(prop => 
        ['alpha', 'visible', 'blendMode', 'color', 'text', '_tint'].includes(prop.name)
      );
      const result = filterProperties(baseProps, searchKeyword.value);
      return result;
    });

    const layoutProperties = computed(() => {
      const baseProps = props.properties.filter(prop => 
        ['mask', 'scrollRect', 'cacheAsBitmap'].includes(prop.name)
      );
      const result = filterProperties(baseProps, searchKeyword.value);
      return result;
    });

    const interactionProperties = computed(() => {
      const baseProps = props.properties.filter(prop => 
        ['touchEnabled', 'inputEnabled'].includes(prop.name)
      );
      const result = filterProperties(baseProps, searchKeyword.value);
      return result;
    });

    const containerProperties = computed(() => {
      const baseProps = props.properties.filter(prop => 
        ['children', 'parent', 'stage'].includes(prop.name)
      );
      const result = filterProperties(baseProps, searchKeyword.value);
      return result;
    });

    const customProperties = computed(() => {
      const standardProps = [
        // Internal properties (already filtered by internalProperties)
        // Transform properties
        'x', 'y', 'scaleX', 'scaleY', 'rotation', 'anchorOffsetX', 'anchorOffsetY',
        // Display properties
        'alpha', 'visible', 'blendMode', 'color', 'text', '_tint',
        // Layout properties
        'mask', 'scrollRect', 'cacheAsBitmap',
        // Interaction properties
        'touchEnabled', 'inputEnabled',
        // Container properties
        'children', 'parent', 'stage'
      ];
      const baseProps = props.properties.filter(prop => 
        !prop.name.startsWith('$') && !standardProps.includes(prop.name)
      );
      const result = filterProperties(baseProps, searchKeyword.value);
      return result;
    });

    const functionProperties = computed(() => {
      if (!showFunctions.value) return [];
      const baseProps = props.properties.filter(prop => prop.type === DataType.Function);
      const result = filterProperties(baseProps, searchKeyword.value);
      return result;
    });

    const updateProperty = (property: Property, newValue: any) => {
      emit('property-update', property, newValue);
    };

    return {
      searchKeyword,
      showInternal,
      showFunctions,
      hasSearchResults,
      handleSearch,
      clearSearch,
      internalProperties,
      transformProperties,
      displayProperties,
      layoutProperties,
      interactionProperties,
      containerProperties,
      customProperties,
      functionProperties,
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

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 12px;
}

.properties-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #cccccc;
  flex-shrink: 0;
}

.toggle-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.toggle-control {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 11px;
  color: #888;
  user-select: none;
  transition: color 0.2s;
}

.toggle-control:hover {
  color: #cccccc;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 32px;
  height: 16px;
  background-color: #3e3e42;
  border-radius: 8px;
  margin: 0 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  border: 1px solid #555;
}

.toggle-slider:hover {
  background-color: #4a4a4f;
  border-color: #666;
}

.toggle-thumb {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: #888;
  border-radius: 50%;
  top: 1px;
  left: 1px;
  transition: transform 0.3s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.toggle-input:checked + .toggle-slider {
  background-color: #4caf50;
  border-color: #4caf50;
}

.toggle-input:checked + .toggle-slider .toggle-thumb {
  transform: translateX(16px);
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.toggle-label {
  font-weight: 500;
  white-space: nowrap;
}

.node-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
  margin-bottom: 12px;
}

.node-name {
  font-weight: 500;
  color: #4caf50;
}

.node-type {
  color: #888;
}

/* 搜索容器样式 */
.search-container {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.search-input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #3e3e42;
  border-radius: 4px;
  background: #1e1e1e;
  color: #cccccc;
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #007acc;
}

.search-input::placeholder {
  color: #888;
}

.clear-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #888;
  font-size: 16px;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  transition: color 0.2s;
}

.clear-button:hover {
  color: #cccccc;
  background: #3e3e42;
}

.properties-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  min-height: 0;
  max-height: 100%;
}

.no-selection,
.no-properties,
.no-results {
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

.internal-group {
  border-top: 2px solid #4caf50;
  margin-top: 8px;
  padding-top: 8px;
}

.internal-group .group-header {
  background: #1e1e1e;
  border-bottom: 1px solid #4caf50;
}

.internal-group .group-title {
  color: #4caf50;
  font-weight: 700;
}
</style> 