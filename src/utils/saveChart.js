import d3ToPng from "d3-svg-to-png";
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

export const saveChart = (chartID) => {
  const chart = document.getElementById(chartID);

  if (chart === null) {
    alert("error! svg incorrectly selected!");
    return -1;
  }

  const chartWithStyles = addStyles(chart);
  // const chartCopy = chartWithStyles
  const chartCopy = chartWithStyles.cloneNode(true);
  const saveButton = chartCopy.getElementById("save-button");
  if (saveButton) saveButton.remove();
  chartCopy.getElementById("exit-button").remove();
  Array.from(chartCopy.getElementsByClassName("rotation-handles")).forEach(
    (item) => item.remove()
  );
  const chartBlob = serialize(chartCopy);
  const fileURL = URL.createObjectURL(chartBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = fileURL;
  downloadLink.download = `${chartID}.svg`;
  document.body.appendChild(downloadLink);

  downloadLink.click();
};

// export const saveChartPng = (chartID) => {
//   const chart = document.getElementById(chartID);

//   if (chart === null) {
//     alert("error! svg incorrectly selected!");
//     return -1;
//   }

//   const chartWithStyles = addStyles(chart);
//   // const chartCopy = chartWithStyles
//   const chartCopy = chartWithStyles.cloneNode(true);
//   const saveButton = chartCopy.getElementById("save-button");
//   if (saveButton) saveButton.remove();
//   const exitButton = chartCopy.getElementById("exit-button");
//   if (exitButton) saveButton.remove();
//   Array.from(chartCopy.getElementsByClassName("rotation-handles")).forEach(
//     (item) => item.remove()
//   );
//   const chartBlob = serialize(chartCopy);
//   const url = URL.createObjectURL(chartBlob);

// };

// export const saveChartPng = () => {
//   const dataHeader = 'data:image/svg+xml;charset=utf-8'
//   const $svg = document.getElementById('svg-container').querySelector('svg')
//   const $holder = document.getElementById('img-container')
//   const $label = document.getElementById('img-format')

//   const destroyChildren = $element => {
//     while ($element.firstChild) {
//       const $lastChild = $element.lastChild ?? false
//       if ($lastChild) $element.removeChild($lastChild)
//     }
//   }

//   const loadImage = async url => {
//     const $img = document.createElement('img')
//     $img.src = url
//     return new Promise((resolve, reject) => {
//       $img.onload = () => resolve($img)
//       $img.onerror = reject
//     })
//   }

//   const serializeAsXML = $e => (new XMLSerializer()).serializeToString($e)

//   const encodeAsUTF8 = s => `${dataHeader},${encodeURIComponent(s)}`
//   const encodeAsB64 = s => `${dataHeader};base64,${btoa(s)}`

//   const convertSVGtoImg = async e => {
//     const $btn = e.target
//     const format = $btn.dataset.format ?? 'png'
//     $label.textContent = format

//     destroyChildren($holder)

//     const svgData = encodeAsUTF8(serializeAsXML($svg))

//     const img = await loadImage(svgData)

//     const $canvas = document.createElement('canvas')
//     $canvas.width = $svg.clientWidth
//     $canvas.height = $svg.clientHeight
//     $canvas.getContext('2d').drawImage(img, 0, 0, $svg.clientWidth, $svg.clientHeight)

//     const dataURL = await $canvas.toDataURL(`image/${format}`, 1.0)
//     console.log(dataURL)

//     const $img = document.createElement('img')
//     $img.src = dataURL
//     $holder.appendChild($img)
//   }

//   const buttons = [...document.querySelectorAll('[data-format]')]
//   for (const $btn of buttons) {
//     $btn.onclick = convertSVGtoImg
//   }
// }

export const saveChartPng = (chartID) => {
    const chart = document.getElementById(chartID);

  if (chart === null) {
    alert("error! svg incorrectly selected!");
    return -1;
  }

  // const chartWithStyles = addStyles(chart);
  // const chartCopy = chartWithStyles
  const chartCopy = chart.cloneNode(true);
  const saveButton = chartCopy.getElementById("save-button");
  if (saveButton) saveButton.remove();
  const exitButton = chartCopy.getElementById("exit-button");
  if (exitButton) saveButton.remove();
  Array.from(chartCopy.getElementsByClassName("rotation-handles")).forEach(
    (item) => item.remove()
  );
  console.log(chartCopy)
  d3ToPng(chartCopy, "CanoePoloWhiteboard")
}