import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BottomNav from '../../components/BottomNav';
import { useRouter, usePathname } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe('BottomNav', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({ push: mockPush });
    usePathname.mockReturnValue('/home');
    jest.clearAllMocks();
  });

  test('calls router.push("/library") when DEX is pressed', () => {
    const { getByText } = render(<BottomNav />);
    const dexButton = getByText('DEX');
    
    fireEvent.press(dexButton);
    
    expect(mockPush).toHaveBeenCalledWith('/library');
  });

  test('calls router.push("/camera") when camera button is pressed', () => {
    const { getByTestId } = render(<BottomNav />);
    const cameraButton = getByTestId('camera-button');
    
    fireEvent.press(cameraButton);
    
    expect(mockPush).toHaveBeenCalledWith('/camera');
  });

  test('highlights the active tab', () => {
    usePathname.mockReturnValue('/library');
    const { getByText } = render(<BottomNav />);
    const dexText = getByText('DEX');
    
    // We check for the active color from theme (sage)
    // Styles are an array in the component: [styles.tabText, isDex && styles.tabActive]
    // The tabActive style has color: Colors.sage (#8FAF7A)
    expect(dexText.props.style).toContainEqual({ color: '#8FAF7A' });
  });
});
