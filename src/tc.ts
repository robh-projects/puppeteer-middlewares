


const bla = ['https://google.com', 'https://verycom'];

// Verifies all matches in the case `this.match` is an Array
const fnMatch = (expression: (match: unknown) => boolean) => bla.some(expression);  



console.log(fnMatch((match) => match === 'https://google.com'))