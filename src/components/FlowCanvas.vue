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
        <q-btn
          flat
          round
          color="grey-8"
          icon="save"
          @click="saveFlow"
          class="q-ml-md"
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
        <!-- SVG container for drawing connections -->
        <svg class="connections-layer" width="100%" height="100%">
          <path 
            v-for="connection in connections" 
            :key="connection.id" 
            :d="generatePath(connection)" 
            fill="none" 
            stroke="#6467F2" 
            stroke-width="2" 
            :stroke-dasharray="connection.isInProgress ? '5,5' : 'none'"
          />
        </svg>
        
        <div
          v-for="item in items"
          :key="item.id"
          class="flow-item"
          :style="{ left: item.x + 'px', top: item.y + 'px' }"
          @mousedown="(e) => startDrag(e, item)"
        >
          <q-card flat bordered>
            <q-card-section :class="['card-header', 'colored-header']">
              <div class="row full-width items-center justify-between">
                <div class="row items-center">
                  <q-icon
                    :name="getItemIcon(item.type)"
                    size="24px"
                    class="q-mr-sm text-white"
                  />
                  <div class="text-h6 text-white">{{ item.title || getItemTitle(item) }}</div>
                </div>
                <div class="row">
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    class="text-white q-mr-xs"
                    @click.stop="deleteItem(item)"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    icon="settings"
                    class="text-white"
                    @click.stop="toggleDrawer(item)"
                  />
                </div>
              </div>
            </q-card-section>
            <q-card-section>
              <!-- Placeholder for future content -->
              <div class="text-grey-7">Additional information will be displayed here</div>
            </q-card-section>
            
            <!-- Connection points based on item type -->
            <div class="connection-points">
              <!-- User has only right connection -->
              <div 
                v-if="item.type === 'user'" 
                class="connection-point right"
                @mousedown.stop="startConnection($event, item, 'right')"
              ></div>
              
              <!-- Agent has both left and right connections -->
              <template v-if="item.type === 'agent'">
                <div 
                  class="connection-point left"
                  @mousedown.stop="startConnection($event, item, 'left')"
                ></div>
                <div 
                  class="connection-point right"
                  @mousedown.stop="startConnection($event, item, 'right')"
                ></div>
              </template>
              
              <!-- Skill has only left connection -->
              <div 
                v-if="item.type === 'skill'" 
                class="connection-point left"
                @mousedown.stop="startConnection($event, item, 'left')"
              ></div>
            </div>
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
              class="custom-button text-white"
              @click="saveChanges"
            />
          </div>
        </div>
      </template>
    </q-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted } from 'vue';

interface ConnectionPoint {
  itemId: number;
  side: 'left' | 'right';
}

interface Connection {
  id: number;
  source: ConnectionPoint;
  target: ConnectionPoint;
  isInProgress?: boolean;
  mousePosX?: number;
  mousePosY?: number;
}

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
const connections = ref<Connection[]>([]);
const pendingConnection = ref<Connection | null>(null);
let nextId = 1;
let nextConnectionId = 1;
let draggedItem: FlowItem | null = null;
let initialX = 0;
let initialY = 0;
let isDraggingConnection = false;

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

const deleteItem = (item: FlowItem) => {
  // Delete all connections associated with this item
  connections.value = connections.value.filter(conn => 
    conn.source.itemId !== item.id && conn.target.itemId !== item.id
  );
  
  // Delete the item
  items.value = items.value.filter(i => i.id !== item.id);
  
  // Close drawer if it was open for the deleted item
  if (selectedItem.value && selectedItem.value.id === item.id) {
    drawerOpen.value = false;
    selectedItem.value = null;
  }
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
  // Don't start dragging if we're already dragging a connection
  if (isDraggingConnection) return;
  
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

const saveFlow = () => {
  // Placeholder for future save functionality
  console.log('Save flow functionality will be implemented here');
};

// Connection handling functions

const startConnection = (event: MouseEvent, item: FlowItem, side: 'left' | 'right') => {
  event.stopPropagation();
  isDraggingConnection = true;
  
  // Create a temporary connection
  const sourcePoint: ConnectionPoint = { itemId: item.id, side };
  const targetPoint: ConnectionPoint = { itemId: -1, side: side === 'left' ? 'right' : 'left' };
  
  pendingConnection.value = {
    id: nextConnectionId++,
    source: sourcePoint,
    target: targetPoint,
    isInProgress: true,
    mousePosX: 0,
    mousePosY: 0
  };
  
  connections.value.push(pendingConnection.value);
  
  const canvas = document.querySelector('.canvas-area');
  if (canvas) {
    canvas.addEventListener('mousemove', updatePendingConnection as EventListener);
    canvas.addEventListener('mouseup', finishConnection as EventListener);
  }
};

const updatePendingConnection = (event: MouseEvent) => {
  if (!pendingConnection.value) return;
  
  const canvasRect = document.querySelector('.canvas-area')?.getBoundingClientRect();
  if (!canvasRect) return;
  
  // Update the mouse position as the temporary target
  pendingConnection.value.mousePosX = (event.clientX - canvasRect.left) / zoom.value;
  pendingConnection.value.mousePosY = (event.clientY - canvasRect.top) / zoom.value;
};

const finishConnection = (event: MouseEvent) => {
  if (!pendingConnection.value) return;
  
  // Remove event listeners
  const canvas = document.querySelector('.canvas-area');
  if (canvas) {
    canvas.removeEventListener('mousemove', updatePendingConnection as EventListener);
    canvas.removeEventListener('mouseup', finishConnection as EventListener);
  }
  
  // Check if we're over a valid connection point
  const connectionPoint = findConnectionPointUnderMouse(event);
  
  if (connectionPoint && isValidConnection(pendingConnection.value.source, connectionPoint)) {
    // Finalize the connection
    pendingConnection.value.target = connectionPoint;
    pendingConnection.value.isInProgress = false;
  } else {
    // Remove the pending connection
    connections.value = connections.value.filter(conn => conn.id !== pendingConnection.value?.id);
  }
  
  pendingConnection.value = null;
  isDraggingConnection = false;
};

const findConnectionPointUnderMouse = (event: MouseEvent): ConnectionPoint | null => {
  // Find all connection points
  const points = document.querySelectorAll('.connection-point');
  const mouseX = event.clientX;
  const mouseY = event.clientY;
  
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (!point) continue;
    
    const rect = point.getBoundingClientRect();
    
    if (
      mouseX >= rect.left && 
      mouseX <= rect.right && 
      mouseY >= rect.top && 
      mouseY <= rect.bottom
    ) {
      // Find parent .flow-item element
      let currentNode: HTMLElement | null = point as HTMLElement;
      let itemIdStr = null;
      
      // Walk up the DOM tree to find parent with data-item-id attribute
      while (currentNode && !itemIdStr) {
        if (currentNode.classList.contains('flow-item')) {
          itemIdStr = currentNode.getAttribute('data-item-id');
          break;
        }
        currentNode = currentNode.parentElement;
      }
      
      if (itemIdStr) {
        const itemId = parseInt(itemIdStr);
        const side: 'left' | 'right' = point.classList.contains('left') ? 'left' : 'right';
        
        if (itemId >= 0) {
          return { itemId, side };
        }
      }
    }
  }
  
  return null;
};

