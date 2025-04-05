import React, { useRef, useMemo, useCallback } from "react";
import { Animated, StyleSheet, Dimensions, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
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
  const { theme } = useTheme();
  const { catbotIcon } = useChatbot();
  const translateX = useRef(new Animated.Value(DEFAULT_X)).current;
  const translateY = useRef(new Animated.Value(DEFAULT_Y)).current;
  const lastPositionRef = useRef({ x: DEFAULT_X, y: DEFAULT_Y });

  const navigation = useNavigation();
  const openChat = useCallback(() => {
    navigation.navigate("BotCat");
  }, [navigation]);

  // Map selected icon names to image sources
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

  const onGestureEvent = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
        { useNativeDriver: false }
      ),
    [translateX, translateY]
  );

  const onHandlerStateChange = useCallback(
    ({ nativeEvent }) => {
      if (nativeEvent.state === State.BEGAN) {
        translateX.setOffset(lastPositionRef.current.x);
        translateY.setOffset(lastPositionRef.current.y);
        translateX.setValue(0);
        translateY.setValue(0);
      }
      if (nativeEvent.state === State.END) {
        lastPositionRef.current.x += nativeEvent.translationX;
        lastPositionRef.current.y += nativeEvent.translationY;

        lastPositionRef.current.x = Math.max(MIN_X, Math.min(lastPositionRef.current.x, MAX_X));
        lastPositionRef.current.y = Math.max(MIN_Y, Math.min(lastPositionRef.current.y, MAX_Y));

        const corners = [
          { x: MIN_X, y: TOP_MARGIN },
          { x: MAX_X, y: TOP_MARGIN },
          { x: MIN_X, y: height - BUTTON_SIZE - BOTTOM_MARGIN },
          { x: MAX_X, y: height - BUTTON_SIZE - BOTTOM_MARGIN },
        ];

        let nearestCorner = corners[0];
        let minDistance = Math.hypot(lastPositionRef.current.x - corners[0].x, lastPositionRef.current.y - corners[0].y);
        corners.forEach((corner) => {
          const distance = Math.hypot(lastPositionRef.current.x - corner.x, lastPositionRef.current.y - corner.y);
          if (distance < minDistance) {
            minDistance = distance;
            nearestCorner = corner;
          }
        });

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

        translateX.setOffset(0);
        translateX.setValue(lastPositionRef.current.x);
        translateY.setOffset(0);
        translateY.setValue(lastPositionRef.current.y);
      }
    },
    [translateX, translateY]
  );

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
      <Animated.View
        style={[
          styles.floatingButton,
          { transform: [{ translateX }, { translateY }] },
        ]}
      >
        <TouchableOpacity onPress={openChat} style={[styles.button, { backgroundColor: "#F1EFEC" }]}>
          <Image source={iconSource} style={{ width: 80, height: 80 }} />
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
