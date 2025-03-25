export const perPage = 2;
export const formatText = ([firstLetter, ...restOfWord]) =>
  firstLetter.toUpperCase() + restOfWord.join('').split('_').join(' ');
