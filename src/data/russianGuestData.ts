import type { HotelDataset, HotelTranslation } from '../types/hotel.ts'
import type { FacilityDataset, FacilityTranslation } from '../types/facility.ts'

/** Russian presentation overlay. The original approved four-language JSON and admin
 * schemas are unchanged. Registered names, addresses, map links and numeric data remain authoritative.
 */
export const RUSSIAN_HOTEL: HotelTranslation = {
  name: 'Songdo Central Park Hotel',
  description: '',
  address: '193, Technopark-ro, Yeonsu-gu, Инчхон, Республика Корея (Songdo-dong 38)',
  checkIn: 'Заезд возможен с 15:00.',
  checkOut: [
    'Выезд до 12:00 (полдень).',
    'При выезде верните ключ-карты на стойку регистрации.',
    'При утере ключ-карты может взиматься плата за замену — 11 000 вон за карту.',
    'Поздний выезд оплачивается по тарифу 11 000 вон за час. При выезде после 17:00 взимается стоимость одних суток проживания.',
  ].join('\n\n'),
  breakfast: [
    'Завтрак подаётся в ресторане High Wave на 1-м этаже.',
    'Время завтрака: 06:30–10:00.',
    'Последний вход на завтрак — в 09:30.',
    'Стоимость завтрака для взрослого — 35 000 вон.',
    'Стоимость завтрака для ребёнка от 5 до 8 лет — 19 000 вон.',
    'При входе на завтрак проверяется номер вашей комнаты.',
  ].join('\n\n'),
  parking: 'Парковка бесплатная. Для въезда и выезда регистрация автомобиля не требуется.',
  roomUsage: [
    'Сеть Wi-Fi называется CPH_ с номером вашего этажа. Пароль не требуется.',
    'Микроволновые печи, ложки, палочки для еды, ножи и бокалы для вина находятся на 6-м, 10-м и 16-м этажах.',
    'В отеле нет магазина шаговой доступности. Магазин CU находится в соседнем здании справа от главного входа.',
    'Кондиционер регулируется с помощью белой панели слева от входа в ванную комнату или пульта дистанционного управления.',
    'Одноразовые зубные щётки, зубная паста и бритвы бесплатно не предоставляются. Для покупки обратитесь на стойку регистрации.',
    'Если вы заказали доставку еды, войдите через главный вход отеля и заберите заказ с полки перед стойкой регистрации.',
    'Курьерам запрещено доставлять заказы непосредственно в номера. Отель не несёт ответственности за утраченные заказы.',
    'Во время проверки пожарной безопасности могут звучать пожарная сигнализация, сирены или экстренные объявления.',
    'Курение запрещено во всех помещениях отеля, включая номера, аварийные выходы и коридоры. Дым может вызвать срабатывание пожарных датчиков.',
    'Просим воздерживаться от громкого шума и других действий, мешающих гостям.',
    'Не выносите принадлежности и оборудование из номера за пределы отеля. Тапочки предназначены только для использования в номере.',
    'Освещение номера можно включить или выключить переключателем рядом с кроватью.',
  ].join('\n\n'),
  notes: [
    'Телефон отеля: +82-32-310-5000',
    'За курение в номере может взиматься плата за уборку в размере 200,000 вон из-за запаха табака без дополнительного уведомления.',
    'При повреждении оборудования или принадлежностей номера во время проживания необходимо возместить стоимость их замены.',
    'Если домашнее животное испачкает постель фекалиями или мочой, может взиматься дополнительная плата за уборку — 50 000 вон.',
    'При повреждении мебели домашним животным может взиматься плата в зависимости от повреждённого предмета.',
    'За проживание с животным без уведомления стойки регистрации может взиматься дополнительно 22 000 вон сверх других применимых сборов.',
    'Домашние животные допускаются только в специально предназначенных номерах. В стандартных номерах проживание с животными запрещено. Для бронирования и уточнения условий обратитесь на стойку регистрации.',
    'Если вы проживаете с домашним животным, сообщите об этом на стойке регистрации.',
  ].join('\n\n'),
}

