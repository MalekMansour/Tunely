import React, { useRef } from "react";
import { TouchableOpacity, Animated, Dimensions, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function CatBot() {

  const translateX = useRef(new Animated.Value(width - 80)).current;
  const translateY = useRef(new Animated.Value(height - 180)).current;

  const lastOffset = useRef({ x: width - 80, y: height - 180 }).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      lastOffset.x += nativeEvent.translationX;
      lastOffset.y += nativeEvent.translationY;
      translateX.setOffset(lastOffset.x);
      translateX.setValue(0);
      translateY.setOffset(lastOffset.y);
      translateY.setValue(0);
    }
  };

  const navigation = useNavigation();
  const openChat = () => navigation.navigate("BotChat");

  return (
    <PanGestureHandler
      onGestureEvent={Animated.event(
        [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
        { useNativeDriver: false }
      )}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={[styles.floatingButton, { transform: [{ translateX }, { translateY }] }] }>
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
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: "#182952",
  },
});
