import React, { useRef, useMemo, useCallback } from "react";
import { Animated, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const BUTTON_SIZE = 80;
const SIDE_MARGIN = 20;   // left/right margin for free dragging
const TOP_MARGIN = 80;     // snapping top margin
const BOTTOM_MARGIN = 150;  // snapping bottom margin

const MIN_X = SIDE_MARGIN;
const MAX_X = width - BUTTON_SIZE - SIDE_MARGIN;
// These free-drag boundaries keep the button on screen.
// Adjust these values as needed.
const MIN_Y = 20;
const MAX_Y = height - BUTTON_SIZE - 20;

// Default position: bottom-right with bottom margin of 150.
const DEFAULT_X = MAX_X;
const DEFAULT_Y = height - BUTTON_SIZE - BOTTOM_MARGIN;

export default function FloatingButton() {
  // Set up animated values and a ref for the last confirmed position.
  const translateX = useRef(new Animated.Value(DEFAULT_X)).current;
  const translateY = useRef(new Animated.Value(DEFAULT_Y)).current;
  const lastPositionRef = useRef({ x: DEFAULT_X, y: DEFAULT_Y });

  // Navigation function using useCallback.
  const navigation = useNavigation();
  const openChat = useCallback(() => {
    navigation.navigate("BotCat");
  }, [navigation]);

  // Memoize the gesture event handler.
  const onGestureEvent = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
        { useNativeDriver: false }
      ),
    [translateX, translateY]
  );

  // Gesture state change handler that snaps the button to the nearest corner.
  const onHandlerStateChange = useCallback(
    ({ nativeEvent }) => {
      if (nativeEvent.state === State.BEGAN) {
        // When drag starts, set the current position as offset.
        translateX.setOffset(lastPositionRef.current.x);
        translateY.setOffset(lastPositionRef.current.y);
        translateX.setValue(0);
        translateY.setValue(0);
      }
      if (nativeEvent.state === State.END) {
        // Update the last known position with the drag translation.
        lastPositionRef.current.x += nativeEvent.translationX;
        lastPositionRef.current.y += nativeEvent.translationY;

        // Clamp free-drag values so the button stays on-screen.
        lastPositionRef.current.x = Math.max(
          MIN_X,
          Math.min(lastPositionRef.current.x, MAX_X)
        );
        lastPositionRef.current.y = Math.max(
          MIN_Y,
          Math.min(lastPositionRef.current.y, MAX_Y)
        );

        // Define snapping corners using the new vertical margins.
        const corners = [
          { x: MIN_X, y: TOP_MARGIN },
          { x: MAX_X, y: TOP_MARGIN },
          { x: MIN_X, y: height - BUTTON_SIZE - BOTTOM_MARGIN },
          { x: MAX_X, y: height - BUTTON_SIZE - BOTTOM_MARGIN },
        ];

        // Find the nearest corner using Euclidean distance.
        let nearestCorner = corners[0];
        let minDistance = Math.hypot(
          lastPositionRef.current.x - corners[0].x,
          lastPositionRef.current.y - corners[0].y
        );
        corners.forEach((corner) => {
          const distance = Math.hypot(
            lastPositionRef.current.x - corner.x,
            lastPositionRef.current.y - corner.y
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestCorner = corner;
          }
        });

        // Snap to the nearest corner.
        lastPositionRef.current.x = nearestCorner.x;
        lastPositionRef.current.y = nearestCorner.y;

        Animated.spring(translateX, {
          toValue: lastPositionRef.current.x,
          useNativeDriver: false,
        }).start();
        Animated.spring(translateY, {
          toValue: lastPositionRef.current.y,
          useNativeDriver: false,
        }).start();

        // Reset offsets.
        translateX.setOffset(0);
        translateX.setValue(lastPositionRef.current.x);
        translateY.setOffset(0);
        translateY.setValue(lastPositionRef.current.y);
      }
    },
    [translateX, translateY]
  );

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.floatingButton,
          { transform: [{ translateX }, { translateY }] },
        ]}
      >
        <TouchableOpacity onPress={openChat} style={styles.button}>
          <Ionicons name="logo-octocat" size={40} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    zIndex: 1000,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "#182952",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
});
