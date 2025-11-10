import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, TextInput, Button, Text, Avatar, IconButton } from 'react-native-paper';
import { aiAPI } from '../services/api';
import { theme, commonStyles } from '../utils/theme';

export default function AIChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI financial advisor. Ask me anything about your expenses, budgeting, or financial planning.",
      isBot: true,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await aiAPI.chat({ message: inputText });
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response,
        isBot: true,
        timestamp: new Date(),
        chartUrl: response.data.chart_url,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const downloadChart = (chartUrl) => {
    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = chartUrl;
      // link.href = `http://localhost:8000`+chartUrl;
      // console.log("char url .............. ", chartUrl)
      // console.log('url is _________________ is '+chartUrl);
      link.download = `chart_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Alert.alert('Download', 'Chart download feature coming soon for mobile!');
    }
  };

  const renderMessage = (message) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.isBot ? styles.botMessage : styles.userMessage
    ]}>
      {message.isBot && (
        <Avatar.Icon
          size={36}
          icon="robot"
          style={styles.avatar}
        />
      )}
      <View style={[
        styles.messageBubble,
        message.isBot ? styles.botBubble : styles.userBubble
      ]}>
        <Text style={[
          styles.messageText,
          message.isBot ? styles.botText : styles.userText
        ]}>
          {message.text}
        </Text>
        
        {message.chartUrl && (
          <View style={styles.chartContainer}>
            <Image 
              source={{ uri: message.chartUrl }} 
              style={styles.chartImage}
              resizeMode="contain"
            />
            <View style={styles.chartActions}>
              <Text style={styles.chartLabel}>📊 Generated Chart</Text>
              <IconButton
                icon="download"
                size={20}
                onPress={() => downloadChart(message.chartUrl)}
                style={styles.downloadButton}
              />
            </View>
          </View>
        )}
        
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.headerTitle}>💬 AI Financial Advisor</Title>
          <Text style={styles.headerSubtitle}>Get personalized financial insights</Text>
        </Card.Content>
      </Card>

      <ScrollView 
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
        {loading && (
          <View style={[styles.messageContainer, styles.botMessage]}>
            <Avatar.Icon size={36} icon="robot" style={styles.avatar} />
            <View style={[styles.messageBubble, styles.botBubble]}>
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <Card style={styles.inputCard}>
        <Card.Content style={styles.inputContainer}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about your finances..."
            mode="outlined"
            multiline
            style={styles.textInput}
            onSubmitEditing={sendMessage}
          />
          <Button
            mode="contained"
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
            style={styles.sendButton}
            icon="send"
          >
            Send
          </Button>
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    textAlign: 'center',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  avatar: {
    marginRight: 8,
    backgroundColor: theme.colors.primary,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    elevation: 2,
  },
  botBubble: {
    backgroundColor: '#F0F4F8',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  botText: {
    color: '#333',
  },
  userText: {
    color: '#FFFFFF',
  },
  chartContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#FFFFFF',
  },
  chartActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  downloadButton: {
    margin: 0,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 6,
    opacity: 0.7,
  },
  loadingText: {
    fontStyle: 'italic',
    color: '#666',
  },
  inputCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#FFFFFF',
  },
  sendButton: {
    alignSelf: 'flex-end',
    borderRadius: 8,
  },
});