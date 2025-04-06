import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import {
  NavigationContainer,
  useNavigationState,
} from "@react-navigation/native";
import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AudioProvider } from "./context/AudioContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ChatbotProvider, useChatbot } from "./context/ChatbotContext";
import { Provider as PaperProvider } from "react-native-paper";


// Screens & Components
import HomeScreen from "./screens/Home";
import SearchScreen from "./screens/Search";
import LibraryScreen from "./screens/Library";
import ProfileScreen from "./screens/Profile";
import LoginScreen from "./screens/Login";
import SignUpScreen from "./screens/SignUp";
import LoginFormPage from "./screens/LoginFormPage";
import SongDetailScreen from "./screens/SongDetail";
import SettingsScreen from "./screens/Settings";
import UploadScreen from "./screens/Upload";
import PlaylistDetail from "./screens/PlaylistDetail";
import CommentScreen from "./screens/CommentScreen";
import TopBarProfileIcon from "./components/TopBarProfileIcon";
import FloatingPlayer from "./components/FloatingPlayer";
import AdminPage from "./screens/adminPage";
import AdminCheck from "./Utility/adminCheck";
import GenreSongs from "./screens/GenreSongs";
import CatBot from "./components/catbot";
import BotChat from "./screens/BotCat";
import ThemeSettings from "./screens/ThemeSettings";
import ArtistPage from "./screens/ArtistPage";
import TermsAndServices from "./screens/TermsAndServices";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ScreenWithTopBar({ navigation, children, title }) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.topBar, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text, marginTop: 30 }]}>
          {title}
        </Text>
        <TouchableOpacity
          style={[styles.profileButton, { marginTop: 30 }]}
          onPress={() => navigation.navigate("Profile")}
        >
          <TopBarProfileIcon size={45} />
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

function HomeWithTopBar({ navigation }) {
  return (
    <ScreenWithTopBar navigation={navigation} title="Tunely">
      <HomeScreen />
    </ScreenWithTopBar>
  );
}

function SearchWithTopBar({ navigation }) {
  return (
    <ScreenWithTopBar navigation={navigation} title="Search">
      <SearchScreen />
    </ScreenWithTopBar>
  );
}

function LibraryWithTopBar({ navigation }) {
  return (
    <ScreenWithTopBar navigation={navigation} title="Your Library">
      <LibraryScreen />
    </ScreenWithTopBar>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeWithTopBar} />
      <Stack.Screen name="PlaylistDetail" component={PlaylistDetail} />
      <Stack.Screen name="BotCat" component={BotChat} />
    </Stack.Navigator>
  );
}

function LibraryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LibraryScreen" component={LibraryWithTopBar} />
      <Stack.Screen name="PlaylistDetail" component={PlaylistDetail} />
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchScreen" component={SearchWithTopBar} />
      <Stack.Screen name="PlaylistDetail" component={PlaylistDetail} />
      <Stack.Screen name="GenreSongs" component={GenreSongs} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarBackground: () => (
          <BlurView
            tint="dark"
            intensity={90}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "100%",
            }}
          />
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Search")
            iconName = focused ? "search" : "search-outline";
          else if (route.name === "Library")
            iconName = focused ? "library" : "library-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.icon,
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarStyle: {
          ...styles.tabBarStyle,
          backgroundColor: "transparent",
          borderTopColor: "rgba(255, 255, 255, 0.1)",
          height: 70,
          paddingBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Library" component={LibraryStack} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <AudioProvider>
        <ThemeProvider>
          <ChatbotProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <NavigationContainer>
                <View style={{ flex: 1 }}>
                  <Stack.Navigator
                    initialRouteName="Login"
                    screenOptions={{ headerShown: false }}
                  >
                    <Stack.Screen name="Home" component={TabNavigator} />
                    <Stack.Screen
                      name="SongDetail"
                      component={SongDetailScreen}
                      options={{
                        presentation: "transparentModal",
                        cardStyle: { backgroundColor: "transparent" },
                      }}
                    />
                    <Stack.Screen name="CommentScreen" component={CommentScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="LoginFormPage" component={LoginFormPage} />
                    <Stack.Screen name="SignUp" component={SignUpScreen} />
                    <Stack.Screen name="Upload" component={UploadScreen} />
                    <Stack.Screen name="ThemeSettings" component={ThemeSettings} />
                    <Stack.Screen name="AdminPage" component={AdminPage} />
                    <Stack.Screen name="AuthCheck" component={AdminCheck} />
                    <Stack.Screen name="BotCat" component={BotChat} />
                    <Stack.Screen name="ArtistPage" component={ArtistPage} />
                    <Stack.Screen name="TermsAndServices" component={TermsAndServices} />
                    
                
                  </Stack.Navigator>

                  <FloatingPlayer />
                  <ConditionalCatBot />
                </View>
              </NavigationContainer>
            </GestureHandlerRootView>
          </ChatbotProvider>
        </ThemeProvider>
      </AudioProvider>
    </PaperProvider>
  );
}

function ConditionalCatBot() {
  const routeName = useNavigationState((state) => {
    if (!state) return null;
    const route = state.routes[state.index];
    return route.name;
  });

  const { chatbotVisible } = useChatbot();

  const hiddenScreens = [
    "Login",
    "LoginFormPage",
    "SignUp",
    "Profile",
    "BotCat",
    "AdminPage",
    "ThemeSettings",
    "Settings",
    "Upload",
  ];

  if (!chatbotVisible || !routeName || hiddenScreens.includes(routeName)) {
    return null;
  }

  return <CatBot />;
}
