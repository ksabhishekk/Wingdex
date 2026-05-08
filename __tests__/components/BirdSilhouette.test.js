import React from 'react';
import { render } from '@testing-library/react-native';
import BirdSilhouette from '../../components/BirdSilhouette';

describe('BirdSilhouette', () => {
  test('matches snapshot for bird 001', () => {
    const bird = { id: '001', accentColor: '#ff0000' };
    const { toJSON } = render(<BirdSilhouette bird={bird} />);
    expect(toJSON()).toMatchSnapshot();
  });

  test('renders bird 001 when no bird is provided', () => {
    const { toJSON } = render(<BirdSilhouette bird={null} />);
    expect(toJSON()).toMatchSnapshot();
  });
});
