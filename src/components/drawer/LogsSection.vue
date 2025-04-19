<template>
  <div class="logs-section q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Execution Logs</div>
      <div>
        <q-select
          v-model="logLevel"
          :options="logLevels"
          label="Log Level"
          dense
          outlined
          style="width: 150px"
          class="q-mr-sm"
        />
        <q-btn flat round icon="refresh" />
        <q-btn flat round icon="download" />
        <q-btn flat round icon="clear" @click="clearLogs" />
      </div>
    </div>
    
    <q-card class="log-container">
      <q-card-section class="q-pa-none">
        <div class="logs-content">
          <div 
            v-for="(log, index) in filteredLogs" 
            :key="index"
            :class="['log-entry', `log-${log.level}`]"
          >
            <div class="log-timestamp">{{ formatTime(log.timestamp) }}</div>
            <div class="log-level">{{ log.level.toUpperCase() }}</div>
            <div class="log-message">{{ log.message }}</div>
          </div>
          
          <div class="text-center q-pa-md" v-if="filteredLogs.length === 0">
            <p class="text-grey">No logs to display</p>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const logLevels = ['all', 'info', 'warning', 'error', 'debug'];
const logLevel = ref('all');

const logs = ref([
  {
    timestamp: new Date(Date.now() - 120000),
    level: 'info',
    message: 'Agent flow initialized'
  },
  {
    timestamp: new Date(Date.now() - 100000),
    level: 'debug',
    message: 'Loading conversation history from database'
  },
  {
    timestamp: new Date(Date.now() - 80000),
    level: 'info',
    message: 'User message received: "I need help with my order"'
  },
  {
    timestamp: new Date(Date.now() - 60000),
    level: 'debug',
    message: 'Intent detected: order_inquiry (confidence: 0.92)'
  },
  {
    timestamp: new Date(Date.now() - 40000),
    level: 'warning',
    message: 'API rate limit approaching (80% used)'
  },
  {
    timestamp: new Date(Date.now() - 20000),
    level: 'error',
    message: 'Failed to connect to knowledge base: timeout after 5000ms'
  }
]);

const filteredLogs = computed(() => {
  if (logLevel.value === 'all') {
    return logs.value;
  }
  return logs.value.filter(log => log.level === logLevel.value);
});

const clearLogs = () => {
  logs.value = [];
};

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};
</script>

<style scoped>
.logs-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.log-container {
  flex: 1;
  overflow: hidden;
  background-color: #252526;
  color: #D4D4D4;
}

.logs-content {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  padding: 8px;
  overflow-y: auto;
  height: 100%;
  max-height: calc(100vh - 180px);
}

.log-entry {
  display: flex;
  padding: 4px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.log-timestamp {
  color: #6A9955;
  margin-right: 10px;
  white-space: nowrap;
}

.log-level {
  width: 70px;
  font-weight: bold;
  margin-right: 10px;
}

.log-message {
  flex: 1;
  word-break: break-word;
}

.log-info .log-level {
  color: #569CD6;
}

.log-warning .log-level {
  color: #DCDCAA;
}

.log-error .log-level {
  color: #F44747;
}

.log-debug .log-level {
  color: #B5CEA8;
}
</style> 