export const mock = (input: string): string => input
    .split('')
    .map((char, index) => index % 3 === 0 ? char.toUpperCase() : char)
    .concat([' 🤡🤡'])
    .join('');