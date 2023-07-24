// If your extension doesn't need a content script, just leave this file empty

// This is an example of a script that will run on every page. This can alter pages
// Don't forget to change `matches` in manifest.json if you want to only change specific webpages
printAllPageLinks();

// This needs to be an export due to typescript implementation limitation of needing '--isolatedModules' tsconfig
export function printAllPageLinks() {
  const allLinks = Array.from(document.querySelectorAll('a')).map(
    link => link.href
  );

  console.log('-'.repeat(30));
  console.log(
    `These are all ${allLinks.length} links on the current page that have been printed by the Sample Create React Extension`
  );
  console.log(allLinks);
  console.log('-'.repeat(30));
}


export function getAllText() {
  const allText = Array.from(document.querySelectorAll('p')).map(
    value => value.outerText
  );

  console.log('-'.repeat(30));

  return allText.join(' ');
}


const getSelectedText = () => window.getSelection().toString();
console.log(getSelectedText());

document.addEventListener("click", () => {
  console.log("TEST")
  if (getSelectedText().length > 0) {
    console.log(getMarkerPosition());
  }
});

document.addEventListener("selectionchange", () => {
  if (getSelectedText().length === 0) {
    console.log(getMarkerPosition());
  }
});

function getMarkerPosition() {
  const rangeBounds = window
    .getSelection()
    .getRangeAt(0)
    .getBoundingClientRect();
  return {
    // Substract width of marker button -> 40px / 2 = 20
    left: rangeBounds.left + rangeBounds.width / 2 - 20,
    top: rangeBounds.top - 30,
    display: "flex",
  };
}