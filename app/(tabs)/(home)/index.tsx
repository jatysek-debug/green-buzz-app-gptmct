
import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  Platform,
  Alert,
  AppState,
  AppStateStatus
} from "react-native";
import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import { colors } from "@/styles/commonStyles";

const BACKGROUND_VIBRATION_TASK = 'background-vibration';

// Define the background task
TaskManager.defineTask(BACKGROUND_VIBRATION_TASK, async () => {
  console.log('Background vibration task running');
  try {
    // Trigger vibration in background
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.log('Background task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export default function HomeScreen() {
  const [isBackgroundVibrationEnabled, setIsBackgroundVibrationEnabled] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);

  let vibrationInterval: NodeJS.Timeout | null = null;

  useEffect(() => {
    // Register background fetch
    registerBackgroundFetch();
    
    return () => {
      if (vibrationInterval) {
        clearInterval(vibrationInterval);
      }
    };
  }, []);

  useEffect(() => {
    // Handle background vibration toggle
    if (isBackgroundVibrationEnabled) {
      startBackgroundVibration();
    } else {
      stopBackgroundVibration();
    }
  }, [isBackgroundVibrationEnabled]);

  const registerBackgroundFetch = async () => {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_VIBRATION_TASK, {
        minimumInterval: 1000, // 1 second
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('Background fetch registered');
    } catch (error) {
      console.log('Failed to register background fetch:', error);
    }
  };

  const startBackgroundVibration = async () => {
    try {
      const status = await BackgroundFetch.getStatusAsync();
      if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
        console.log('Background vibration started');
        // Start periodic vibration
        vibrationInterval = setInterval(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }, 2000); // Vibrate every 2 seconds
      } else {
        Alert.alert(
          'Background App Refresh Disabled',
          'Please enable Background App Refresh in Settings to use this feature.'
        );
      }
    } catch (error) {
      console.log('Error starting background vibration:', error);
    }
  };

  const stopBackgroundVibration = () => {
    if (vibrationInterval) {
      clearInterval(vibrationInterval);
      vibrationInterval = null;
    }
    console.log('Background vibration stopped');
  };

  const handleLongPress = () => {
    console.log('Long press detected on green rectangle');
    setIsLongPressing(true);
    
    // Trigger strong vibration
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Reset after a short delay
    setTimeout(() => {
      setIsLongPressing(false);
    }, 200);
  };

  const handleSwitchToggle = (value: boolean) => {
    console.log('Background vibration switch toggled:', value);
    setIsBackgroundVibrationEnabled(value);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View style={styles.container}>
        {/* Switch in top right */}
        <View style={styles.switchContainer}>
          <Switch
            value={isBackgroundVibrationEnabled}
            onValueChange={handleSwitchToggle}
            trackColor={{ 
              false: '#767577', 
              true: '#4CAF50' 
            }}
            thumbColor={isBackgroundVibrationEnabled ? '#2E7D32' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>

        {/* Green rectangle in center */}
        <View style={styles.centerContainer}>
          <Pressable
            onLongPress={handleLongPress}
            delayLongPress={500}
            style={[
              styles.greenRectangle,
              isLongPressing && styles.greenRectanglePressed
            ]}
          />
        </View>

        {/* Only "background" text */}
        <View style={styles.textContainer}>
          <Text style={styles.backgroundText}>background</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenRectangle: {
    width: 200,
    height: 120,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
  },
  greenRectanglePressed: {
    backgroundColor: '#2E7D32',
    transform: [{ scale: 0.95 }],
  },
  textContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  backgroundText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '400',
  },
});
