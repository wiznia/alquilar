export const endpoint = `http://localhost:3000/api/graphql`;
export const prodEndpoint = `fill me in when we deploy`;
export const perPage = 2;
export const formatText = ([firstLetter, ...restOfWord]) =>
    firstLetter.toUpperCase() + restOfWord.join("").split('_').join(' ');
