// util.js

export function containsWarTerm(sentence, terms) {
  // Normalize the sentence to lower case for case-insensitive matching.
  const lowerCaseSentence = sentence.toLowerCase();
  return terms.some((term) => lowerCaseSentence.includes(term.toLowerCase()));
}
