function translitPreserveEmoji(text) {
  const map = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
    й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
    у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ы: "y", э: "e",
    ю: "yu", я: "ya", ь: "", Ь: "", ъ: "", Ъ: ""
  };

  return text
    .normalize('NFKC')
    .replace(/[ьЬъЪ\u0000-\u001F\u007F-\u009F]/g, '') // удаляем управляющие символы
    .split('')
    .map(char => {
      const lower = char.toLowerCase();
      const isUpper = char !== lower;
      const t = map[lower] || char;
      return isUpper ? t.toUpperCase() : t;
    })
    .join('');
}

module.exports = { translitPreserveEmoji };
