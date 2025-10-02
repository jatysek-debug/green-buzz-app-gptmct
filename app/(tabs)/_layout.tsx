
import React from 'react';
import { Redirect } from 'expo-router';

export default function TabLayout() {
  // Redirect to the main screen since we're removing tabs
  return <Redirect href="/" />;
}
