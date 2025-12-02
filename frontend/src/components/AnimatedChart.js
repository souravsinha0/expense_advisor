import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export const AnimatedLineChart = ({ data, title }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#667eea',
    backgroundGradientTo: '#764ba2',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 20,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '3',
      stroke: '#fff',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: 'rgba(255, 255, 255, 0.2)',
    },
  };

  return (
    <Animated.View style={[styles.chartContainer, { opacity: fadeAnim }]}>
      <Surface style={styles.chartSurface} elevation={4}>
        <Text style={styles.chartTitle}>{title}</Text>
        <LineChart
          data={data}
          width={screenWidth - 120}
          height={280}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={true}
          withShadow={true}
          fromZero={true}
        />
      </Surface>
    </Animated.View>
  );
};

export const AnimatedBarChart = ({ data, title }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#4facfe',
    backgroundGradientTo: '#00f2fe',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 20,
    },
    barPercentage: 0.7,
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: 'rgba(255, 255, 255, 0.2)',
    },
  };

  return (
    <Animated.View style={[styles.chartContainer, { opacity: fadeAnim }]}>
      <Surface style={styles.chartSurface} elevation={4}>
        <Text style={styles.chartTitle}>{title}</Text>
        <BarChart
          data={data}
          width={screenWidth - 120}
          height={280}
          chartConfig={chartConfig}
          style={styles.chart}
          withInnerLines={true}
          showValuesOnTopOfBars={true}
          fromZero={true}
        />
      </Surface>
    </Animated.View>
  );
};

export const AnimatedPieChart = ({ data, title }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const chartConfig = {
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  };

  return (
    <Animated.View style={[styles.chartContainer, { opacity: fadeAnim }]}>
      <Surface style={styles.chartSurface} elevation={4}>
        <Text style={styles.chartTitle}>{title}</Text>
        <PieChart
          data={data}
          width={screenWidth - 120}
          height={220}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          hasLegend={true}
          style={styles.chart}
        />
      </Surface>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginBottom: 24,
  },
  chartSurface: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  chart: {
    borderRadius: 20,
    marginVertical: 8,
  },
});
