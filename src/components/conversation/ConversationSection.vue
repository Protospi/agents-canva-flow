<template>
  <div class="chat-container">
    <!-- Messages area (scrollable) -->
    <div class="messages-area">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        class="message-row"
        :class="message.sender === 'user' ? 'user-row' : 'bot-row'"
      >
        <!-- User Message with Avatar -->
        <template v-if="message.sender === 'user'">
          <div class="avatar-container">
            <q-avatar size="40px" color="primary" text-color="white">
              <q-icon name="person" />
            </q-avatar>
          </div>
          <div class="message-container">
            <div class="message-bubble user-message">
              <div class="message-content">
                {{ message.text }}
              </div>
            </div>
            <div class="message-timestamp text-grey-6">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
        </template>
        
        <!-- Bot Message with Avatar -->
        <template v-else>
          <div class="message-container">
            <div class="message-bubble bot-message">
              <div class="message-content">
                {{ message.text }}
              </div>
            </div>
            <div class="message-timestamp text-grey-6">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>
          <div class="avatar-container">
            <q-avatar size="40px" color="primary" text-color="white">
              <q-icon name="smart_toy" />
            </q-avatar>
          </div>
        </template>
      </div>
    </div>
    
    <!-- Input area (fixed at bottom) -->
    <div class="input-area">
      <q-input
        v-model="newMessage"
        placeholder="Type your message..."
        outlined
        rounded
        dense
        class="message-input"
        bg-color="white"
        @keyup.enter="sendMessage"
      >
        <template v-slot:after>
          <q-btn
            round
            color="primary"
            icon="send"
            :disable="!newMessage.trim()"
            @click="sendMessage"
          />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

// Define the message type
interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Sample messages for demonstration with proper typing
const messages = ref<Message[]>([]);

const newMessage = ref('');

// Function to scroll to the bottom of messages
const scrollToBottom = () => {
  void nextTick(() => {
    const messagesArea = document.querySelector('.messages-area');
    if (messagesArea) {
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }
  });
};

// Scroll to bottom when component is mounted
onMounted(() => {
  scrollToBottom();
});

const sendMessage = () => {
  if (!newMessage.value.trim()) return;
  
  // Add user message
  messages.value.push({
    text: newMessage.value,
    sender: 'user',
    timestamp: new Date()
  });
  
  // Clear input
  newMessage.value = '';
  
  // Scroll to bottom after adding user message
  scrollToBottom();
  
  // Default assistant response
  setTimeout(() => {
    messages.value.push({
      text: "I understand your request. This is a default assistant response.",
      sender: 'bot',
      timestamp: new Date()
    });
    
    // Scroll to bottom after adding bot message
    scrollToBottom();
  }, 1000);
};

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background-color: #f8f9fa;
}

.messages-area {
  height: calc(100% - 100px); /* Fixed height: total height minus input height */
  min-height: 800px; /* Minimum height to ensure it doesn't collapse */
  max-height: 800px;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-area {
  height: 70px; /* Fixed height for input area */
  padding: 12px 16px;
  background-color: white;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  flex-shrink: 0; /* Prevent this from shrinking */
}

.message-input {
  width: 100%;
}

.message-row {
  display: flex;
  align-items: flex-start;
  max-width: 80%;
}

.user-row {
  justify-content: flex-start;
  align-self: flex-start;
}

.bot-row {
  justify-content: flex-end;
  align-self: flex-end;
}

.avatar-container {
  margin: 0 10px;
  flex-shrink: 0;
}

.message-container {
  display: flex;
  flex-direction: column;
  max-width: calc(100% - 60px);
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.user-message {
  background-color: white;
  color: #333;
  border-bottom-left-radius: 4px;
}

.bot-message {
  background-color: white;
  color: #333;
  border-bottom-right-radius: 4px;
}

.message-content {
  word-break: break-word;
  line-height: 1.4;
}

.message-timestamp {
  font-size: 0.7rem;
  margin-top: 4px;
  padding: 0 4px;
}

.user-row .message-timestamp {
  text-align: right;
}

.bot-row .message-timestamp {
  text-align: left;
}
</style> 