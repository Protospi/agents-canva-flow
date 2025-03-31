<template>
  <div class="flow-canvas">
    <div class="action-buttons">
      <q-btn
        color="primary"
        icon="person_add"
        label="Add User"
        @click="addUser"
        class="q-mr-sm custom-button"
      />
      <q-btn
        color="primary"
        icon="smart_toy"
        label="Add Agent"
        @click="addAgent"
        class="q-mr-sm custom-button"
      />
      <q-btn
        color="primary"
        icon="build"
        label="Add Skill"
        @click="addSkill"
        class="custom-button"
      />
      <div class="zoom-controls q-ml-md">
        <q-btn
          flat
          round
          color="grey-8"
          icon="zoom_in"
          @click="() => handleZoom(0.1)"
        />
        <q-btn
          flat
          round
          color="grey-8"
          icon="zoom_out"
          @click="() => handleZoom(-0.1)"
        />
        <q-btn
          flat
          round
          color="grey-8"
          icon="restart_alt"
          @click="resetZoom"
        />
      </div>
    </div>
    <q-card class="canvas-container">
      <div 
        class="canvas-area"
        :style="{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }"
        @wheel.prevent="handleWheel"
      >
        <div
          v-for="item in items"
          :key="item.id"
          class="flow-item"
          :style="{ left: item.x + 'px', top: item.y + 'px' }"
          @mousedown="startDrag($event, item)"
        >
          <q-card flat bordered>
            <q-card-section class="card-header">
              <div class="row full-width items-center justify-between">
                <div class="row items-center">
                  <q-icon
                    :name="getItemIcon(item.type)"
                    size="24px"
                    class="q-mr-sm"
                  />
                  <div class="text-h6">{{ item.title || getItemTitle(item) }}</div>
                </div>
                <q-btn
                  flat
                  round
                  dense
                  icon="settings"
                  @click.stop="toggleDrawer(item)"
                />
              </div>
            </q-card-section>
            <q-card-section>
              <!-- Placeholder for future content -->
              <div class="text-grey-7">Additional information will be displayed here</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card>

    <!-- Drawer -->
    <q-drawer
      v-model="drawerOpen"
      side="right"
      bordered
      :width="800"
      class="drawer-content"
      overlay
      behavior="mobile"
    >
      <template v-if="selectedItem">
        <div class="drawer-inner">
          <div class="drawer-header q-px-md q-pt-md">
            <div class="row items-center justify-between">
              <div class="text-h6 row items-center">
                <q-icon
                  :name="getItemIcon(selectedItem.type)"
                  size="28px"
                  class="q-mr-sm"
                />
                Card Settings
              </div>
              <q-btn
                flat
                round
                dense
                icon="close"
                @click="drawerOpen = false"
              />
            </div>
          </div>

          <div class="drawer-body q-pa-md">
            <div class="full-width">
              <q-input
                v-model="selectedItem.title"
                label="Card Title"
                :placeholder="getItemTitle(selectedItem)"
                outlined
                class="q-mb-lg full-width"
              >
                <template v-slot:prepend>
                  <q-icon :name="getItemIcon(selectedItem.type)" size="24px" />
                </template>
              </q-input>

              <div class="text-subtitle2 q-mb-sm">Card Type</div>
              <div class="row items-center q-mb-lg">
                <q-icon
                  :name="getItemIcon(selectedItem.type)"
                  size="24px"
                  class="q-mr-sm"
                />
                <span class="text-capitalize">{{ selectedItem.type }}</span>
              </div>

              <div class="text-subtitle2 q-mb-sm">Preview</div>
              <q-card bordered class="full-width">
                <q-card-section>
                  <div class="text-grey-7">Additional information will be displayed here</div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div class="drawer-footer q-px-md q-py-md">
            <q-btn
              flat
              color="grey-8"
              label="CANCEL"
              @click="drawerOpen = false"
              class="q-mr-sm"
            />
            <q-btn
              unelevated
              label="SAVE CHANGES"
              class="custom-button"
              @click="saveChanges"
            />
          </div>
        </div>
      </template>
    </q-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

interface FlowItem {
  id: number;
  type: 'user' | 'agent' | 'skill';
  x: number;
  y: number;
  title?: string;
}

interface Position {
  x: number;
  y: number;
}

