/* The shop's books. Titles, authors and descriptions are in all three
   languages (en / ru / uz). Prices are in so'm.

   Fields:
   cat      category key (see CATEGORIES)
   lang     language the edition is printed in
   price    current price; old = price before a sale (or 0)
   rating   average out of 5; reviews = how many ratings (used as "popularity")
   stock    copies in the warehouse (0 = sold out)
   added    date the book arrived in the shop (for "New arrivals")
   best     shown in "Bestsellers"
   colors   [background, text] for the fallback cover when no image is available
   cover    local image of the real cover (assets/covers, sources in SOURCES.md), or null */
window.CATEGORIES = ["uzbek", "classics", "modern", "kids", "science", "growth", "tech"];

window.BOOKS = [
  // ---------- Uzbek literature ----------
  {
    id: 1, cat: "uzbek", lang: "uz", year: 1925, pages: 400, price: 79000, old: 0,
    rating: 4.9, reviews: 1840, stock: 24, added: "2026-03-02", best: true, colors: ["#7a2e2e", "#f6e7c8"], cover: "assets/covers/1.jpg",
    title: { en: "Days Gone By", ru: "Минувшие дни", uz: "O'tkan kunlar" },
    author: { en: "Abdulla Qodiriy", ru: "Абдулла Кадыри", uz: "Abdulla Qodiriy" },
    desc: {
      en: "The first Uzbek novel: the love story of Otabek and Kumush, set in 19th-century Tashkent and Margilan.",
      ru: "Первый узбекский роман: история любви Отабека и Кумуш в Ташкенте и Маргилане XIX века.",
      uz: "Birinchi o'zbek romani: XIX asr Toshkent va Marg'ilonida Otabek va Kumushning muhabbat qissasi.",
    },
  },
  {
    id: 2, cat: "uzbek", lang: "uz", year: 1936, pages: 320, price: 69000, old: 0,
    rating: 4.8, reviews: 960, stock: 12, added: "2026-02-11", best: false, colors: ["#23395b", "#e9d8a6"], cover: null,
    title: { en: "Night and Day", ru: "Ночь и день", uz: "Kecha va kunduz" },
    author: { en: "Cho'lpon", ru: "Чулпан", uz: "Cho'lpon" },
    desc: {
      en: "A young woman's fate in Turkestan before the revolution, told with sharp humour and deep sadness.",
      ru: "Судьба молодой женщины в дореволюционном Туркестане, рассказанная с острым юмором и глубокой грустью.",
      uz: "Inqilobdan oldingi Turkistonda yosh ayolning taqdiri, o'tkir hazil va chuqur g'am bilan hikoya qilingan.",
    },
  },
  {
    id: 3, cat: "uzbek", lang: "en", year: 1530, pages: 480, price: 99000, old: 0,
    rating: 4.8, reviews: 1210, stock: 9, added: "2026-01-20", best: true, colors: ["#3d5a3a", "#f1e3b5"], cover: "assets/covers/3.jpg",
    title: { en: "Baburnama", ru: "Бабур-наме", uz: "Boburnoma" },
    author: { en: "Zahiriddin Muhammad Babur", ru: "Захириддин Мухаммад Бабур", uz: "Zahiriddin Muhammad Bobur" },
    desc: {
      en: "The memoirs of Babur, founder of the Mughal Empire: battles, cities, gardens and his own doubts.",
      ru: "Мемуары Бабура, основателя империи Великих Моголов: битвы, города, сады и собственные сомнения.",
      uz: "Boburiylar saltanati asoschisi Boburning xotiralari: janglar, shaharlar, bog'lar va o'z shubhalari.",
    },
  },
  {
    id: 4, cat: "uzbek", lang: "uz", year: 1982, pages: 256, price: 59000, old: 0,
    rating: 4.9, reviews: 1530, stock: 30, added: "2026-09-14", best: true, colors: ["#c8553d", "#fff4e0"], cover: "assets/covers/4.jpg",
    title: { en: "The Affairs of the World", ru: "Дела мирские", uz: "Dunyoning ishlari" },
    author: { en: "O'tkir Hoshimov", ru: "Уткир Хашимов", uz: "O'tkir Hoshimov" },
    desc: {
      en: "Short, warm stories about the author's mother and the small moments that shape a life.",
      ru: "Короткие тёплые рассказы о матери автора и маленьких моментах, из которых складывается жизнь.",
      uz: "Muallifning onasi va hayotni shakllantiradigan kichik lahzalar haqida qisqa, iliq hikoyalar.",
    },
  },
  {
    id: 5, cat: "uzbek", lang: "uz", year: 1994, pages: 560, price: 89000, old: 105000,
    rating: 4.7, reviews: 1120, stock: 3, added: "2026-06-03", best: false, colors: ["#1b1b1b", "#d4a373"], cover: null,
    title: { en: "Shaytanat", ru: "Шайтанат", uz: "Shaytanat" },
    author: { en: "Tohir Malik", ru: "Тахир Малик", uz: "Tohir Malik" },
    desc: {
      en: "A gripping crime saga about the underworld of 1990s Tashkent and the people caught in it.",
      ru: "Захватывающая криминальная сага о преступном мире Ташкента 1990-х и людях, попавших в него.",
      uz: "1990-yillar Toshkent jinoyat olami va unga tushib qolgan odamlar haqidagi hayajonli saga.",
    },
  },
  {
    id: 6, cat: "uzbek", lang: "uz", year: 1929, pages: 288, price: 65000, old: 0,
    rating: 4.6, reviews: 540, stock: 15, added: "2025-12-08", best: false, colors: ["#5b3a6b", "#f3e1f0"], cover: "assets/covers/6.jpg",
    title: { en: "Scorpion from the Altar", ru: "Скорпион из алтаря", uz: "Mehrobdan chayon" },
    author: { en: "Abdulla Qodiriy", ru: "Абдулла Кадыри", uz: "Abdulla Qodiriy" },
    desc: {
      en: "A satirical novel about love and hypocrisy at the court of the Kokand Khanate.",
      ru: "Сатирический роман о любви и лицемерии при дворе Кокандского ханства.",
      uz: "Qo'qon xonligi saroyidagi muhabbat va ikkiyuzlamachilik haqidagi satirik roman.",
    },
  },

  // ---------- World classics ----------
  {
    id: 7, cat: "classics", lang: "ru", year: 1866, pages: 592, price: 85000, old: 0,
    rating: 4.8, reviews: 2210, stock: 18, added: "2025-11-30", best: true, colors: ["#3b3b58", "#f2f2f2"], cover: "assets/covers/7.jpg",
    title: { en: "Crime and Punishment", ru: "Преступление и наказание", uz: "Jinoyat va jazo" },
    author: { en: "Fyodor Dostoevsky", ru: "Фёдор Достоевский", uz: "Fyodor Dostoyevskiy" },
    desc: {
      en: "A poor student commits a murder and has to live with what he has done.",
      ru: "Бедный студент совершает убийство и должен жить с тем, что сделал.",
      uz: "Kambag'al talaba qotillik qiladi va qilgan ishi bilan yashashga majbur bo'ladi.",
    },
  },
  {
    id: 8, cat: "classics", lang: "ru", year: 1967, pages: 480, price: 69000, old: 82000,
    rating: 4.9, reviews: 2650, stock: 21, added: "2026-04-17", best: true, colors: ["#0f0f14", "#e63946"], cover: "assets/covers/8.jpg",
    title: { en: "The Master and Margarita", ru: "Мастер и Маргарита", uz: "Usta va Margarita" },
    author: { en: "Mikhail Bulgakov", ru: "Михаил Булгаков", uz: "Mixail Bulgakov" },
    desc: {
      en: "The devil visits 1930s Moscow, while a writer and the woman who loves him fight for his novel.",
      ru: "Дьявол посещает Москву 1930-х, а писатель и любящая его женщина борются за его роман.",
      uz: "Shayton 1930-yillar Moskvasiga keladi, yozuvchi va uni sevgan ayol esa uning romani uchun kurashadi.",
    },
  },
  {
    id: 9, cat: "classics", lang: "en", year: 1949, pages: 328, price: 72000, old: 0,
    rating: 4.7, reviews: 1980, stock: 14, added: "2026-01-05", best: false, colors: ["#b5171f", "#f5f5f5"], cover: "assets/covers/9.jpg",
    title: { en: "Nineteen Eighty-Four", ru: "1984", uz: "1984" },
    author: { en: "George Orwell", ru: "Джордж Оруэлл", uz: "Jorj Oruell" },
    desc: {
      en: "In a state that watches everyone, one man quietly starts to think for himself.",
      ru: "В государстве, которое следит за всеми, один человек тихо начинает думать сам.",
      uz: "Hammani kuzatadigan davlatda bir odam jimgina o'zicha o'ylay boshlaydi.",
    },
  },
  {
    id: 10, cat: "classics", lang: "ru", year: 1869, pages: 1300, price: 149000, old: 0,
    rating: 4.7, reviews: 1430, stock: 0, added: "2025-10-22", best: false, colors: ["#4a3b2a", "#e8d9b5"], cover: "assets/covers/10.jpg",
    title: { en: "War and Peace", ru: "Война и мир", uz: "Urush va tinchlik" },
    author: { en: "Leo Tolstoy", ru: "Лев Толстой", uz: "Lev Tolstoy" },
    desc: {
      en: "Families, love and war in Russia during Napoleon's invasion, in one of the longest novels ever written.",
      ru: "Семьи, любовь и война в России во время нашествия Наполеона — в одном из самых длинных романов.",
      uz: "Napoleon bosqini davrida Rossiyadagi oilalar, muhabbat va urush — eng uzun romanlardan birida.",
    },
  },
  {
    id: 11, cat: "classics", lang: "en", year: 1813, pages: 432, price: 68000, old: 0,
    rating: 4.6, reviews: 870, stock: 10, added: "2025-09-15", best: false, colors: ["#c9ada7", "#22223b"], cover: "assets/covers/11.jpg",
    title: { en: "Pride and Prejudice", ru: "Гордость и предубеждение", uz: "G'urur va xurofot" },
    author: { en: "Jane Austen", ru: "Джейн Остин", uz: "Jeyn Ostin" },
    desc: {
      en: "Elizabeth Bennet and Mr Darcy misjudge each other in a sharp, funny story about love and class.",
      ru: "Элизабет Беннет и мистер Дарси ошибаются друг в друге в остроумной истории о любви и сословиях.",
      uz: "Elizabet Bennet va janob Darsi bir-birini noto'g'ri baholaydi: muhabbat va tabaqalar haqida o'tkir, kulgili hikoya.",
    },
  },
  {
    id: 12, cat: "classics", lang: "ru", year: 1967, pages: 416, price: 79000, old: 0,
    rating: 4.8, reviews: 1350, stock: 7, added: "2026-05-28", best: false, colors: ["#f4a259", "#2b2d42"], cover: "assets/covers/12.jpg",
    title: { en: "One Hundred Years of Solitude", ru: "Сто лет одиночества", uz: "Yolg'izlikning yuz yili" },
    author: { en: "Gabriel García Márquez", ru: "Габриэль Гарсиа Маркес", uz: "Gabriel Garsia Markes" },
    desc: {
      en: "Seven generations of one family in the magical village of Macondo.",
      ru: "Семь поколений одной семьи в волшебной деревне Макондо.",
      uz: "Sehrli Makondo qishlog'ida bir oilaning yetti avlodi.",
    },
  },

  // ---------- Modern fiction ----------
  {
    id: 13, cat: "modern", lang: "en", year: 1988, pages: 208, price: 45000, old: 55000,
    rating: 4.6, reviews: 2890, stock: 40, added: "2026-07-09", best: true, colors: ["#e9c46a", "#264653"], cover: "assets/covers/13.jpg",
    title: { en: "The Alchemist", ru: "Алхимик", uz: "Alkimyogar" },
    author: { en: "Paulo Coelho", ru: "Пауло Коэльо", uz: "Paulo Koelo" },
    desc: {
      en: "A shepherd boy travels from Spain to Egypt to follow a dream about hidden treasure.",
      ru: "Мальчик-пастух отправляется из Испании в Египет за мечтой о спрятанном сокровище.",
      uz: "Cho'pon bola yashirin xazina haqidagi orzusi ortidan Ispaniyadan Misrga yo'l oladi.",
    },
  },
  {
    id: 14, cat: "modern", lang: "en", year: 1952, pages: 128, price: 39000, old: 0,
    rating: 4.7, reviews: 1270, stock: 26, added: "2026-03-19", best: false, colors: ["#1d3557", "#a8dadc"], cover: "assets/covers/14.jpg",
    title: { en: "The Old Man and the Sea", ru: "Старик и море", uz: "Chol va dengiz" },
    author: { en: "Ernest Hemingway", ru: "Эрнест Хемингуэй", uz: "Ernest Xeminguey" },
    desc: {
      en: "An old fisherman fights a giant marlin far out at sea in this short, powerful story.",
      ru: "Старый рыбак сражается с огромным марлином в открытом море — короткая и сильная повесть.",
      uz: "Keksa baliqchi ochiq dengizda ulkan marlin bilan olishadi: qisqa, ammo kuchli qissa.",
    },
  },
  {
    id: 15, cat: "modern", lang: "en", year: 2020, pages: 304, price: 89000, old: 0,
    rating: 4.5, reviews: 640, stock: 11, added: "2026-11-02", best: false, colors: ["#2a2350", "#9bb1ff"], cover: "assets/covers/15.jpg",
    title: { en: "The Midnight Library", ru: "Полночная библиотека", uz: "Yarim tun kutubxonasi" },
    author: { en: "Matt Haig", ru: "Мэтт Хейг", uz: "Mett Xeyg" },
    desc: {
      en: "Between life and death, Nora finds a library where every book is a life she could have lived.",
      ru: "Между жизнью и смертью Нора находит библиотеку, где каждая книга — жизнь, которую она могла прожить.",
      uz: "Hayot va o'lim orasida Nora kutubxona topadi: undagi har bir kitob u yashashi mumkin bo'lgan hayot.",
    },
  },
  {
    id: 16, cat: "modern", lang: "ru", year: 1953, pages: 256, price: 62000, old: 0,
    rating: 4.6, reviews: 1090, stock: 13, added: "2026-02-24", best: false, colors: ["#d62828", "#fcbf49"], cover: "assets/covers/16.jpg",
    title: { en: "Fahrenheit 451", ru: "451 градус по Фаренгейту", uz: "Farengeyt bo'yicha 451 daraja" },
    author: { en: "Ray Bradbury", ru: "Рэй Брэдбери", uz: "Rey Bredberi" },
    desc: {
      en: "A fireman whose job is burning books begins to read them.",
      ru: "Пожарный, чья работа — сжигать книги, начинает их читать.",
      uz: "Kitoblarni yoqish ishi bo'lgan o't o'chiruvchi ularni o'qiy boshlaydi.",
    },
  },
  {
    id: 17, cat: "modern", lang: "uz", year: 1958, pages: 128, price: 42000, old: 0,
    rating: 4.8, reviews: 990, stock: 19, added: "2026-08-21", best: false, colors: ["#6a994e", "#f2e8cf"], cover: null,
    title: { en: "Jamilia", ru: "Джамиля", uz: "Jamila" },
    author: { en: "Chinghiz Aitmatov", ru: "Чингиз Айтматов", uz: "Chingiz Aytmatov" },
    desc: {
      en: "A short, bright love story set in a Kyrgyz village during the Second World War.",
      ru: "Короткая светлая история любви в киргизском аиле во время Второй мировой войны.",
      uz: "Ikkinchi jahon urushi yillarida qirg'iz qishlog'idagi qisqa va yorqin muhabbat qissasi.",
    },
  },
  {
    id: 18, cat: "modern", lang: "en", year: 1980, pages: 448, price: 75000, old: 0,
    rating: 4.8, reviews: 720, stock: 2, added: "2026-10-12", best: false, colors: ["#bc6c25", "#fefae0"], cover: "assets/covers/18.jpg",
    title: { en: "The Day Lasts More Than a Hundred Years", ru: "И дольше века длится день", uz: "Asrga tatigulik kun" },
    author: { en: "Chinghiz Aitmatov", ru: "Чингиз Айтматов", uz: "Chingiz Aytmatov" },
    desc: {
      en: "A railway worker crosses the steppe to bury a friend, remembering a whole life on the way.",
      ru: "Железнодорожник везёт друга хоронить через степь и по пути вспоминает целую жизнь.",
      uz: "Temiryo'lchi do'stini dafn etish uchun cho'l bo'ylab yo'l oladi va yo'lda butun umrini eslaydi.",
    },
  },

  // ---------- Children ----------
  {
    id: 19, cat: "kids", lang: "en", year: 1943, pages: 112, price: 42000, old: 0,
    rating: 4.9, reviews: 2340, stock: 35, added: "2026-04-01", best: true, colors: ["#ffd166", "#073b4c"], cover: "assets/covers/19.jpg",
    title: { en: "The Little Prince", ru: "Маленький принц", uz: "Kichkina shahzoda" },
    author: { en: "Antoine de Saint-Exupéry", ru: "Антуан де Сент-Экзюпери", uz: "Antuan de Sent-Ekzyuperi" },
    desc: {
      en: "A pilot lost in the desert meets a little prince from another planet. For children and adults.",
      ru: "Лётчик, потерявшийся в пустыне, встречает маленького принца с другой планеты. Для детей и взрослых.",
      uz: "Sahroda adashgan uchuvchi boshqa sayyoradan kelgan kichkina shahzodani uchratadi. Bolalar va kattalar uchun.",
    },
  },
  {
    id: 20, cat: "kids", lang: "ru", year: 1997, pages: 400, price: 95000, old: 0,
    rating: 4.9, reviews: 3120, stock: 22, added: "2026-10-30", best: true, colors: ["#7b2cbf", "#ffd60a"], cover: "assets/covers/20.jpg",
    title: { en: "Harry Potter and the Philosopher's Stone", ru: "Гарри Поттер и философский камень", uz: "Garri Potter va falsafiy tosh" },
    author: { en: "J. K. Rowling", ru: "Дж. К. Роулинг", uz: "J. K. Rouling" },
    desc: {
      en: "On his eleventh birthday, Harry learns that he is a wizard and leaves for Hogwarts.",
      ru: "В свой одиннадцатый день рождения Гарри узнаёт, что он волшебник, и отправляется в Хогвартс.",
      uz: "O'n bir yoshga to'lgan kuni Garri o'zining sehrgar ekanini bilib, Xogvartsga yo'l oladi.",
    },
  },
  {
    id: 21, cat: "kids", lang: "uz", year: 1936, pages: 160, price: 38000, old: 0,
    rating: 4.8, reviews: 860, stock: 28, added: "2026-06-25", best: false, colors: ["#f77f00", "#fff8e7"], cover: null,
    title: { en: "The Naughty Boy", ru: "Озорник", uz: "Shum bola" },
    author: { en: "G'afur G'ulom", ru: "Гафур Гулям", uz: "G'afur G'ulom" },
    desc: {
      en: "The funny adventures of a clever, naughty boy in old Tashkent.",
      ru: "Весёлые приключения хитрого озорного мальчишки в старом Ташкенте.",
      uz: "Eski Toshkentdagi ayyor va sho'x bolaning kulgili sarguzashtlari.",
    },
  },
  {
    id: 22, cat: "kids", lang: "en", year: 1865, pages: 176, price: 39000, old: 49000,
    rating: 4.6, reviews: 780, stock: 16, added: "2026-05-06", best: false, colors: ["#4cc9f0", "#10002b"], cover: "assets/covers/22.jpg",
    title: { en: "Alice's Adventures in Wonderland", ru: "Алиса в Стране чудес", uz: "Alisa mo'jizalar mamlakatida" },
    author: { en: "Lewis Carroll", ru: "Льюис Кэрролл", uz: "Lyuis Kerroll" },
    desc: {
      en: "Alice follows a white rabbit down a hole into a world where nothing makes sense.",
      ru: "Алиса следует за белым кроликом в нору и попадает в мир, где ничто не имеет смысла.",
      uz: "Alisa oq quyon ortidan inga tushib, hech narsa mantiqqa to'g'ri kelmaydigan dunyoga tushib qoladi.",
    },
  },

  // ---------- Science & history ----------
  {
    id: 23, cat: "science", lang: "en", year: 2011, pages: 512, price: 115000, old: 0,
    rating: 4.7, reviews: 1760, stock: 17, added: "2026-08-04", best: true, colors: ["#e76f51", "#1a1a1a"], cover: "assets/covers/23.jpg",
    title: { en: "Sapiens: A Brief History of Humankind", ru: "Sapiens. Краткая история человечества", uz: "Sapiens. Insoniyatning qisqacha tarixi" },
    author: { en: "Yuval Noah Harari", ru: "Юваль Ной Харари", uz: "Yuval Noy Harari" },
    desc: {
      en: "How a weak ape became the ruler of the planet, from the first tools to money and empires.",
      ru: "Как слабая обезьяна стала хозяином планеты: от первых орудий до денег и империй.",
      uz: "Zaif maymun qanday qilib sayyora hukmdoriga aylandi: ilk qurollardan pul va imperiyalargacha.",
    },
  },
  {
    id: 24, cat: "science", lang: "en", year: 1988, pages: 256, price: 65000, old: 79000,
    rating: 4.6, reviews: 1040, stock: 8, added: "2026-03-27", best: false, colors: ["#03045e", "#caf0f8"], cover: "assets/covers/24.jpg",
    title: { en: "A Brief History of Time", ru: "Краткая история времени", uz: "Vaqtning qisqacha tarixi" },
    author: { en: "Stephen Hawking", ru: "Стивен Хокинг", uz: "Stiven Xoking" },
    desc: {
      en: "Black holes, the Big Bang and the nature of time, explained for readers without a physics degree.",
      ru: "Чёрные дыры, Большой взрыв и природа времени — понятно даже без физического образования.",
      uz: "Qora tuynuklar, Katta portlash va vaqtning tabiati: fizika ma'lumotisiz ham tushunarli.",
    },
  },
  {
    id: 25, cat: "science", lang: "en", year: 1980, pages: 432, price: 88000, old: 0,
    rating: 4.7, reviews: 690, stock: 5, added: "2026-09-29", best: false, colors: ["#240046", "#ff9e00"], cover: "assets/covers/25.jpg",
    title: { en: "Cosmos", ru: "Космос", uz: "Koinot" },
    author: { en: "Carl Sagan", ru: "Карл Саган", uz: "Karl Sagan" },
    desc: {
      en: "A journey through space and the history of science, from ancient Greece to the planets.",
      ru: "Путешествие по Вселенной и истории науки — от Древней Греции до планет.",
      uz: "Koinot va fan tarixi bo'ylab sayohat: Qadimgi Yunonistondan sayyoralargacha.",
    },
  },

  // ---------- Self-growth & business ----------
  {
    id: 26, cat: "growth", lang: "en", year: 2018, pages: 320, price: 74000, old: 89000,
    rating: 4.8, reviews: 2470, stock: 33, added: "2026-07-22", best: true, colors: ["#f1f1f1", "#111111"], cover: "assets/covers/26.jpg",
    title: { en: "Atomic Habits", ru: "Атомные привычки", uz: "Atom odatlar" },
    author: { en: "James Clear", ru: "Джеймс Клир", uz: "Jeyms Klir" },
    desc: {
      en: "Small changes, repeated daily, add up to big results. A practical guide to building good habits.",
      ru: "Маленькие изменения каждый день дают большой результат. Практическое руководство по полезным привычкам.",
      uz: "Har kuni takrorlanadigan kichik o'zgarishlar katta natija beradi. Foydali odatlar bo'yicha amaliy qo'llanma.",
    },
  },
  {
    id: 27, cat: "growth", lang: "ru", year: 1997, pages: 336, price: 69000, old: 0,
    rating: 4.5, reviews: 1890, stock: 20, added: "2026-02-03", best: false, colors: ["#5a189a", "#e0aaff"], cover: "assets/covers/27.jpg",
    title: { en: "Rich Dad Poor Dad", ru: "Богатый папа, бедный папа", uz: "Boy ota, kambag'al ota" },
    author: { en: "Robert Kiyosaki", ru: "Роберт Кийосаки", uz: "Robert Kiyosaki" },
    desc: {
      en: "Two fathers, two views on money: a simple book about assets, saving and thinking like an owner.",
      ru: "Два отца, два взгляда на деньги: простая книга об активах, сбережениях и мышлении владельца.",
      uz: "Ikki ota, pulga ikki xil qarash: aktivlar, jamg'arma va egasi kabi fikrlash haqida sodda kitob.",
    },
  },
  {
    id: 28, cat: "growth", lang: "en", year: 2016, pages: 296, price: 85000, old: 0,
    rating: 4.6, reviews: 830, stock: 12, added: "2026-11-10", best: false, colors: ["#2d6a4f", "#d8f3dc"], cover: "assets/covers/28.jpg",
    title: { en: "Deep Work", ru: "В работу с головой", uz: "Chuqur ish" },
    author: { en: "Cal Newport", ru: "Кэл Ньюпорт", uz: "Kel Nyuport" },
    desc: {
      en: "Why focused work without distractions is rare and valuable, and how to train yourself to do it.",
      ru: "Почему сосредоточенная работа без отвлечений редка и ценна и как этому научиться.",
      uz: "Chalg'itishsiz diqqat bilan ishlash nega kam uchraydi va qadrli, unga qanday o'rganish mumkin.",
    },
  },

  // ---------- Programming ----------
  {
    id: 29, cat: "tech", lang: "en", year: 2011, pages: 472, price: 129000, old: 0,
    rating: 4.7, reviews: 520, stock: 6, added: "2026-11-15", best: false, colors: ["#ffbe0b", "#3a0ca3"], cover: "assets/covers/29.jpg",
    title: { en: "Eloquent JavaScript", ru: "Выразительный JavaScript", uz: "Ifodali JavaScript" },
    author: { en: "Marijn Haverbeke", ru: "Марейн Хавербеке", uz: "Mareyn Haverbeke" },
    desc: {
      en: "A modern introduction to programming with JavaScript, with exercises and small projects.",
      ru: "Современное введение в программирование на JavaScript с упражнениями и небольшими проектами.",
      uz: "JavaScript'da dasturlashga zamonaviy kirish: mashqlar va kichik loyihalar bilan.",
    },
  },
  {
    id: 30, cat: "tech", lang: "en", year: 2008, pages: 464, price: 135000, old: 0,
    rating: 4.6, reviews: 940, stock: 4, added: "2026-10-05", best: false, colors: ["#0b3d2e", "#9ef01a"], cover: "assets/covers/30.jpg",
    title: { en: "Clean Code", ru: "Чистый код", uz: "Toza kod" },
    author: { en: "Robert C. Martin", ru: "Роберт Мартин", uz: "Robert Martin" },
    desc: {
      en: "How to write code that other people can read, change and trust.",
      ru: "Как писать код, который другие люди могут читать, менять и которому можно доверять.",
      uz: "Boshqalar o'qiy oladigan, o'zgartira oladigan va ishonsa bo'ladigan kodni qanday yozish kerak.",
    },
  },
];
