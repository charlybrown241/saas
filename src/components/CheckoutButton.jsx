// app/components/CheckoutButton.tsx
'use client';

import { useEffect, useState } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';

export default function CheckoutButton() {
  const [paddle, setPaddle] = useState<Paddle | null>(null);

  useEffect(() => {
    initializePaddle({
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
    }).then((paddleInstance) => {
      if (paddleInstance) setPaddle(paddleInstance);
    });
  }, []);

  const handleCheckout = () => {
    if (!paddle) return;

    paddle.Checkout.open({
      items: [
        {
          priceId: 'pri_01kymbpt28ppymjvmvs5kk3q3z', // ID du pack Pro
          quantity: 1,
        },
      ],
    });
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={!paddle}
      className="px-4 py-2 bg-[#163a24] text-[#a3e635] font-bold rounded-xl disabled:bg-gray-400"
    >
      {paddle ? 'Acheter le Pack Pro (Test)' : 'Chargement...'}
    </button>
  );
}