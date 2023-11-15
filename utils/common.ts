export const flattenObject = (obj: Record<string, any>, prefix = '') => {
  const sanitizedObj = JSON.parse(JSON.stringify(obj))
  const flattened = {}

  for (const key in sanitizedObj) {
    if (typeof sanitizedObj[key] === 'object' && sanitizedObj[key] !== null) {
      for (const nestedKey in sanitizedObj[key]) {
        const toTitleCase = nestedKey.replace(/\b\w/g, (nestedKey) => nestedKey.toUpperCase() )
        flattened[`${prefix}${key}${toTitleCase}`] = sanitizedObj[key][nestedKey]
      }
    } else {
      flattened[`${prefix}${key}`] = sanitizedObj[key]
    }
  }

  return flattened
}