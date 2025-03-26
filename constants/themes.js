/**********************************************
  1) Utility function to pick text color
**********************************************/
function getContrastingTextColor(
  bgColor,
  lightText = "#F1F1F1",
  darkText = "#1a1a1a"
) {
  // remove '#' if present
  const hex = bgColor.replace("#", "");

  // parse as rgb
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // basic brightness formula
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

  // pick dark text if background is bright (threshold ~186)
  return brightness > 186 ? darkText : lightText;
}

/**********************************************
  2) Helper function to create each theme
**********************************************/
function createTheme({
  name,
  background,
  primary,
  secondary,
  text,
  border,
  icon,
  del = "#BF3131",
  inactive,
}) {
  // if text wasn't provided, pick automatically
  const finalText = text || getContrastingTextColor(background);
  // if border not provided, default to secondary
  const finalBorder = border || secondary;

  return {
    name,
    background,
    primary,
    secondary,
    text: finalText,
    delete: del,
    inactive: inactive || "#666",
    border: finalBorder,
    icon,
  };
}

/**********************************************
  3) Export themes
**********************************************/
export const themes = {
  dark: createTheme({
    name: "Classic Dark Mode",
    background: "#1a1a1a",
    primary: "#182952",
    secondary: "#213555",
    text: "#F1F1F1",
    border: "#99a9b9",
    icon: "#0079FF",
  }),
  light: createTheme({
    name: "Classic Light Mode",
    background: "#f7f7f7",
    primary: "#7da2a9",
    secondary: "#52767b",
    text: "#1a1a1a",
    border: "#182952",
    icon: "#182952",
  }),
  ocean: createTheme({
    name: "Deep Blue Sea",
    background: "#0B2447",
    primary: "#19376D",
    secondary: "#576CBC",
    border: "#99a9b9",
    icon: "#0079FF",
  }),
  cherry: createTheme({
    name: "Cherry Blossom",
    background: "#FFB7C5",
    primary: "#FF69B4",
    secondary: "#FF69B4",
    text: "#1a1a1a",
    border: "#FF69B4",
    icon: "#FF69B4",
  }),
  astro: createTheme({
    name: "Astro Neon",
    background: "#211951",
    primary: "#836FFF",
    secondary: "#865DFF",
    text: "#F0F3FF",
    border: "#2D336B",
    icon: "#836FFF",
  }),
  cafe: createTheme({
    name: "Cafe Latte",
    background: "#FED8B1",
    primary: "#A67B5B",
    secondary: "#6F4E37",
    text: "#1a1a1a",
    border: "#543310",
    icon: "#ECB176",
  }),
  slumber: createTheme({
    name: "Slumber",
    background: "#051622",
    primary: "#1ba098",
    secondary: "#deb992",
    border: "#1ba098",
    icon: "#1ba098",
  }),
  heartbreak: createTheme({
    name: "808's & Heartbreak",
    background: "#D2E0FB",
    primary: "#E50046",
    secondary: "#eb3a70",
    border: "#E50046",
    icon: "#E50046",
  }),
  igor: createTheme({
    name: "Igor",
    background: "#000000",
    primary: "#fa255e",
    secondary: "#fa255e",
    border: "#fa255e",
    icon: "#fa255e",
  }),
  brat: createTheme({
    name: "brat",
    background: "#8ACE00",
    primary: "#a1e832",
    secondary: "#6fbf00",
    text: "#000000",
    border: "#000000",
    icon: "#000000",
  }),
  matcha: createTheme({
    name: "Matcha",
    background: "#E8F5E9",
    primary: "#A5D6A7",
    secondary: "#66BB6A",
    text: "#1a1a1a",
    border: "#66BB6A",
    icon: "#5F8B4C",
  }),
  lavender: createTheme({
    name: "Lavender",
    background: "#E6E6FA",
    primary: "#B39DDB",
    secondary: "#9575CD",
    text: "#1a1a1a",
    border: "#9575CD",
    icon: "#7E57C2",
  }),
  celest: createTheme({
    name: "Celest",
    background: "#000000",
    primary: "#F59C00",
    secondary: "#FF8C00",
    text: "#FFFFFF",
    border: "#FF6000",
    icon: "#F59C00",
  }),
  hacker: createTheme({
    name: "Spot the Music",
    background: "#191414",
    primary: "#1DB954",
    secondary: "#1DB954",
    text: "#FFFFFF",
    border: "#149414",
    icon: "#1DB954",
  }),
  bloodMoon: createTheme({
    name: "The Blood Moon",
    background: "#000000",
    primary: "#CF0A0A",
    secondary: "#DC143C",
    text: "#F1F1F1",
    border: "#CF0A0A",
    icon: "#CF0A0A",
  }),
};
