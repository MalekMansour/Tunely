import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a", 
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f1f1f1", 
    marginBottom: 20,
  },
  songCard: {
    backgroundColor: "#182952", 
    padding: 10,
    height: 50,
    borderRadius: 8,
    marginBottom: 10,
  },
  songTitle: {
    color: "#f1f1f1", 
    fontWeight: "bold",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#213555", 
    padding: 10,
    paddingTop: 40, 
  },
  profileButton: {
    padding: 2,
    marginTop: 30,
  },
  searchBar: {
    backgroundColor: "#f1f1f1", // Purple for search bar
    borderRadius: 25,
    padding: 10,
    marginBottom: 20,
    color: "#000", 
  },
  // Tab bar customization
  tabBarStyle: {
    backgroundColor: "#213555", // Match top bar
  },

  //Song Detail styles

  songDetailsContainer: {
    flex: 1,
    justifyContent: "flex-start", 
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingTop: 50, 
  },
  songTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f1f1f1",
    textAlign: "left",
    alignSelf: "flex-start",
  },
  songImage: {
    width: 350,
    height: 350,
    marginVertical: 20,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
  },
  imageTitleContainer: {
    alignItems: "flex-start",
  },
  sliderContainer: {
    width: "80%",
    marginVertical: 20,
  },
  slider: {
    width: "100%",
  },
  sliderContainer: {
    width: "80%",
    marginVertical: 20,
  },
  slider: {
    width: "100%",
  },
  iconButton: {
    padding: 10,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  timeText: {
    color: "#fff",
  },
});
