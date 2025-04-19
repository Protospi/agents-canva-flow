<template>
  <div class="drawer-inner">
    <div class="drawer-header q-px-md q-pt-md">
      <div class="row items-center justify-between">
        <div class="text-h6 row items-center">
          <q-icon
            :name="getItemIcon()"
            size="28px"
            class="q-mr-sm"
          />
          <div class="column">
            <div class="row items-center">
              <span>{{ agent.title || getItemTitle() }}</span>
            </div>
            <div class="text-caption text-grey-7 q-mt-xs" v-if="agent.modelType">
              {{ getModelTypeLabel(agent.modelType) }}
            </div>
          </div>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          @click="$emit('close')"
        />
      </div>
    </div>

    <div class="drawer-body q-pa-md">
      <div class="full-width">
        <!-- Agent specific inputs -->
        <div class="row q-mb-lg">
          <div class="col-4 q-pr-sm">
            <q-input
              v-model="agent.title"
              label="Agent Title"
              :placeholder="getItemTitle()"
              outlined
              class="full-width"
            />
          </div>
          <div class="col-4 q-px-sm">
            <q-input
              v-model="agent.memory"
              label="Memory"
              placeholder="Agent memory"
              outlined
              class="full-width"
            />
          </div>
          <div class="col-4 q-pl-sm">
            <q-select
              v-model="agent.modelType"
              :options="modelTypes"
              option-value="value"
              option-label="label"
              label="Model"
              outlined
              emit-value
              map-options
              class="full-width"
            />
          </div>
        </div>

        <q-input
          v-model="agent.description"
          label="Card Description"
          placeholder="Additional description will be displayed here"
          outlined
          class="q-mb-lg full-width"
          type="textarea"
          rows="3"
        />

        <div class="text-subtitle2 q-mb-sm">Info</div>
        <q-card bordered class="full-width">
          <q-card-section>
            <div v-if="agent.modelType" class="text-caption text-grey-7 q-mb-sm">
              Model: {{ getModelTypeLabel(agent.modelType) }}
            </div>
            <div v-if="agent.memory" class="text-caption text-grey-7 q-mb-sm">
              Memory: {{ agent.memory }}
            </div>
            <div class="text-grey-7">{{ agent.description || 'Additional description will be displayed here' }}</div>
          </q-card-section>
        </q-card>
        
        <!-- Conditions section - only for agents -->
        <div class="q-mt-lg">
          <q-card bordered class="full-width condition-card">
            <!-- Card header with expand/collapse button -->
            <q-card-section 
              class="row items-center justify-between q-py-sm"
              @click="conditionsExpanded = !conditionsExpanded"
            >
              <div class="text-subtitle2">Execution Conditions</div>
              <q-btn
                flat
                round
                dense
                :icon="conditionsExpanded ? 'expand_less' : 'expand_more'"
                @click.stop
                aria-label="Toggle conditions visibility"
              />
            </q-card-section>
            
            <!-- Expandable content -->
            <q-slide-transition>
              <div v-show="conditionsExpanded">
                <q-separator />
                <q-card-section>
                  <div v-for="(condition, index) in conditions" :key="index" class="condition-row q-mb-md">
                    <!-- First row: Condition type toggle and delete button -->
                    <div class="row q-mb-md items-center">
                      <div class="col">
                        <q-btn-toggle
                          v-model="condition.logicType"
                          :options="[
                            { label: 'AND CONDITION', value: 'AND' },
                            { label: 'OR CONDITION', value: 'OR' }
                          ]"
                          class="logic-type-toggle"
                          :disable="index === 0"
                          toggle-color="secondary"
                          text-color="white"
                          color="grey-4"
                          unelevated
                          rounded
                        />
                      </div>
                      
                      <!-- Remove button - aligned to the right -->
                      <div class="col-auto">
                        <q-btn
                          icon="delete"
                          flat
                          dense
                          round
                          color="grey-7"
                          @click="removeCondition(index)"
                        />
                      </div>
                    </div>
                    
                    <!-- Second row: Input fields -->
                    <div class="row q-col-gutter-sm">
                      <div class="col-4">
                        <q-input
                          v-model="condition.memoryVariable"
                          outlined
                          dense
                          label="Memory Variable"
                          placeholder="Enter memory path"
                        />
                      </div>
                      <div class="col-4">
                        <q-select
                          v-model="condition.operator"
                          :options="comparisonOperators"
                          outlined
                          dense
                          label="Operator"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                        />
                      </div>
                      <div class="col-4">
                        <q-input
                          v-model="condition.value"
                          outlined
                          dense
                          label="Value"
                          placeholder="Value to compare"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <!-- Add condition button -->
                  <div class="text-center q-mt-md">
                    <q-btn
                      color="secondary"
                      icon="add"
                      label="ADD CONDITION"
                      @click="addCondition('AND')"
                      no-caps
                      text-color="white"
                    />
                  </div>
                </q-card-section>
              </div>
            </q-slide-transition>
          </q-card>
        </div>
      </div>
    </div>

    <div class="drawer-footer q-px-md q-py-md">
      <q-btn
        flat
        color="grey-8"
        label="CANCEL"
        @click="$emit('close')"
        class="q-mr-sm"
      />
      <q-btn
        unelevated
        label="SAVE CHANGES"
        class="custom-button text-white"
        @click="saveChanges"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import {
  ModelType,
  ComparisonOperator,
  LogicalOperator,
  Condition
} from './models';

