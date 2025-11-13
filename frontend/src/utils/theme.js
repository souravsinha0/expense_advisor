import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976D2',
    secondary: '#FF9800',
    surface: '#FFFFFF',
    background: '#F5F7FA',
    error: '#D32F2F',
    success: '#4CAF50',
    warning: '#FF9800',
    income: '#4CAF50',
    expense: '#F44336',
    outline: '#E0E0E0',
    onPrimary: '#FFFFFF',
    onSurface: '#000000',
  },
};

export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
    paddingTop: 16,
  },
  card: {
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: '#FFFFFF',
  },
  input: {
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginVertical: 8,
    borderRadius: 12,
    paddingVertical: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  smallButton: {
    marginVertical: 4,
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 100,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    marginHorizontal: 4,
  },
};