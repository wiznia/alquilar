export default function removeTypename(obj) {
  if (Array.isArray(obj)) {
    return obj.map(removeTypename);
  } else if (obj && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (key !== '__typename') {
        newObj[key] = removeTypename(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}
