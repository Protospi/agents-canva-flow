<template>
  <q-drawer
    v-model="modelValue"
    side="right"
    bordered
    :width="900"
    class="conversation-drawer"
    overlay
    behavior="mobile"
  >
    <div class="conversation-header">
      <div class="row items-center justify-between q-pa-md">
        <div class="text-h6">Assistant</div>
        <q-btn flat round icon="close" @click="close" />
      </div>
    </div>
    
    <div class="conversation-content">
      <q-tabs
        v-model="activeTab"
        class="text-primary"
        active-color="primary"
        indicator-color="primary"
        align="center"
        narrow-indicator
      >
        <q-tab name="conversation" icon="chat" label="Conversation" />
        <q-tab name="tests" icon="science" label="Tests" />
        <q-tab name="logs" icon="terminal" label="Logs" />
        <q-tab name="memory" icon="memory" label="Memory" />
      </q-tabs>
      
      <q-separator />
      
      <q-tab-panels v-model="activeTab" animated class="tab-panels">
        <q-tab-panel name="conversation" class="q-pa-none">
          <ConversationSection />
        </q-tab-panel>
        
        <q-tab-panel name="tests" class="q-pa-none">
          <TestsSection />
        </q-tab-panel>
        
        <q-tab-panel name="logs" class="q-pa-none">
          <LogsSection />
        </q-tab-panel>
        
        <q-tab-panel name="memory" class="q-pa-none">
          <MemorySection />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue';
import ConversationSection from './drawer/ConversationSection.vue';
import TestsSection from './drawer/TestsSection.vue';
import LogsSection from './drawer/LogsSection.vue';
import MemorySection from './drawer/MemorySection.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:isOpen']);

// Computed property to handle v-model
const modelValue = computed({
  get: () => props.isOpen,
  set: (value) => emit('update:isOpen', value)
});

const activeTab = ref('conversation');

const close = () => {
  emit('update:isOpen', false);
};
</script>

<style scoped>
.conversation-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.conversation-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.conversation-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.tab-panels {
  flex: 1;
  overflow: hidden;
}
</style> 