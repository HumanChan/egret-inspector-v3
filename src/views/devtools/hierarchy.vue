<template>
  <div class="hierarchy-panel">
    <CCDock name="Hierarchy">
      <CCTree 
        ref="elTree" 
        :value="treeData" 
        :expand-keys="expandedKeys" 
        :default-expand-all="false"
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
import { defineComponent, ref, nextTick } from "vue";
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
        selectedUUID = data.id;
        emit('node-select', data);
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
</style> 