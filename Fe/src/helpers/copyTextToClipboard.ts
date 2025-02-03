function copyTextToClipboard(text : string) {
  var success = false;
  var textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    success = document.execCommand("copy");
  } catch (e) {
    console.error("Error copying text to clipboard:", e);
  }
  document.body.removeChild(textarea);
  return success;
}

export default copyTextToClipboard;