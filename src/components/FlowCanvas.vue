<template>
  <div class="flow-canvas">
    <div class="action-buttons">
      <q-btn-dropdown
        color="primary"
        icon="hub"
        label="Add Channel"
        class="q-mr-sm custom-button"
      >
        <q-list>
          <q-item v-for="channelType in channelTypes" :key="channelType.value" clickable v-close-popup @click="addChannel(channelType.value as ChannelType)">
            <q-item-section>
              <q-item-label>{{ channelType.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <q-btn
        color="primary"
        icon="smart_toy"
        label="Add Agent"
        @click="addAgent"
        class="q-mr-sm custom-button"
      />
      <q-btn-dropdown
        color="primary"
        icon="build"
        label="Add Skill"
        class="custom-button"
      >
        <q-list>
          <q-item v-for="skillType in skillTypes" :key="skillType.value" clickable v-close-popup @click="addSkill(skillType.value as SkillType)">
            <q-item-section>
              <q-item-label>{{ skillType.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
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
        @mousedown="startCanvasDrag"
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
                    :name="getItemIcon(item.type, item)"
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
              <div class="text-grey-7">{{ item.description || 'Additional description will be displayed here' }}</div>
            </q-card-section>
            
            <!-- Connection points based on item type -->
            <div class="connection-points">
              <!-- Channel has only right connection -->
              <div 
                v-if="item.type === 'channel'" 
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
                  :name="getItemIcon(selectedItem.type, selectedItem)"
                  size="28px"
                  class="q-mr-sm"
                />
                <div class="column">
                  <div class="row items-center">
                    <span>{{ selectedItem.title || getItemTitle(selectedItem) }}</span>
                  </div>
                  <div class="text-caption text-grey-7 q-mt-xs" v-if="selectedItem.type === 'skill' && selectedItem.skillType">
                    {{ getSkillTypeLabel(selectedItem.skillType) }}
                  </div>
                  <div class="text-caption text-grey-7 q-mt-xs" v-if="selectedItem.type === 'channel' && selectedItem.channelType">
                    {{ getChannelTypeLabel(selectedItem.channelType) }}
                  </div>
                </div>
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
                  <q-icon :name="getItemIcon(selectedItem.type, selectedItem)" size="24px" />
                </template>
              </q-input>

              <q-input
                v-model="selectedItem.description"
                label="Card Description"
                placeholder="Additional description will be displayed here"
                outlined
                class="q-mb-lg full-width"
                type="textarea"
                rows="3"
              />

              <div class="text-subtitle2 q-mb-sm">Preview</div>
              <q-card bordered class="full-width">
                <q-card-section>
                  <div class="text-grey-7">{{ selectedItem.description || 'Additional description will be displayed here' }}</div>
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

// Define skill type
type SkillType = 'script' | 'dados_contato' | 'dados_entidade' | 'live_chat' | 
                'definir_unidade' | 'rag' | 'smart_content' | 'registrar_sdm' | 
                'enviar_midia' | 'mensagem_interativa';

// Define channel type
type ChannelType = 'whatsapp' | 'instagram' | 'facebook' | 'widget';

interface FlowItem {
  id: number;
  type: 'channel' | 'agent' | 'skill';
  x: number;
  y: number;
  title?: string;
  description?: string;
  skillType?: SkillType;
  channelType?: ChannelType;
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

// Define skill types
const skillTypes = [
  { value: 'script', label: 'Script' },
  { value: 'dados_contato', label: 'Dados de Contato' },
  { value: 'dados_entidade', label: 'Dados da Entidade' },
  { value: 'live_chat', label: 'Live Chat' },
  { value: 'definir_unidade', label: 'Definir Unidade' },
  { value: 'rag', label: 'RAG' },
  { value: 'smart_content', label: 'Smart Content' },
  { value: 'registrar_sdm', label: 'Registrar no SDM' },
  { value: 'enviar_midia', label: 'Enviar mídia' },
  { value: 'mensagem_interativa', label: 'Mensagem interativa' }
];

// Define channel types
const channelTypes = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'widget', label: 'Widget' }
];

let nextId = 1;
let nextConnectionId = 1;
let draggedItem: FlowItem | null = null;
let initialX = 0;
let initialY = 0;
let isDraggingConnection = false;
let isDraggingCanvas = false;
let canvasInitialX = 0;
let canvasInitialY = 0;

const addChannel = (channelType: ChannelType) => {
  const channelTypeLabel = getChannelTypeLabel(channelType);
  items.value.push({
    id: nextId++,
    type: 'channel',
    x: Math.random() * 500,
    y: Math.random() * 300,
    description: '',
    channelType: channelType,
    title: channelTypeLabel
  });
};

const addAgent = () => {
  items.value.push({
    id: nextId++,
    type: 'agent',
    x: Math.random() * 500,
    y: Math.random() * 300,
    description: ''
  });
};

const addSkill = (skillType: SkillType) => {
  const skillTypeLabel = getSkillTypeLabel(skillType);
  items.value.push({
    id: nextId++,
    type: 'skill',
    x: Math.random() * 500,
    y: Math.random() * 300,
    description: '',
    skillType: skillType,
    title: skillTypeLabel
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

const getItemIcon = (type: FlowItem['type'], item?: FlowItem) => {
  switch (type) {
    case 'channel':
      if (item?.channelType) {
        switch (item.channelType) {
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
    case 'channel':
      return 'Channel';
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
  
  // Calculate the bounding box of all cards
  if (items.value.length === 0) {
    position.value = { x: 0, y: 0 };
    return;
  }
  
  // Find min and max coordinates to determine bounding box
  const minX = Math.min(...items.value.map(item => item.x));
  const maxX = Math.max(...items.value.map(item => item.x + 350)); // updated from 300px
  const minY = Math.min(...items.value.map(item => item.y));
  const maxY = Math.max(...items.value.map(item => item.y + 160)); // assuming card height is 160px
  
  // Calculate center of the bounding box
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  // Get canvas container dimensions
  const canvasContainer = document.querySelector('.canvas-container');
  if (!canvasContainer) return;
  
  const containerWidth = canvasContainer.clientWidth;
  const containerHeight = canvasContainer.clientHeight;
  
  // Set position to center the cards in the container
  position.value = {
    x: containerWidth / 2 - centerX,
    y: containerHeight / 2 - centerY
  };
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
  // 1. Channel can only connect to agent from right side
  if (sourceItem.type === 'channel' && (targetItem.type !== 'agent' || source.side !== 'right' || target.side !== 'left')) {
    return false;
  }
  
  // 2. Agent can connect to skill from right side
  if (sourceItem.type === 'agent' && source.side === 'right') {
    return targetItem.type === 'skill' && target.side === 'left';
  }
  
  // 3. Agent can receive connection from channel or agent on left side
  if (targetItem.type === 'agent' && target.side === 'left') {
    return sourceItem.type === 'channel' || sourceItem.type === 'agent';
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
  const sourceX = sourceItem ? sourceItem.x + (connection.source.side === 'right' ? 350 : 0) : 0;
  const sourceY = sourceItem ? sourceItem.y + 80 : 0;
  
  let targetX, targetY;
  
  if (connection.isInProgress) {
    // For pending connections, use mouse position as target
    targetX = connection.mousePosX || 0;
    targetY = connection.mousePosY || 0;
  } else if (targetItem) {
    // For completed connections, use the target connection point
    targetX = targetItem.x + (connection.target.side === 'right' ? 350 : 0);
    targetY = targetItem.y + 80;
  } else {
    return '';
  }
  
  // Create a curved path
  const controlPointX1 = sourceX + (connection.source.side === 'right' ? 50 : -50);
  const controlPointX2 = targetX + (connection.target.side === 'right' ? 50 : -50);
  
  return `M ${sourceX} ${sourceY} C ${controlPointX1} ${sourceY}, ${controlPointX2} ${targetY}, ${targetX} ${targetY}`;
};

// Add canvas dragging functions
const startCanvasDrag = (event: MouseEvent) => {
  // Don't start canvas drag if we're over a card or already dragging a connection
  if (event.target !== event.currentTarget || isDraggingConnection) return;
  
  isDraggingCanvas = true;
  canvasInitialX = event.clientX - position.value.x;
  canvasInitialY = event.clientY - position.value.y;
  
  // Add dragging class to canvas
  const canvas = document.querySelector('.canvas-area');
  if (canvas) {
    canvas.classList.add('dragging');
  }
  
  document.addEventListener('mousemove', onCanvasDrag);
  document.addEventListener('mouseup', stopCanvasDrag);
};

const onCanvasDrag = (event: MouseEvent) => {
  if (!isDraggingCanvas) return;
  
  position.value = {
    x: event.clientX - canvasInitialX,
    y: event.clientY - canvasInitialY
  };
};

const stopCanvasDrag = () => {
  isDraggingCanvas = false;
  
  // Remove dragging class from canvas
  const canvas = document.querySelector('.canvas-area');
  if (canvas) {
    canvas.classList.remove('dragging');
  }
  
  document.removeEventListener('mousemove', onCanvasDrag);
  document.removeEventListener('mouseup', stopCanvasDrag);
};

// Helper to get skill type label
const getSkillTypeLabel = (skillType: SkillType): string => {
  const found = skillTypes.find(type => type.value === skillType);
  return found ? found.label : 'Unknown Skill Type';
};

// Helper to get channel type label
const getChannelTypeLabel = (channelType: ChannelType): string => {
  const found = channelTypes.find(type => type.value === channelType);
  return found ? found.label : 'Unknown Channel Type';
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
  document.removeEventListener('mousemove', onCanvasDrag);
  document.removeEventListener('mouseup', stopCanvasDrag);
  
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
  cursor: grab;
}

.canvas-area.dragging {
  cursor: grabbing;
}

.flow-item {
  position: absolute;
  width: 350px;
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

.card-header .text-h6 {
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 