const isValidConnection = (source: ConnectionPoint, target: ConnectionPoint) => {
  if (source.itemId === target.itemId) return false;
  if (source.side === target.side) return false;
  
  // Get the source and target items
  const sourceItem = items.value.find(item => item.id === source.itemId);
  const targetItem = items.value.find(item => item.id === target.itemId);
  
  if (!sourceItem || !targetItem) return false;
  
  // Check connection rules
  // 1. User can only connect to agent from right side
  if (sourceItem.type === 'user' && (targetItem.type !== 'agent' || source.side !== 'right' || target.side !== 'left')) {
    return false;
  }
  
  // 2. Agent can connect to skill from right side
  if (sourceItem.type === 'agent' && source.side === 'right') {
    return targetItem.type === 'skill' && target.side === 'left';
  }
  
  // 3. Agent can receive connection from user or agent on left side
  if (targetItem.type === 'agent' && target.side === 'left') {
    return sourceItem.type === 'user' || sourceItem.type === 'agent';
  }
  
  // 4. Skill can only connect to agent on left side
  if (targetItem.type === 'skill') {
    return sourceItem.type === 'agent' && target.side === 'left' && source.side === 'right';
  }
  
  return false;
};

// Function to generate the SVG path for a connection
const generatePath = (connection: Connection) => {
  // Find source and target items
  const sourceItem = items.value.find(item => item.id === connection.source.itemId);
  const targetItem = items.value.find(item => item.id === connection.target.itemId);
  
  if (!sourceItem && !connection.isInProgress) return '';
  
  // Calculate source connection point position
  const sourceX = sourceItem ? sourceItem.x + (connection.source.side === 'right' ? 300 : 0) : 0;
  const sourceY = sourceItem ? sourceItem.y + 80 : 0;
  
  let targetX, targetY;
  
  if (connection.isInProgress) {
    // For pending connections, use mouse position as target
    targetX = connection.mousePosX || 0;
    targetY = connection.mousePosY || 0;
  } else if (targetItem) {
    // For completed connections, use the target connection point
    targetX = targetItem.x + (connection.target.side === 'right' ? 300 : 0);
    targetY = targetItem.y + 80;
  } else {
    return '';
  }
  
  // Create a curved path
  const controlPointX1 = sourceX + (connection.source.side === 'right' ? 50 : -50);
  const controlPointX2 = targetX + (connection.target.side === 'right' ? 50 : -50);
  
  return `M ${sourceX} ${sourceY} C ${controlPointX1} ${sourceY}, ${controlPointX2} ${targetY}, ${targetX} ${targetY}`;
};

// Attribute data-item-id to each flow-item
onMounted(() => {
  const observer = new MutationObserver(() => {
    document.querySelectorAll('.flow-item').forEach((el, index) => {
      if (index < items.value.length) {
        const item = items.value[index];
        if (item && item.id !== undefined) {
          el.setAttribute('data-item-id', item.id.toString());
        }
      }
    });
  });
  
  observer.observe(document.querySelector('.canvas-area') || document.body, {
    childList: true,
    subtree: true
  });
});

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
  
  const canvas = document.querySelector('.canvas-area');
  if (canvas) {
    canvas.removeEventListener('mousemove', updatePendingConnection as EventListener);
    canvas.removeEventListener('mouseup', finishConnection as EventListener);
  }
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
  position: relative;
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

.colored-header {
  background-color: #6467F2;
  color: white;
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

/* Connection points styling */
.connection-points {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.connection-point {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #6467F2;
  border: 2px solid white;
  border-radius: 50%;
  cursor: crosshair;
  pointer-events: all;
}

.connection-point.left {
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
}

.connection-point.right {
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
}

.connection-point:hover {
  transform: translateY(-50%) scale(1.2);
}

/* Connection lines */
.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style> 