<template>
  <div class="hierarchy-panel">
    <CCDock name="Hierarchy">
      <CCTree 
        ref="elTree" 
        :value="treeDataWithVisible" 
        :expand-keys="expandedKeys" 
        :default-expand-all="false"
        :search="true"
        @node-expand="onNodeExpand" 
        @node-collapse="onNodeCollapse" 
        @node-click="handleNodeClick" 
        @node-unclick="handleNodeUnclick"
        style="flex: 1"
      />
    </CCDock>
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, ref, nextTick, computed } from "vue";
import { TreeData } from "./data";

const { CCTree, CCDock } = ccui.components;

export default defineComponent({
  name: "Hierarchy",
  components: { CCTree, CCDock },
  props: {
    treeData: {
      type: Array as () => TreeData[],
      default: () => [],
      required: true
    }
  },
  emits: ['node-select', 'node-unselect'],
  setup(props, { emit }) {
    const elTree = ref<typeof CCTree>(null);
    const expandedKeys = ref<string[]>([]);
    let selectedUUID: string | null = null;

    // 计算属性：为树数据添加visible状态标识
    const treeDataWithVisible = computed(() => {
      const addVisibleClass = (nodes: TreeData[]): TreeData[] => {
        return nodes.map(node => {
          // 为不可见节点添加特殊标识
          const newNode = new TreeData(node.id, node.text, node.visible);
          newNode.active = node.active;
          newNode.children = addVisibleClass(node.children);
          
          // 如果节点不可见，在文本前添加标识
          if (!node.visible) {
            newNode.text = `[隐藏] ${node.text}`;
          }
          
          return newNode;
        });
      };
      
      return addVisibleClass(props.treeData);
    });



    // 节点展开事件
    const onNodeExpand = (data: TreeData) => {
      if (data.id) {
        expandedKeys.value.push(data.id);
      }
    };

    // 节点折叠事件
    const onNodeCollapse = (data: TreeData) => {
      if (data.id) {
        const keys = expandedKeys.value;
        const index = keys.findIndex((el) => el === data.id);
        if (index !== -1) {
          keys.splice(index, 1);
        }
        expandedKeys.value = keys;
      }
    };

    // 节点点击事件
    const handleNodeClick = (data: TreeData | null) => {
      // Node clicked
      if (data) {
        // 移除 [隐藏] 标识，获取原始节点数据
        const originalData = { ...data };
        if (data.text.startsWith('[隐藏] ')) {
          originalData.text = data.text.replace('[隐藏] ', '');
        }
        
        selectedUUID = data.id;
        emit('node-select', originalData);
      } else {
        selectedUUID = null;
        emit('node-unselect');
      }
    };

    // 节点取消选择事件
    const handleNodeUnclick = () => {
      selectedUUID = null;
      emit('node-unselect');
    };

    // 展开指定节点
    const expandNode = (uuid: string) => {
      if (elTree.value) {
        elTree.value.handExpand(uuid, { highlight: true });
      }
    };

    // 选择指定节点
    const selectNode = (uuid: string) => {
      if (elTree.value) {
        elTree.value.handChoose(uuid);
      }
    };

    return {
      elTree,
      expandedKeys,
      treeDataWithVisible,
      onNodeExpand,
      onNodeCollapse,
      handleNodeClick,
      handleNodeUnclick,
      expandNode,
      selectNode
    };
  }
});
</script>

<style scoped>
.hierarchy-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 200px;
  flex: 1;
  overflow: auto;
  min-height: 0;
}

/* 自定义滚动条样式 */
.hierarchy-panel::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.hierarchy-panel::-webkit-scrollbar-track {
  background: #2d2d30;
}

.hierarchy-panel::-webkit-scrollbar-thumb {
  background: #3e3e42;
  border-radius: 4px;
}

.hierarchy-panel::-webkit-scrollbar-thumb:hover {
  background: #4e4e52;
}

/* Firefox 滚动条样式 */
.hierarchy-panel {
  scrollbar-width: thin;
  scrollbar-color: #3e3e42 #2d2d30;
}



/* 根据节点visible状态设置透明度 */
.hierarchy-panel :deep(.cc-tree-node) {
  opacity: 1;
  transition: opacity 0.2s;
}

.hierarchy-panel :deep(.cc-tree-node[data-visible="false"]) {
  opacity: 0.5;
}


</style> 