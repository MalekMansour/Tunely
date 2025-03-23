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
  
    // pick dark text if background is bright
    // threshold is around ~186 out of 255
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
    del = "#BF3131",
  }) {
    // if text wasn't provided, pick automatically
    const finalText = text || getContrastingTextColor(background);
    return {
      name,
      background,
      primary,
      secondary,
      text: finalText,
      delete: del,
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
    }),
  
    // Example using auto text pick if you remove 'text':
    // light: createTheme({
    //   name: "Classic Light Mode",
    //   background: "#FFFFFF",
    //   primary: "#182952",
    //   secondary: "#6C8BBD",
    //   // omitting text => auto picks black text if BG is bright
    // }),
    light: createTheme({
      name: "Classic Light Mode",
      background: "#FFFFFF",
      primary: "#182952",
      secondary: "#6C8BBD",
      text: "#1a1a1a", // or omit to let it auto-calc
    }),
  
    cherry: createTheme({
      name: "Cherry Blossom",
      background: "#FFD6E8",
      primary: "#F7B5CA",
      secondary: "#F3D0D7",
      // no text => auto pick dark or white
      text: "#2f2f2f",
    }),
  
    astro: createTheme({
      name: "Astro Neon",
      background: "#211951",
      primary: "#836FFF",
      secondary: "#15F5BA",
      text: "#F0F3FF",
    }),
  
    ocean: createTheme({
      name: "Deep Blue Sea",
      background: "#0B2447",
      primary: "#19376D",
      secondary: "#576CBC",
      // text: "#F0F3FF",
    }),
  
    kaffestuggu: createTheme({
      name: "Kaffestuggu",
      background: "#F5E7DE",
      primary: "#F2BFA4",
      secondary: "#E5A884",
    }),  
    omegaYeast: createTheme({
      name: "Omega Yeast",
      background: "#f7f7f7",
      primary: "#7da2a9",
      secondary: "#52767b",
    }),
  
    farmFood: createTheme({
      name: "Farm Food",
      background: "#ffffff",
      primary: "#a7bc5b",
      secondary: "#8da242",
    }),
  
    slumber: createTheme({
      name: "Slumber",
      background: "#051622",
      primary: "#1ba098",
      secondary: "#deb992",
    }),
  
    weHeart: createTheme({
      name: "We Heart",
      background: "#e1f2f7",
      primary: "#ef0d50",
      secondary: "#eb3a70",
    }),
  
    igor: createTheme({
      name: "Igor",
      background: "#000000",
      primary: "#fa255e",
      secondary: "#c39ea0",
    }),
  
    brat: createTheme({
      name: "brat",
      background: "#8ACE00",
      primary: "#a1e832",
      secondary: "#6fbf00",
    }),
  };
  