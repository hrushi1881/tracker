import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { format } from '@/utils/formatters';
import theme from '@/constants/theme';
import { useAppContext } from '@/context/AppContext';
import { generateAIInsights } from '@/utils/aiHelpers';
import { AIInsight } from '@/types';
import { CircleAlert as AlertCircle, Award, TrendingUp, Lightbulb, Clock, Info, Settings, X } from 'lucide-react-native';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryLegend, VictoryBar, VictoryTooltip, VictoryLabel } from 'victory-native';

export default function InsightsScreen() {
  const { transactions, userData, isDarkMode, updateUserData } = useAppContext();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [targetAmount, setTargetAmount] = useState(
    userData?.monthlyBudgetTarget?.toString() || ''
  );
  
  const activeTheme = isDarkMode ? theme.colors.dark : theme.colors.light;
  
  // Calculate daily spending
  const getDailySpending = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      transactionDate.setHours(0, 0, 0, 0);
      return transactionDate.getTime() === today.getTime() && t.type === 'expense';
    });
    
    const totalSpent = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const dailyBudget = userData?.monthlyBudgetTarget 
      ? userData.monthlyBudgetTarget / 30 
      : userData?.monthlyExpenseEstimate 
        ? userData.monthlyExpenseEstimate / 30 
        : 1000; // Default budget
    
    return {
      spent: totalSpent,
      budget: dailyBudget,
      progress: (totalSpent / dailyBudget) * 100,
    };
  };

  // Handle saving monthly target
  const handleSaveTarget = () => {
    const amount = parseFloat(targetAmount);
    if (!isNaN(amount) && amount > 0) {
      updateUserData({ monthlyBudgetTarget: amount });
      setTargetModalVisible(false);
    }
  };
  
  // Rest of your existing code...
  
  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: activeTheme.text }]}>AI Insights</Text>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Daily Spending Progress */}
        <View style={[styles.card, { backgroundColor: activeTheme.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: activeTheme.text }]}>
              Daily Spending
            </Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setTargetModalVisible(true)}
            >
              <Settings size={20} color={activeTheme.subtext} />
            </TouchableOpacity>
          </View>
          
          {/* Rest of your existing daily spending UI... */}
        </View>
        
        {/* Rest of your existing code... */}
        
        {/* Monthly Target Modal */}
        <Modal
          visible={targetModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setTargetModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: activeTheme.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: activeTheme.text }]}>
                  Set Monthly Budget Target
                </Text>
                <TouchableOpacity onPress={() => setTargetModalVisible(false)}>
                  <X size={24} color={activeTheme.text} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.modalLabel, { color: activeTheme.text }]}>
                Enter your target monthly budget:
              </Text>
              
              <View style={[styles.targetInputContainer, { backgroundColor: activeTheme.card }]}>
                <Text style={[styles.currencySymbol, { color: activeTheme.text }]}>
                  {userData?.currency === 'USD' ? '$' : userData?.currency}
                </Text>
                <TextInput
                  style={[styles.targetInput, { color: activeTheme.text }]}
                  placeholder="0.00"
                  placeholderTextColor={activeTheme.subtext}
                  keyboardType="numeric"
                  value={targetAmount}
                  onChangeText={text => {
                    if (/^\d*\.?\d*$/.test(text)) {
                      setTargetAmount(text);
                    }
                  }}
                />
              </View>
              
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!targetAmount || parseFloat(targetAmount) <= 0) && styles.saveButtonDisabled
                ]}
                onPress={handleSaveTarget}
                disabled={!targetAmount || parseFloat(targetAmount) <= 0}
              >
                <Text style={styles.saveButtonText}>Save Target</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... your existing styles ...
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  settingsButton: {
    padding: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: theme.roundness.lg,
    borderTopRightRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.xl,
  },
  modalLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.size.md,
    marginBottom: theme.spacing.md,
  },
  targetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.roundness.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  currencySymbol: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.xxl,
    marginRight: theme.spacing.sm,
  },
  targetInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.size.xxl,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.roundness.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.light.border,
  },
  saveButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.md,
    color: 'white',
  },
});