const items = ref<FlowItem[]>([]);
const zoom = ref(1);
const position = ref<Position>({ x: 0, y: 0 });
const drawerOpen = ref(false);
const selectedItem = ref<FlowItem | null>(null);
let nextId = 1;
let draggedItem: FlowItem | null = null;
let initialX = 0;
let initialY = 0;

const addUser = () => {
  items.value.push({
    id: nextId++,
    type: 'user',
    x: Math.random() * 500,
    y: Math.random() * 300
  });
};

const addAgent = () => {
  items.value.push({
    id: nextId++,
    type: 'agent',
    x: Math.random() * 500,
    y: Math.random() * 300
  });
};

const addSkill = () => {
  items.value.push({
    id: nextId++,
    type: 'skill',
    x: Math.random() * 500,
    y: Math.random() * 300
  });
};

const getItemIcon = (type: FlowItem['type']) => {
  switch (type) {
    case 'user':
      return 'person';
    case 'agent':
      return 'smart_toy';
    case 'skill':
      return 'build';
    default:
      return '';
  }
};

const getItemTitle = (item: FlowItem) => {
  switch (item.type) {
    case 'user':
      return 'User';
    case 'agent':
      return 'Agent';
    case 'skill':
      return 'Skill';
  }
};

const handleZoom = (delta: number, mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2) => {
  const newZoom = Math.min(Math.max(0.5, zoom.value + delta), 2);
  if (newZoom !== zoom.value) {
    const canvasRect = document.querySelector('.canvas-container')?.getBoundingClientRect();
    if (!canvasRect) return;

    // Calculate mouse position relative to canvas
    const mouseXRelative = mouseX - canvasRect.left - position.value.x;
    const mouseYRelative = mouseY - canvasRect.top - position.value.y;

    // Calculate new position to zoom into mouse position
    const scale = newZoom / zoom.value;
    position.value = {
      x: position.value.x - (mouseXRelative * (scale - 1)),
      y: position.value.y - (mouseYRelative * (scale - 1))
    };
    
    zoom.value = newZoom;
  }
};

const resetZoom = () => {
  zoom.value = 1;
  position.value = { x: 0, y: 0 };
};

const startDrag = (event: MouseEvent, item: FlowItem) => {
  draggedItem = item;
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  initialX = event.clientX - rect.left;
  initialY = event.clientY - rect.top;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const onDrag = (event: MouseEvent) => {
  if (!draggedItem) return;
  
  const canvasRect = document.querySelector('.canvas-area')?.getBoundingClientRect();
  if (!canvasRect) return;

  const x = (event.clientX - canvasRect.left - initialX) / zoom.value;
  const y = (event.clientY - canvasRect.top - initialY) / zoom.value;
  
  draggedItem.x = Math.max(0, Math.min(x, (canvasRect.width / zoom.value) - 200));
  draggedItem.y = Math.max(0, Math.min(y, (canvasRect.height / zoom.value) - 100));
};

const stopDrag = () => {
  draggedItem = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};

const handleWheel = (event: WheelEvent) => {
  const delta = -event.deltaY * 0.001;
  handleZoom(delta, event.clientX, event.clientY);
};

const toggleDrawer = (item: FlowItem) => {
  if (drawerOpen.value && selectedItem.value && selectedItem.value.id === item.id) {
    // Close drawer if clicking gear of already selected item
    drawerOpen.value = false;
  } else {
    // Open drawer with new selected item
    selectedItem.value = item;
    drawerOpen.value = true;
  }
};

const saveChanges = () => {
  // For now, just close the drawer since changes are already saved in real-time
  drawerOpen.value = false;
};

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
});
</script>

<style scoped>
.flow-canvas {
  height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.action-buttons {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.custom-button {
  background-color: #6467F2 !important;
}

.zoom-controls {
  display: flex;
  gap: 8px;
}

.canvas-container {
  flex: 1;
  background: white;
  overflow: hidden;
  position: relative;
  border: none;
  border-radius: 16px;
  box-shadow: rgba(17, 12, 46, 0.05) 0px 48px 100px 0px;
}

.canvas-area {
  background-color: white;
  height: 100%;
  width: 100%;
  position: relative;
  transition: transform 0.1s ease;
  will-change: transform;
}

.flow-item {
  position: absolute;
  width: 300px;
  cursor: move;
}

.flow-item .q-card {
  background-color: #F1F5F9;
  transition: all 0.2s ease;
  box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px;
  min-height: 160px;
}

.flow-item .q-card:hover {
  box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 20px;
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.drawer-content {
  background: white;
}

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
</style> 