import React from 'react';
import './globals.css';

export const metadata = {
  title: 'E-commerce App',
  description: 'A modern e-commerce application built with Next.js and Tailwind CSS',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}