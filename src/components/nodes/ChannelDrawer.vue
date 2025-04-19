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
              <span>{{ localChannel.title || getItemTitle() }}</span>
            </div>
            <div class="text-caption text-grey-7 q-mt-xs" v-if="localChannel.channelType">
              {{ getChannelTypeLabel(localChannel.channelType) }}
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
          v-model="localChannel.title"
          label="Card Title"
          :placeholder="getItemTitle()"
          outlined
          class="q-mb-lg full-width"
        >
          <template v-slot:prepend>
            <q-icon :name="getItemIcon()" size="24px" />
          </template>
        </q-input>

        <q-input
          v-model="localChannel.description"
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
            <div class="text-grey-7">{{ localChannel.description || 'Additional description will be displayed here' }}</div>
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
import type { ChannelType } from '../models';
import { ref, onMounted } from 'vue';

// Define props and emits
const props = defineProps({
  channel: {
    type: Object,
    required: true
  },
  channelTypes: {
    type: Array<{value: string, label: string}>,
    required: true
  }
});

// Create a local copy of the channel to avoid mutating props directly
const localChannel = ref({ ...props.channel });

// Update local channel when props change
onMounted(() => {
  localChannel.value = { ...props.channel };
});

const emit = defineEmits(['close', 'save']);

// Helper to get channel type label
const getChannelTypeLabel = (channelType: ChannelType): string => {
  const found = props.channelTypes.find((type: {value: string, label: string}) => type.value === channelType);
  return found ? found.label : 'Unknown Channel Type';
};

// Helper method to get item title
const getItemTitle = () => {
  return 'Channel';
};

// Helper method to get item icon
const getItemIcon = () => {
  if (localChannel.value.channelType) {
    switch (localChannel.value.channelType) {
      case 'whatsapp':
        return 'chat';
      case 'instagram':
        return 'photo_camera';
      case 'facebook':
        return 'thumb_up';
      case 'widget':
        return 'widgets';
      default:
        return 'hub';
    }
  }
  return 'hub';
};

// Save changes and emit event
const saveChanges = () => {
  // Emit save event with the updated channel
  emit('save', { ...localChannel.value });
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