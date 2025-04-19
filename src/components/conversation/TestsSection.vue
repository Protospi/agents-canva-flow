<template>
  <div class="tests-section q-pa-md">
    <div class="text-h6 q-mb-md">Test Cases</div>
    
    <div class="q-mb-md">
      <q-btn color="primary" label="Run All Tests" icon="play_arrow" class="q-mr-sm" />
      <q-btn outline color="primary" label="Create New Test" icon="add" />
    </div>
    
    <q-list bordered separator>
      <q-item v-for="test in tests" :key="test.id" clickable v-ripple>
        <q-item-section avatar>
          <q-icon :name="test.status === 'passed' ? 'check_circle' : test.status === 'failed' ? 'error' : 'schedule'" 
                  :color="test.status === 'passed' ? 'positive' : test.status === 'failed' ? 'negative' : 'grey'" />
        </q-item-section>
        
        <q-item-section>
          <q-item-label>{{ test.name }}</q-item-label>
          <q-item-label caption>{{ test.description }}</q-item-label>
        </q-item-section>
        
        <q-item-section side>
          <q-btn flat round icon="play_arrow" size="sm" />
          <q-btn flat round icon="edit" size="sm" />
        </q-item-section>
      </q-item>
    </q-list>
    
    <div class="text-center q-mt-md" v-if="tests.length === 0">
      <p class="text-grey">No tests created yet</p>
      <q-btn color="primary" label="Create Your First Test" icon="add" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tests = ref([
  {
    id: 1,
    name: 'Welcome flow test',
    description: 'Tests the welcome message flow for new users',
    status: 'passed'
  },
  {
    id: 2,
    name: 'Order tracking flow',
    description: 'Tests the order tracking conversation flow',
    status: 'failed'
  },
  {
    id: 3,
    name: 'Product recommendation',
    description: 'Tests the product recommendation skill',
    status: 'pending'
  }
]);
</script>

<style scoped>
.tests-section {
  height: 100%;
  overflow-y: auto;
}
</style> 