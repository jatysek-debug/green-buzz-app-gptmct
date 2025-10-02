
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
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    // Register background fetch
    registerBackgroundFetch();
    
    // Listen to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
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

  let vibrationInterval: NodeJS.Timeout | null = null;

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log('App state changed:', nextAppState);
    setAppState(nextAppState);
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
    
    if (value) {
      Alert.alert(
        'Background Vibration Enabled',
        'Your phone will vibrate every 2 seconds even when the app is minimized. This feature works best when Background App Refresh is enabled in Settings.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Vibration App",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            color: colors.text,
          },
        }}
      />
      <View style={styles.container}>
        {/* Switch in top right */}
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Background Vibration</Text>
          <Switch
            value={isBackgroundVibrationEnabled}
            onValueChange={handleSwitchToggle}
            trackColor={{ 
              false: '#767577', 
              true: colors.accent 
            }}
            thumbColor={isBackgroundVibrationEnabled ? colors.primary : '#f4f3f4'}
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
          >
            <Text style={styles.rectangleText}>
              Hold me to vibrate
            </Text>
          </Pressable>
        </View>

        {/* Status indicator */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            App State: {appState}
          </Text>
          <Text style={styles.statusText}>
            Background Vibration: {isBackgroundVibrationEnabled ? 'ON' : 'OFF'}
          </Text>
          {Platform.OS === 'ios' && (
            <Text style={styles.infoText}>
              Note: Background vibration works best with Background App Refresh enabled in iOS Settings.
            </Text>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  switchContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  switchLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenRectangle: {
    width: 200,
    height: 120,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  greenRectanglePressed: {
    backgroundColor: colors.accent,
    transform: [{ scale: 0.95 }],
  },
  rectangleText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  statusText: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  infoText: {
    color: colors.grey,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    lineHeight: 16,
  },
});
