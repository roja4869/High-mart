// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';
import { CartProvider } from './context/CartContext';

describe('High Mart App component rendering tests', () => {
  it('renders App component on Home page without ReferenceErrors', () => {
    // Render the App component wrapped in CartProvider
    const renderApp = () => render(
      <CartProvider>
        <App />
      </CartProvider>
    );
    expect(renderApp).not.toThrow();
  });

  it('renders App component on Products page without ReferenceErrors', async () => {
    window.history.pushState({}, 'Products Page', '/products');
    const renderApp = () => render(
      <CartProvider>
        <App />
      </CartProvider>
    );
    expect(renderApp).not.toThrow();
  });
});
