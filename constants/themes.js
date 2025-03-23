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
    border,         // <---- newly added
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
      border: finalBorder, // <---- store final border color
    };
  }
  
  /**********************************************
    3) Export your themes
  **********************************************/
  export const themes = {
    dark: createTheme({
      name: "Classic Dark Mode",
      background: "#1a1a1a",
      primary: "#182952",
      secondary: "#213555",
      text: "#F1F1F1",
      border: "#99a9b9", 
    }),
    light: createTheme({
      name: "Classic Light Mode",
      background: "#f7f7f7",
      primary: "#7da2a9",
      secondary: "#52767b",
      text: "#1a1a1a",
      border: "#182952", 
    }),
    cherry: createTheme({
      name: "Cherry Blossom",
      background: "#FFD6E8",
      primary: "#F7B5CA",
      secondary: "#F3D0D7",
      text: "#2f2f2f",
      border: "#FF2DF1",
    }),
    astro: createTheme({
      name: "Astro Neon",
      background: "#211951",
      primary: "#836FFF",
      secondary: "#15F5BA",
      text: "#F0F3FF",
      border: "#2D336B",
    }),
    ocean: createTheme({
      name: "Deep Blue Sea",
      background: "#0B2447",
      primary: "#19376D",
      secondary: "#576CBC",
      border: "#99a9b9",
    }),
    kaffestuggu: createTheme({
      name: "Kaffestuggu",
      background: "#F5E7DE",
      primary: "#F2BFA4",
      secondary: "#E5A884",
      border: "#99a9b9",
    }),
    slumber: createTheme({
      name: "Slumber",
      background: "#051622",
      primary: "#1ba098",
      secondary: "#deb992",
      border: "#99a9b9",
    }),
    weHeart: createTheme({
      name: "We Heart",
      background: "#e1f2f7",
      primary: "#ef0d50",
      secondary: "#eb3a70",
      border: "#99a9b9",
    }),
    igor: createTheme({
      name: "Igor",
      background: "#000000",
      primary: "#fa255e",
      secondary: "#c39ea0",
      border: "#99a9b9",
    }),
    brat: createTheme({
      name: "brat",
      background: "#8ACE00",
      primary: "#a1e832",
      secondary: "#6fbf00",
      border: "#99a9b9",
    }),
  };
  