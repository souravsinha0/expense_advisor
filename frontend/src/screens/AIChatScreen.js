import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Animated } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { aiAPI } from '../services/api';
import { commonStyles } from '../utils/theme';

export default function AIChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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
        text: "I'm having trouble responding. Please try again.",
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
      link.download = `chart_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <View style={commonStyles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {!hasMessages ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🤖</Text>
            <Text style={styles.emptyTitle}>Financial Assistant</Text>
            <Text style={styles.emptySubtitle}>Ask me anything about your finances</Text>
            <View style={styles.suggestionsContainer}>
              <TouchableOpacity style={styles.suggestionChip} onPress={() => setInputText('How much did I spend this month?')}>
                <Text style={styles.suggestionText}>💰 Monthly spending</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.suggestionChip} onPress={() => setInputText('What are my top expenses?')}>
                <Text style={styles.suggestionText}>📊 Top expenses</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.suggestionChip} onPress={() => setInputText('Show me my income vs expenses')}>
                <Text style={styles.suggestionText}>📈 Income vs expenses</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.suggestionChip} onPress={() => setInputText('Budget recommendations')}>
                <Text style={styles.suggestionText}>💡 Budget tips</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View key={message.id} style={[styles.messageRow, message.isBot ? styles.botRow : styles.userRow]}>
                {message.isBot && <Text style={styles.botAvatar}>🤖</Text>}
                <View style={[styles.messageBubble, message.isBot ? styles.botBubble : styles.userBubble]}>
                  <Text style={[styles.messageText, message.isBot ? styles.botText : styles.userText]}>
                    {message.text}
                  </Text>
                  {message.chartUrl && (
                    <View style={styles.chartContainer}>
                      {Platform.OS === 'web' ? (
                        <img
                          src={message.chartUrl}
                          style={styles.chartImage}
                          alt="Chart"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : null}
                      <TouchableOpacity
                        style={styles.downloadBtn}
                        onPress={() => downloadChart(message.chartUrl)}
                      >
                        <Text style={styles.downloadText}>💾 Download</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
            {loading && (
              <View style={[styles.messageRow, styles.botRow]}>
                <Text style={styles.botAvatar}>🤖</Text>
                <View style={[styles.messageBubble, styles.botBubble]}>
                  <View style={styles.loadingDots}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        <View style={[styles.inputContainer, hasMessages && styles.inputContainerFixed]}>
          <Surface style={styles.inputCard} elevation={3}>
            <View style={styles.inputWrapper}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about your finances..."
                mode="flat"
                multiline
                maxLength={500}
                style={styles.textInput}
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
                onPress={sendMessage}
                disabled={!inputText.trim() || loading}
              >
                <Text style={styles.sendIcon}>📤</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 32,
  },
  suggestionsContainer: {
    width: '20%',
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
  },

  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },

  messageRow: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-end',
    gap: 8,
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },

  botAvatar: {
    fontSize: 20,
    marginBottom: 4,
  },

  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
  },
  botBubble: {
    backgroundColor: '#f1f5f9',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },

  messageText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  botText: {
    color: '#1e293b',
  },
  userText: {
    color: '#fff',
  },

  chartContainer: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartImage: {
    width: '100%',
    height: 250,
    objectFit: 'contain',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  downloadBtn: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  downloadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
  },

  loadingDots: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366f1',
  },

  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  inputContainerFixed: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#eff7feff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: 12,
  },

  inputCard: {
    backgroundColor: '#eff7feff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d4e5fcff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 80,
    backgroundColor: '#eff7feff',
    fontSize: 13,
    minHeight: 36,
    borderRadius: 12,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#af80e4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  sendIcon: {
    fontSize: 16,
  },
});