// Define props and emits
const props = defineProps({
  agent: {
    type: Object,
    required: true
  },
  modelTypes: {
    type: Array<{value: string, label: string}>,
    required: true
  },
  comparisonOperators: {
    type: Array<{value: string, label: string}>,
    required: true
  }
});

const emit = defineEmits(['close', 'save']);

// Initialize conditions
const conditions = ref<Condition[]>([]);
const conditionsExpanded = ref(false);
let nextConditionId = 1;

// Watch changes to agent's conditions to update local state
watch(() => props.agent.conditions, (newConditions) => {
  if (newConditions && newConditions.length > 0) {
    conditions.value = [...newConditions];
    // Update nextConditionId based on the highest id in existing conditions
    const maxId = Math.max(...newConditions.map((c: Condition) => c.id), 0);
    nextConditionId = maxId + 1;
  } else {
    conditions.value = [];
  }
}, { immediate: true, deep: true });

// Add a new condition
const addCondition = (logicType: LogicalOperator = 'AND') => {
  conditions.value.push({
    id: nextConditionId++,
    logicType: conditions.value.length > 0 ? logicType : 'AND', // Force first condition to be AND
    memoryVariable: '',
    operator: 'igual_a',
    value: ''
  });
};

// Remove a condition
const removeCondition = (index: number) => {
  conditions.value.splice(index, 1);
};

// Helper to get model type label
const getModelTypeLabel = (modelType: ModelType): string => {
  const found = props.modelTypes.find((type: {value: string, label: string}) => type.value === modelType);
  return found ? found.label : 'Unknown Model Type';
};

// Helper method to get item title
const getItemTitle = () => {
  return 'Agent';
};

// Helper method to get item icon
const getItemIcon = () => {
  if (props.agent.agentType) {
    switch (props.agent.agentType) {
      case 'conversational':
        return 'forum';
      case 'controller':
        return 'account_tree';
      case 'revisor':
        return 'rate_review';
      case 'extractor':
        return 'content_cut';
      default:
        return 'smart_toy';
    }
  }
  return 'smart_toy';
};

// Save changes and emit event
const saveChanges = () => {
  // Create a copy of the agent with the updated conditions
  const updatedAgent = {
    ...props.agent,
    conditions: [...conditions.value]
  };
  
  // Emit save event with the updated agent
  emit('save', updatedAgent);
};

// Initialize on mount
onMounted(() => {
  // Initialize conditions from agent if they exist
  if (props.agent.conditions && props.agent.conditions.length > 0) {
    conditions.value = [...props.agent.conditions];
    // Update nextConditionId based on the highest id in existing conditions
    const maxId = Math.max(...props.agent.conditions.map((c: Condition) => c.id), 0);
    nextConditionId = maxId + 1;
  }
});
</script>

<style scoped>
.drawer-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.drawer-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: flex-end;
  background: white;
}

.drawer-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: white;
}

.full-width {
  width: 100%;
}

.custom-button {
  background-color: #6467F2 !important;
}

/* Conditions styling */
.condition-row {
  position: relative;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background-color: #f9f9f9;
}

.condition-row:hover {
  background-color: #f0f0f0;
}

.first-condition-label {
  height: 32px;
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 0.9em;
  color: #666;
}

.logic-type-chip {
  min-width: 70px;
  justify-content: center;
}

.logic-type-toggle {
  width: 100%;
  max-width: 320px;
}

.condition-card .q-card__section:first-child {
  cursor: pointer;
}

.condition-card .q-card__section:first-child:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style> 