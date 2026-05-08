import React from 'react';
import { render } from '@testing-library/react-native';
import RarityTag from '../../components/RarityTag';

describe('RarityTag', () => {
  test('renders correctly for common rarity', () => {
    const { getByText } = render(<RarityTag rarity="common" />);
    expect(getByText('COMMON')).toBeTruthy();
  });

  test('renders correctly for rare rarity', () => {
    const { getByText } = render(<RarityTag rarity="rare" />);
    expect(getByText('RARE')).toBeTruthy();
  });

  test('defaults to common if rarity is invalid', () => {
    const { getByText } = render(<RarityTag rarity="unknown-rarity" />);
    expect(getByText('COMMON')).toBeTruthy();
  });
});