type VenueCopy = { description: string; hours: string; keywords: string[]; directions?: string; notes?: string; closed?: string }
export const RUSSIAN_VENUES: Readonly<Record<string, VenueCopy>> = {

  "cu-songdo-senseuri": {
    "description": "Магазин шаговой доступности.",
    "hours": "Круглосуточно",
    "keywords": [
      "магазин",
      "продукты",
      "CU"
    ]
  },
  "blue-ocean-sauna-songdo": {
    "description": "Сауна.",
    "hours": "Круглосуточно, без выходных",
    "keywords": [
      "сауна",
      "баня",
      "спа"
    ],
    "closed": "Без выходных"
  },
  "malt-house-incheon-songdo": {
    "description": "Европейская кухня, стейки и бранч · Примеры меню: стейк, паста, ассорти, пицца, пиво",
    "hours": "10:00–23:00 (перерыв 15:00–17:00); последний заказ 22:00",
    "keywords": [
      "ресторан",
      "стейк",
      "пиво",
      "паста",
      "пицца",
      "мясо"
    ]
  },
  "compose-coffee-incheon-songdo-central-park": {
    "description": "Кофе и прохладительные напитки · Примеры меню: американо, латте, фруктовый лимонад",
    "hours": "08:00–22:00 (вс.: до 21:00; пн. и вт.: до 20:00)",
    "keywords": [
      "кафе",
      "кофе",
      "напитки"
    ]
  },
  "chaeum-pharmacy-songdo": {
    "description": "Аптека.",
    "hours": "09:00–19:30 (перерыв 13:00–14:00); сб. 09:00–14:00",
    "keywords": [
      "аптека",
      "лекарства"
    ]
  },
  "hanyang-songdo-hanok-village": {
    "description": "Корейская кухня, пулькоги из говядины · Примеры меню: маринованная и немаринованная корейская говядина пулькоги",
    "hours": "Пн.–пт. 11:30–22:00 (перерыв 15:00–17:00) / сб.–вс. 11:00–22:00 (последний заказ 21:30)",
    "keywords": [
      "ресторан",
      "говядина",
      "мясо",
      "корейская кухня",
      "пулькоги"
    ]
  },
  "gyeongbokgung-hanok-village": {
    "description": "Корейская кухня, говяжьи рёбра и комплексные блюда · Примеры меню: маринованные рёбра, свежие говяжьи рёбра, тушёные рёбра, корейские комплексные обеды",
    "hours": "11:30–22:00 (последний заказ 21:30)",
    "keywords": [
      "ресторан",
      "мясо",
      "говядина",
      "рёбра",
      "корейская кухня"
    ]
  },
  "paljinhyang-hanok-village": {
    "description": "Китайская кухня · Примеры меню: лапша чачжанмён, острый суп с морепродуктами чамппон, свинина в кисло-сладком соусе, утка по-пекински, комплексные блюда",
    "hours": "11:30–22:00 (перерыв 15:00–17:00; последний заказ 21:30)",
    "keywords": [
      "ресторан",
      "китайская кухня",
      "лапша",
      "утка"
    ]
  },
  "hollys-incheon-hanok-village": {
    "description": "Кофе и десерты · Примеры меню: американо, латте, торт",
    "hours": "09:00–22:30",
    "keywords": [
      "кафе",
      "кофе",
      "десерт"
    ]
  },
  "songhaeon-songdo": {
    "description": "Сауна.",
    "hours": "06:00–22:00",
    "keywords": [
      "сауна",
      "баня",
      "спа"
    ]
  },
  "songjjujip-main": {
    "description": "Корейские острые блюда из осьминога · Примеры меню: осьминог с икрой летучей рыбы, острый жареный осьминог, жареный рис с сыром",
    "hours": "11:00–21:50 (перерыв 15:00–16:30); последние заказы 14:00 и 20:50",
    "keywords": [
      "ресторан",
      "осьминог",
      "морепродукты",
      "корейская кухня"
    ]
  },
  "otto-gimbap-songdo": {
    "description": "Корейские рисовые роллы и закуски · Примеры меню: кимбап Otto, кимбап с васаби, сладкая хрустящая курица",
    "hours": "10:00–19:00 (перерыв 14:00–16:00)",
    "keywords": [
      "кимбап",
      "курица",
      "роллы",
      "закуски"
    ]
  },
  "burgeroom181-songdo": {
    "description": "Авторские бургеры · Примеры меню: фирменный бургер 181 с говядиной, бургер с креветками, картофель фри, крафтовое пиво",
    "hours": "11:00–21:30 (перерыв 16:00–17:00, последний заказ 21:00)",
    "keywords": [
      "бургер",
      "гамбургер",
      "пиво",
      "фастфуд"
    ]
  },
  "moms-touch-songdo-central-park": {
    "description": "Фастфуд и куриные бургеры · Примеры меню: Ssai Burger, жареная курица, картофель фри",
    "hours": "08:30–22:00 (последний заказ 21:50)",
    "keywords": [
      "бургер",
      "курица",
      "фастфуд"
    ]
  },
  "burger-king-incheon-songdo-central-park": {
    "description": "Фастфуд и бургеры · Примеры меню: Whopper, гамбургеры, картофель фри",
    "hours": "10:00–23:00",
    "keywords": [
      "бургер",
      "гамбургер",
      "фастфуд"
    ]
  },
  "incheon-port-hangdong-7ga": {
    "description": "Порт.",
    "hours": "",
    "keywords": [
      "порт",
      "паром",
      "терминал"
    ],
    "directions": "Справочный маршрут до прибрежного пассажирского терминала порта Инчхон: от отеля пройдите до остановки 인천스타트업파크, сядьте на автобус 16-1, на остановке 연안아파트 пересядьте на автобус 36 или 14 и выйдите на 연안여객터미널. Поездка занимает около 1 часа; время зависит от отправления и дорожной обстановки."
  },
  "starbucks-songdo-central-park": {
    "description": "Кофе и лёгкие блюда · Примеры меню: американо, фраппучино, сэндвичи, торт",
    "hours": "07:00–22:00 (доставка 10:00–21:30)",
    "keywords": [
      "кафе",
      "кофе",
      "десерт"
    ]
  },
  "playground-brewery-taproom-songdo": {
    "description": "Крафтовое пиво и блюда паба · Примеры меню: крафтовое пиво, курица по-вьетнамски, бургер с креветками и картофелем фри, томлёная свинина с карамельным соусом чили",
    "hours": "Пн.–пт. 15:00–24:00 (последний заказ 23:00) / сб. 12:00–24:00 (последний заказ 23:00) / вс. 12:00–22:00 (последний заказ 21:00)",
    "keywords": [
      "пиво",
      "паб",
      "бар",
      "бургер",
      "курица"
    ]
  },
  "geumbyeol-beer-songdo-lotte-mall": {
    "description": "Пивной бар · Примеры меню: пиво, хрустящая острая курица, пицца с пулькоги, томатный суп с пастой",
    "hours": "Ежедневно 17:00–01:00 следующего дня (последний заказ 00:00; в праздники возможны закрытия)",
    "keywords": [
      "пиво",
      "бар",
      "паб",
      "курица",
      "пицца"
    ]
  },
  "central-park-station-exit-3": {
    "description": "Выход из станции метро.",
    "hours": "Не применимо",
    "keywords": [
      "метро",
      "станция",
      "центральный парк"
    ],
    "directions": "В справочнике отеля указано около 5 минут пешком до выхода 3 станции 센트럴파크역. Naver Maps оценивает пеший маршрут примерно в 7 минут."
  },
  "lotte-mart-songdo": {
    "description": "Супермаркет и товары повседневного спроса.",
    "hours": "10:00–23:00",
    "keywords": [
      "супермаркет",
      "магазин",
      "продукты"
    ]
  },
  "songdo-central-park": {
    "description": "Городской парк с прогулочными дорожками и видами на воду.",
    "hours": "Прогулки по парку доступны; отдельные развлечения работают по своему графику",
    "keywords": [
      "парк",
      "прогулка",
      "достопримечательности"
    ]
  },
  "byeol-onnuri-pharmacy-songdo": {
    "description": "Аптека · По зарегистрированным данным работает допоздна; уточните перед посещением.",
    "hours": "08:30–01:00 следующего дня; круглосуточный автомат (24 часа)",
    "keywords": [
      "аптека",
      "лекарства"
    ]
  },
  "hyundai-premium-outlet-songdo": {
    "description": "Аутлет · Одежда, товары для дома и рестораны",
    "hours": "10:30–20:00 (рестораны 10:30–21:00; выходные и продлённые часы могут меняться)",
    "keywords": [
      "аутлет",
      "шопинг",
      "торговый центр",
      "магазины"
    ]
  },
  "g-tower-ifez-observatory": {
    "description": "Достопримечательность · Смотровая площадка и выставка на 33-м этаже",
    "hours": "Вт.–пт. 10:00–21:00 / сб., вс. и некоторые праздники 13:00–21:00 (последний вход 20:30)",
    "keywords": [
      "смотровая площадка",
      "башня",
      "достопримечательности"
    ],
    "notes": "По сообщению IFEZ от 14.10.2026: сад на 29-м этаже вновь открыт с 15.10.2026, по будням 13:30–18:00 (закрыт в выходные и праздники). Для пропуска зарегистрируйтесь с удостоверением личности на 1-м этаже; возможны закрытия из-за погоды. Это отдельный объект от выставки и смотровой площадки IFEZ на 33-м этаже.",
    "closed": "Понедельник, отдельные государственные праздники, периоды Соллаль и Чхусок, временные закрытия"
  },
  "songdo-central-park-water-taxi": {
    "description": "Прогулочное водное такси · Посадка в West Boathouse (не прокат лодок в East Boathouse)",
    "hours": "График зависит от сезона и погоды; уточните у оператора",
    "keywords": [
      "водное такси",
      "лодка",
      "прогулка",
      "достопримечательности"
    ]
  },
  "songdo-timespace-complex": {
    "description": "Торгово-ресторанный комплекс: карри, паста, пицца, мясо на гриле, корейские супы, японские блюда, токпокки и поке. В каталоге 15 ресторанов.",
    "hours": "Дни и часы работы зависят от заведения. Уточните перед посещением.",
    "keywords": [
      "ресторан",
      "торговый центр",
      "шопинг",
      "мясо",
      "карри",
      "паста",
      "пицца",
      "корейская кухня",
      "токпокки",
      "поке",
      "таймспейс"
    ],
    "directions": "Пеший маршрут Naver заканчивается у Starbucks Songdo Castle Park в соседнем здании Lotte Mall Songdo Castle Park. Starbucks находится не в Timespace. Затем пройдите к Songdo Timespace по адресу 158 Harmony-ro и найдите корпус выбранного ресторана.",
    "notes": "Каталог включает 15 ресторанов с указанием корпусов и помещений. Арендаторы, меню и часы работы могут меняться. Пеший маршрут Naver заканчивается у соседнего Starbucks, а не у входа в Timespace.",
    "closed": "Зависит от заведения"
  }

}

