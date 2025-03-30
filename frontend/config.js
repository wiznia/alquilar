export const perPage = 10;
export const formatText = ([firstLetter, ...restOfWord]) =>
  firstLetter.toUpperCase() + restOfWord.join('').split('_').join(' ');
