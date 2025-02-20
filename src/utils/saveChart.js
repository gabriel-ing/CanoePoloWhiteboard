function serialize(svg) {
  const xmlns = "http://www.w3.org/2000/xmlns/";
  const xlinkns = "http://www.w3.org/1999/xlink";
  const svgns = "http://www.w3.org/2000/svg";
  svg = svg.cloneNode(true);
  const fragment = window.location.href + "#";
  const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    for (const attr of walker.currentNode.attributes) {
      if (attr.value.includes(fragment)) {
        attr.value = attr.value.replace(fragment, "#");
      }
    }
  }
  svg.setAttributeNS(xmlns, "xmlns", svgns);
  svg.setAttributeNS(xmlns, "xmlns:xlink", xlinkns);
  const serializer = new window.XMLSerializer();
  const string = serializer.serializeToString(svg);
  return new Blob([string], {
    type: "image/svg+xml",
  });
}

function getStyleById(id) {
  return getAllStyles(document.getElementById(id));
}
function getAllStyles(elem) {
  if (!elem) return []; // Element does not exist, empty list.
  console.log(elem);
  var win = document.defaultView || window,
    style,
    styleNode = [];
  if (win.getComputedStyle) {
    /* Modern browsers */
    style = win.getComputedStyle(elem, "");
    for (var i = 0; i < style.length; i++) {
      styleNode.push(style[i] + ":" + style.getPropertyValue(style[i]));
      //               ^name ^           ^ value ^
    }
  } else if (elem.currentStyle) {
    /* IE */
    style = elem.currentStyle;
    for (var name in style) {
      styleNode.push(name + ":" + style[name]);
    }
  } else {
    /* Ancient browser..*/
    style = elem.style;
    for (var i = 0; i < style.length; i++) {
      styleNode.push(style[i] + ":" + style[style[i]]);
    }
  }
  return styleNode;
}

function getRequiredStyles(elem) {
  if (!elem) return []; // Element does not exist, empty list.
  const requiredStyles = [
    "font-family",
    "font-weight",
    "font-size",
    "transform-origin",
    "dy",
    "text-align",
    "dominant-baseline",
    "text-anchor",
  ]; // If the text styling is wrong, its possible a required styling is missing from here! Add it in.
  // console.log(elem);
  var win = document.defaultView || window,
    style,
    styleNode = [];
  if (win.getComputedStyle) {
    /* Modern browsers */
    style = win.getComputedStyle(elem, "");
    //console.log(style);
    for (var i = 0; i < requiredStyles.length; i++) {
      //console.log(requiredStyles[i]);
      styleNode.push(
        requiredStyles[i] + ":" + style.getPropertyValue(requiredStyles[i])
      );
      //               ^name ^           ^ value ^
    }
  } else if (elem.currentStyle) {
    /* IE */
    style = elem.currentStyle;
    console.log(style);
    for (var name in style) {
      styleNode.push(name + ":" + style[name]);
    }
  } else {
    /* Ancient browser..*/
    style = elem.style;
    console.log(style);
    for (var i = 0; i < style.length; i++) {
      styleNode.push(style[i] + ":" + style[style[i]]);
    }
  }
  return styleNode;
}

const addStyles = (chart) => {
  /* Function to add the styles from the CSS onto the computed SVG before saving it.
// Currently only implemented to fix the font-size and font-family attributes for any text class. 
// If these values are set within the d3 (i.e. directly onto the SVG), this is unnecessary
// But it ensures that text styling using CSS is retained. */

  const textElements = chart.getElementsByTagName("text");
  // console.log(textElements);

  const mainStyles = getRequiredStyles(chart);
  // console.log(mainStyles);
  chart.style.cssText = mainStyles.join(";");
  Array.from(textElements).forEach(function (element) {
    // console.log(element);
    // console.log(element)
    const styles = getRequiredStyles(element);
    // console.log(styles)
    element.style.cssText = styles.join(";");
  });
  return chart;
};

const saveChart = (chartID) => {
  const chart = document.getElementById(chartID);

  if (chart === null) {
    alert("error! svg incorrectly selected!");
    return -1;
  }

  const chartWithStyles = addStyles(chart);
  const chartBlob = serialize(chartWithStyles);
  const fileURL = URL.createObjectURL(chartBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = fileURL;
  downloadLink.download = `${chartID}.svg`;
  document.body.appendChild(downloadLink);

  downloadLink.click();
};

export default saveChart;
