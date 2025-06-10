export const maskString = (string, visibleCharCount, maskCharacter) => {
    let count = 0;
    return string
      .split("")
      .reverse()
      .map((n, i) => (!n.match(/\d/) ? n : count < visibleCharCount ? (count++, n) : maskCharacter))
      .reverse()
      .join("");
  }