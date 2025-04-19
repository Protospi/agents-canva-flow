<template>
  <div class="drawer-inner">
    <div class="drawer-header q-px-md q-pt-md">
      <div class="row items-center justify-between">
        <div class="text-h6 row items-center">
          <q-icon
            name="build"
            size="28px"
            class="q-mr-sm"
          />
          <div class="column">
            <div class="row items-center">
              <span>{{ localSkill.title || getItemTitle() }}</span>
            </div>
            <div class="text-caption text-grey-7 q-mt-xs" v-if="localSkill.skillType">
              {{ getSkillTypeLabel(localSkill.skillType) }}
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
        <q-input
          v-model="localSkill.title"
          label="Card Title"
          :placeholder="getItemTitle()"
          outlined
          class="q-mb-lg full-width"
        >
          <template v-slot:prepend>
            <q-icon name="build" size="24px" />
          </template>
        </q-input>

        <q-input
          v-model="localSkill.description"
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
            <div class="text-grey-7">{{ localSkill.description || 'Additional description will be displayed here' }}</div>
          </q-card-section>
        </q-card>
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
import type { SkillType } from './models';
import { ref, onMounted } from 'vue';

// Define props and emits
const props = defineProps({
  skill: {
    type: Object,
    required: true
  },
  skillTypes: {
    type: Array<{value: string, label: string}>,
    required: true
  }
});

// Create a local copy of the skill to avoid mutating props directly
const localSkill = ref({ ...props.skill });

// Update local skill when props change
onMounted(() => {
  localSkill.value = { ...props.skill };
});

const emit = defineEmits(['close', 'save']);

// Helper to get skill type label
const getSkillTypeLabel = (skillType: SkillType): string => {
  const found = props.skillTypes.find((type: {value: string, label: string}) => type.value === skillType);
  return found ? found.label : 'Unknown Skill Type';
};

// Helper method to get item title
const getItemTitle = () => {
  return 'Skill';
};

// Save changes and emit event
const saveChanges = () => {
  // Emit save event with the updated skill
  emit('save', { ...localSkill.value });
};
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
</style> 