export function withRussianHotel(hotel: HotelDataset): HotelDataset {
  return { ...hotel, translations: { ...hotel.translations, ru: { ...RUSSIAN_HOTEL } } }
}

export function withRussianFacilities(dataset: FacilityDataset): FacilityDataset {
  return { ...dataset, facilities: dataset.facilities.map(facility => {
    const copy = RUSSIAN_VENUES[facility.id]
    const en = facility.translations.en
    const ru: FacilityTranslation = { name: en.name, address: en.address, description: copy?.description ?? '', openingHours: copy?.hours ?? '', directions: copy?.directions ?? '', notes: copy?.notes ?? '' }
    return { ...facility, translations: { ...facility.translations, ru }, keywords: { ...facility.keywords, ru: copy?.keywords ?? [] }, closedDays: { ...facility.closedDays, ru: copy?.closed ?? '' } }
  }) }
}

// Source checksums make later edits visible rather than silently publishing an
// outdated Russian price or opening time. Refresh the translation and checksum together.
const HOTEL_SOURCE_CHECKSUMS = {"checkIn":"75f6b694","checkOut":"31289250","breakfast":"0e01c019","parking":"9bbaa6d2","roomUsage":"da7f9077","notes":"e8cd2183"}
const FACILITY_SOURCE_CHECKSUMS: Record<string, Record<string, string>> = {
  "cu-songdo-senseuri": {
    "description": "30b8443d",
    "openingHours": "3062c3e6",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "blue-ocean-sauna-songdo": {
    "description": "e4eee281",
    "openingHours": "7d20b5b6",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "f30750df"
  },
  "malt-house-incheon-songdo": {
    "description": "abd9e612",
    "openingHours": "01f506c0",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "compose-coffee-incheon-songdo-central-park": {
    "description": "3d03412d",
    "openingHours": "4068c78f",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "chaeum-pharmacy-songdo": {
    "description": "a00854fc",
    "openingHours": "0d36401b",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "hanyang-songdo-hanok-village": {
    "description": "91597f9b",
    "openingHours": "25f312f2",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "gyeongbokgung-hanok-village": {
    "description": "2d02b28b",
    "openingHours": "09b682dc",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "paljinhyang-hanok-village": {
    "description": "3297a651",
    "openingHours": "ddae5643",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "hollys-incheon-hanok-village": {
    "description": "aea237dd",
    "openingHours": "0e177010",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "songhaeon-songdo": {
    "description": "e4eee281",
    "openingHours": "c1a4cba8",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "songjjujip-main": {
    "description": "7b8fdd4a",
    "openingHours": "b2afaf26",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "otto-gimbap-songdo": {
    "description": "69c61541",
    "openingHours": "24f7ec82",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "burgeroom181-songdo": {
    "description": "88f9cfb9",
    "openingHours": "b2e4c9d5",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "moms-touch-songdo-central-park": {
    "description": "b9d6b07a",
    "openingHours": "73247ad8",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "burger-king-incheon-songdo-central-park": {
    "description": "f370b5c7",
    "openingHours": "3078e1ec",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "incheon-port-hangdong-7ga": {
    "description": "0394e90e",
    "openingHours": "ffcaaa85",
    "directions": "b5337801",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "starbucks-songdo-central-park": {
    "description": "abca515c",
    "openingHours": "50e1b7a8",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "playground-brewery-taproom-songdo": {
    "description": "4cd79f70",
    "openingHours": "f6613822",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "geumbyeol-beer-songdo-lotte-mall": {
    "description": "93d7f9cd",
    "openingHours": "5808c556",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "central-park-station-exit-3": {
    "description": "c281a508",
    "openingHours": "a0305adb",
    "directions": "062cf51f",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "lotte-mart-songdo": {
    "description": "70f311c9",
    "openingHours": "3078e1ec",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "songdo-central-park": {
    "description": "fda9c458",
    "openingHours": "be635cdc",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "byeol-onnuri-pharmacy-songdo": {
    "description": "fb3c9bc3",
    "openingHours": "59147fe1",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "hyundai-premium-outlet-songdo": {
    "description": "65d2d950",
    "openingHours": "49654121",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "g-tower-ifez-observatory": {
    "description": "dd8891ef",
    "openingHours": "681cea2c",
    "directions": "ffcaaa85",
    "notes": "e4f2be19",
    "closedDays": "2935e037"
  },
  "songdo-central-park-water-taxi": {
    "description": "cf9f5fa8",
    "openingHours": "75fd0176",
    "directions": "ffcaaa85",
    "notes": "ffcaaa85",
    "closedDays": "ffcaaa85"
  },
  "songdo-timespace-complex": {
    "description": "cd82d778",
    "openingHours": "3d34ab6d",
    "directions": "54fa8a2c",
    "notes": "8634eab7",
    "closedDays": "c69071c4"
  }
}
function sourceChecksum(value: string): string {
  let hash = 2166136261
  for (const character of JSON.stringify(value)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0
  return hash.toString(16).padStart(8, '0')
}
export function russianTranslationIssues(hotel: HotelDataset, facilities: FacilityDataset): string[] {
  const issues: string[] = []
  for (const field of Object.keys(HOTEL_SOURCE_CHECKSUMS) as (keyof typeof HOTEL_SOURCE_CHECKSUMS)[]) {
    if (sourceChecksum(hotel.translations.en[field]) !== HOTEL_SOURCE_CHECKSUMS[field]) issues.push('hotel.' + field)
  }
  for (const facility of facilities.facilities.filter(item => item.isPublished)) {
    const checks = FACILITY_SOURCE_CHECKSUMS[facility.id]
    if (!checks) { issues.push(facility.id); continue }
    for (const field of ['description','openingHours','directions','notes'] as const) if (sourceChecksum(facility.translations.en[field]) !== checks[field]) issues.push(facility.id + '.' + field)
    if (sourceChecksum(facility.closedDays.en) !== checks.closedDays) issues.push(facility.id + '.closedDays')
  }
  return issues
}
