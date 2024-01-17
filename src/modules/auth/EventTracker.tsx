import { useCallback, useEffect } from 'react';

const EventTracker = () => {
  const addOrder = useCallback((ev: CustomEvent<{ cartItems: UserProfile.FakeCartItem[] }>) => {
    const { cartItems = [] } = ev.detail;
    fetch('/api/user/addOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cartItems }),
    });
  }, []);

  // Sending custom events
  useEffect(() => {
    window.addEventListener('Order Completed', addOrder as EventListener);
    return () => {
      window.removeEventListener('Order Completed', addOrder as EventListener);
    };
  }, [addOrder]);

  return null;
};

export default EventTracker;
