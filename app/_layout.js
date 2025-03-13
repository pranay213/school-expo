import { useEffect, useState } from "react";
import { Slot, Stack } from "expo-router";
import { Text, View } from "react-native";
import messaging from "@react-native-firebase/messaging";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export default function RootLayout() {
  const [permissionStatus, setPermissionStatus] = useState("checking");

  async function registerForPushNotifications() {
    if (Platform.OS === "android") {
      await messaging().requestPermission();
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        setPermissionStatus("denied");
        return;
      }

      setPermissionStatus("granted");

      // Get the token
      if (Platform.OS === "ios") {
        const token = await messaging().getAPNSToken();
        console.log("APNS Token:", token);
      }

      const fcmToken = await messaging().getToken();
      console.log("FCM Token:", fcmToken);

      // Here you would typically send this token to your backend
      // saveTokenToDatabase(fcmToken);
    } else {
      setPermissionStatus("device-not-supported");
    }
  }

  useEffect(() => {
    registerForPushNotifications();

    // Set up notification handlers
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("Foreground message received:", remoteMessage);
      // Handle the notification when app is in foreground
    });

    // Handle notification when app is in background or closed
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Background message received:", remoteMessage);
      // Handle the notification when app is in background
    });

    return unsubscribe;
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
