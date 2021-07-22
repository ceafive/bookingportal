export const getClassesString = (classes) =>
  (classes ?? "")
    .split(" ")
    .map((curr) => `${curr}`)
    .join(" ");
