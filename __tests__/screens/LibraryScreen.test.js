import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

// Mocking dependencies BEFORE importing LibraryScreen
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(),
}));

jest.mock('expo-modules-core', () => ({
  EventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  })),
  NativeModulesProxy: {},
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useFocusEffect: (cb) => cb(),
  usePathname: () => '/library',
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => children,
}));

// Mocking BirdSilhouette because it uses SVG which can be complex in tests
jest.mock('../../components/BirdSilhouette', () => 'BirdSilhouette');

import LibraryScreen from '../../app/library';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';

describe('LibraryScreen', () => {
  const mockSightings = [
    { id: '1', species: 'American Robin', rarity: 'common', imageUrl: '/robin.jpg', timestamp: new Date().toISOString(), color: '#4CAF50' },
    { id: '2', species: 'Blue Jay', rarity: 'uncommon', imageUrl: '/bluejay.jpg', timestamp: new Date().toISOString(), color: '#2196F3' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'token') return Promise.resolve('fake-token');
        if (key === '@offline_queue') return Promise.resolve(JSON.stringify([]));
        return Promise.resolve(null);
    });
    Network.getNetworkStateAsync.mockResolvedValue({ isConnected: true, isInternetReachable: true });
    axios.get.mockResolvedValue({ data: mockSightings });
  });

  test('fetches and displays sightings from the API', async () => {
    const { getByText } = render(<LibraryScreen />);
    
    expect(getByText('YOUR WINGDEX')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('American Robin')).toBeTruthy();
      expect(getByText('Blue Jay')).toBeTruthy();
    });

    expect(axios.get).toHaveBeenCalled();
  });

  test('displays empty message when no data is found', async () => {
    axios.get.mockResolvedValue({ data: [] });
    const { getByText } = render(<LibraryScreen />);
    
    await waitFor(() => {
      expect(getByText('Your WingDex is currently empty!')).toBeTruthy();
    });
  });
});
