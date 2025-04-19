<template>
  <div class="conversation-section">
    <q-scroll-area class="conversation-messages q-pa-md">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        :class="['message-bubble', message.sender === 'user' ? 'user-message' : 'bot-message']"
      >
        <div class="message-content">
          {{ message.text }}
        </div>
        <div class="message-timestamp text-grey-6">
          {{ formatTime(message.timestamp) }}
        </div>
      </div>
    </q-scroll-area>
    
    <div class="conversation-input q-pa-md">
      <q-form @submit="sendMessage" class="full-width">
        <div class="row items-center">
          <q-input
            v-model="newMessage"
            placeholder="Type your message..."
            dense
            outlined
            class="full-width q-mr-sm"
            bg-color="white"
            autofocus
          />
          <q-btn
            type="submit"
            round
            color="primary"
            icon="send"
            :disable="!newMessage.trim()"
          />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Sample messages for demonstration
const messages = ref([
  {
    text: 'Hello! How can I help you with your agent flow today?',
    sender: 'bot',
    timestamp: new Date(Date.now() - 3600000) // 1 hour ago
  },
  {
    text: 'I need to create a conversational agent for customer support.',
    sender: 'user',
    timestamp: new Date(Date.now() - 3540000) // 59 minutes ago
  },
  {
    text: 'Great! I recommend starting with a WhatsApp channel, connecting it to a conversational agent with GPT-4.1, and adding RAG skills for knowledge retrieval.',
    sender: 'bot',
    timestamp: new Date(Date.now() - 3500000) // 58 minutes ago
  }
]);

const newMessage = ref('');

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
  
  // Simulate bot response after a short delay
  setTimeout(() => {
    messages.value.push({
      text: 'I understand. Let me help you with that! You can add the necessary components through the buttons at the top of the canvas.',
      sender: 'bot',
      timestamp: new Date()
    });
  }, 1000);
};

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<style scoped>
.conversation-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.conversation-messages {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 16px;
}

.conversation-input {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
}

.message-bubble {
  max-width: 80%;
  margin-bottom: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  position: relative;
}

.user-message {
  background-color: #6467F2;
  color: white;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.bot-message {
  background-color: #f1f1f1;
  color: #333;
  margin-right: auto;
  border-bottom-left-radius: 4px;
}

.message-timestamp {
  font-size: 0.7rem;
  text-align: right;
  margin-top: 4px;
}

.user-message .message-timestamp {
  color: rgba(255, 255, 255, 0.7);
}
</style> 