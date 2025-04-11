import React, { useRef, useCallback } from "react";
import { Animated, StyleSheet, Dimensions, TouchableOpacity, Image } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { useChatbot } from "../context/ChatbotContext";

const { width, height } = Dimensions.get("window");
const BUTTON_SIZE = 80;
const SIDE_MARGIN = 20;
const TOP_MARGIN = 80;
const BOTTOM_MARGIN = 150;

const MIN_X = SIDE_MARGIN;
const MAX_X = width - BUTTON_SIZE - SIDE_MARGIN;
const MIN_Y = 20;
const MAX_Y = height - BUTTON_SIZE - 20;

const DEFAULT_X = MAX_X;
const DEFAULT_Y = height - BUTTON_SIZE - BOTTOM_MARGIN;

export default function CatBot() {
  const { catbotIcon } = useChatbot();
  const navigation = useNavigation();

  // Create a single animated value for x and y with the default starting position.
  const translate = useRef(new Animated.ValueXY({ x: DEFAULT_X, y: DEFAULT_Y })).current;
  // Store the last snapped position.
  const lastPositionRef = useRef({ x: DEFAULT_X, y: DEFAULT_Y });

  const openChat = useCallback(() => {
    navigation.navigate("BotCat");
  }, [navigation]);

  // Map selected icon names to image sources.
  const iconMapping = {
    blue: require("../assets/catbots/blue.png"),
    black: require("../assets/catbots/black.png"),
    red: require("../assets/catbots/red.png"),
    green: require("../assets/catbots/green.png"),
    purple: require("../assets/catbots/purple.png"),
    pink: require("../assets/catbots/pink.png"),
    orange: require("../assets/catbots/orange.png"),
    cyan: require("../assets/catbots/cyan.png"),
    yellow: require("../assets/catbots/yellow.png"),
  };

  const iconSource = iconMapping[catbotIcon] || iconMapping.blue;

  // Instead of Animated.event with setOffset, update the position manually.
  const onGestureEvent = useCallback((event) => {
    const { translationX, translationY } = event.nativeEvent;
    const newX = lastPositionRef.current.x + translationX;
    const newY = lastPositionRef.current.y + translationY;
    // Update the animated value with the new position.
    translate.setValue({ x: newX, y: newY });
  }, [translate]);

  // When the gesture ends, compute the final position and snap to the nearest corner.
  const onHandlerStateChange = useCallback(
    ({ nativeEvent }) => {
      if (nativeEvent.state === State.END) {
        // Calculate the new final position by adding the translation to the last recorded position.
        let finalX = lastPositionRef.current.x + nativeEvent.translationX;
        let finalY = lastPositionRef.current.y + nativeEvent.translationY;

        // Clamp the final position within the allowed boundaries.
        finalX = Math.max(MIN_X, Math.min(finalX, MAX_X));
        finalY = Math.max(MIN_Y, Math.min(finalY, MAX_Y));

        // Define the four corner targets for snapping.
        const corners = [
          { x: MIN_X, y: TOP_MARGIN },
          { x: MAX_X, y: TOP_MARGIN },
          { x: MIN_X, y: height - BUTTON_SIZE - BOTTOM_MARGIN },
          { x: MAX_X, y: height - BUTTON_SIZE - BOTTOM_MARGIN },
        ];

        // Find the nearest corner.
        let nearestCorner = corners[0];
        let minDistance = Math.hypot(finalX - corners[0].x, finalY - corners[0].y);
        corners.forEach((corner) => {
          const distance = Math.hypot(finalX - corner.x, finalY - corner.y);
          if (distance < minDistance) {
            minDistance = distance;
            nearestCorner = corner;
          }
        });

        // Update the last position reference.
        lastPositionRef.current = { x: nearestCorner.x, y: nearestCorner.y };

        // Animate the view smoothly to the snapped position.
        Animated.spring(translate, {
          toValue: { x: nearestCorner.x, y: nearestCorner.y },
          bounciness: 8,
          speed:5,
          useNativeDriver: true,
        }).start();
      }
    },
    [translate]
  );

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={[styles.floatingButton, { transform: translate.getTranslateTransform() }]}>
        <TouchableOpacity onPress={openChat} style={[styles.button, { backgroundColor: "#F1EFEC" }]}>
          <Image source={iconSource} style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }} />
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
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
});
