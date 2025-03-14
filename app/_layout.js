import React, { useEffect, useState, useRef } from "react";
import { View, Text, Button, Alert, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "../utils/registerForPushNotificationsAsync"; // Adjust this path as necessary

const RootLayout = () => {
  const [expoPushToken, setExpoPushToken] = useState(null); // Token state
  const [notification, setNotification] = useState(null); // Notification state
  const [notificationResponse, setNotificationResponse] = useState(null); // Notification response state
  const [error, setError] = useState(null); // Error state

  const notificationListener = useRef(null); // Notification listener reference
  const responseListener = useRef(null); // Response listener reference

  // Function to check if the app has permission to receive notifications
  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();

    if (status === "granted") {
      return true; // Permission granted
    } else {
      // Request permission if not granted
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      return newStatus === "granted"; // Return true if permission granted after request
    }
  };

  // Function to set up notification channels (for Android)
  const setupNotificationChannel = async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  };

  // Register notification and listener logic
  useEffect(() => {
    const initializeNotifications = async () => {
      // Set up notification channel for Android
      await setupNotificationChannel();

      // Check if permissions are granted before proceeding
      const isPermissionGranted = await checkPermissions();

      if (!isPermissionGranted) {
        Alert.alert(
          "Permission Required",
          "Please enable push notifications to receive alerts.",
          [{ text: "OK" }]
        );
      } else {
        // Proceed with push notifications registration
        registerForPushNotificationsAsync()
          .then((token) => setExpoPushToken(token))
          .catch((error) => setError(error)); // Capture token or error
        console.log(expoPushToken);

        // Add listener for notification received
        notificationListener.current =
          Notifications.addNotificationReceivedListener((notification) => {
            console.log(
              "🔔 Notification Received in Foreground: ",
              notification
            );
            setNotification(notification); // Set notification state
            // Show alert when notification is received
            Alert.alert(
              notification.request.content.title,
              notification.request.content.body
            );
          });

        // Add listener for notification response
        responseListener.current =
          Notifications.addNotificationResponseReceivedListener((response) => {
            console.log("🔔 Notification Response: ", response);
            setNotificationResponse(response); // Set notification response state
          });
      }
    };

    initializeNotifications();

    // Cleanup listeners on component unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []); // Empty dependency array ensures it runs once when the component mounts

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Your Expo Push Token: {expoPushToken}</Text>

      {/* Display notification content */}
      {notification ? (
        <View style={{ marginTop: 20 }}>
          <Text>Notification Title: {notification.request.content.title}</Text>
          <Text>Notification Body: {notification.request.content.body}</Text>
          <Text>
            Data: {JSON.stringify(notification.request.content.data, null, 2)}
          </Text>
        </View>
      ) : (
        <Text>No notification received yet.</Text>
      )}

      {/* Display notification response content */}
      {notificationResponse ? (
        <View style={{ marginTop: 20 }}>
          <Text>
            Response Notification Title:{" "}
            {notificationResponse.notification.request.content.title}
          </Text>
          <Text>
            Response Notification Body:{" "}
            {notificationResponse.notification.request.content.body}
          </Text>
          <Text>
            Response Data:{" "}
            {JSON.stringify(
              notificationResponse.notification.request.content.data,
              null,
              2
            )}
          </Text>
        </View>
      ) : (
        <Text>No response received yet.</Text>
      )}

      {error && (
        <Text style={{ color: "red" }}>{`Error: ${error.message}`}</Text>
      )}

      {/* Button to trigger actions */}
      <Button
        title="Press to Trigger Notification"
        onPress={() => console.log("Button Pressed!")}
      />
    </View>
  );
};

export default RootLayout;
