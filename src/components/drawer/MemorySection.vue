<template>
  <div class="memory-section q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Agent Memory</div>
      <div>
        <q-btn flat round icon="refresh" />
        <q-btn flat round icon="delete" />
      </div>
    </div>
    
    <q-tabs
      v-model="activeTab"
      class="text-primary"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="session" label="Session Memory" />
      <q-tab name="long_term" label="Long-term Memory" />
      <q-tab name="vector" label="Vector Store" />
    </q-tabs>
    
    <q-separator />
    
    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel name="session">
        <q-list bordered separator>
          <q-item v-for="(memory, index) in sessionMemory" :key="index">
            <q-item-section>
              <q-item-label>{{ memory.key }}</q-item-label>
              <q-item-label caption>
                <pre class="memory-value">{{ memory.value }}</pre>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>
      
      <q-tab-panel name="long_term">
        <div class="row q-mb-md">
          <q-input
            outlined
            v-model="searchLongTerm"
            placeholder="Search long-term memory"
            class="full-width"
            dense
          />
        </div>
        <q-timeline color="primary">
          <q-timeline-entry
            v-for="(memory, index) in longTermMemory"
            :key="index"
            :title="memory.title"
            :subtitle="formatDate(memory.timestamp)"
          >
            <div>{{ memory.content }}</div>
          </q-timeline-entry>
        </q-timeline>
      </q-tab-panel>
      
      <q-tab-panel name="vector">
        <div class="row q-mb-md">
          <q-input
            outlined
            v-model="vectorSearch"
            placeholder="Semantic search"
            class="full-width"
            dense
          >
            <template v-slot:append>
              <q-btn round dense flat icon="search" />
            </template>
          </q-input>
        </div>
        
        <q-card v-for="(vector, index) in vectorStore" :key="index" class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle2">{{ vector.title }}</div>
            <div class="text-caption">Relevance: {{ vector.relevance }}</div>
            <div class="q-mt-sm">{{ vector.content }}</div>
          </q-card-section>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('session');
const searchLongTerm = ref('');
const vectorSearch = ref('');

const sessionMemory = ref([
  {
    key: 'user_name',
    value: 'John Smith'
  },
  {
    key: 'user_email',
    value: 'john.smith@example.com'
  },
  {
    key: 'last_order_id',
    value: 'ORD-12345'
  },
  {
    key: 'conversation_context',
    value: JSON.stringify({
      intent: 'order_tracking',
      entities: {
        order_id: 'ORD-12345'
      },
      sentiment: 'neutral'
    }, null, 2)
  }
]);

const longTermMemory = ref([
  {
    title: 'Previous Support Interaction',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    content: 'User contacted support about delayed delivery for order ORD-10982. Issue was resolved with express shipping.'
  },
  {
    title: 'Product Preference',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    content: 'User expressed interest in eco-friendly product options. Mentioned sustainability as an important factor.'
  },
  {
    title: 'Account Creation',
    timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    content: 'User created account via mobile app. Subscribed to newsletter and promotional emails.'
  }
]);

const vectorStore = ref([
  {
    title: 'Return Policy Documentation',
    relevance: 0.92,
    content: 'Items can be returned within 30 days of purchase with original receipt. Refunds are processed within 5-7 business days.'
  },
  {
    title: 'Shipping FAQ',
    relevance: 0.85,
    content: 'Standard shipping takes 3-5 business days. Express shipping is available for an additional fee and delivers within 1-2 business days.'
  },
  {
    title: 'Product Warranty Information',
    relevance: 0.78,
    content: 'All electronic products come with a standard 1-year manufacturer warranty covering defects in materials and workmanship.'
  }
]);

const formatDate = (date: Date) => {
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.memory-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.memory-value {
  margin: 0;
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 12px;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 8px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.q-tab-panels {
  flex: 1;
  overflow-y: auto;
}
</style> 