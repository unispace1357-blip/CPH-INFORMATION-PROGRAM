import type { GuideLanguage } from '../types/guide.ts'
import type { FrontdeskScriptCategory } from '../types/frontdeskScript.ts'

type LocalizedNotice = { title: string; text: string }
export interface OperationalNotice {
  id: string
  guestCategory: 'roomUsage' | 'parking' | 'checkIn'
  staffCategory: FrontdeskScriptCategory
  copy: Record<GuideLanguage, LocalizedNotice>
  keywords: readonly string[]
  question: { en: string; ko: string }
}

/** User-provided operational updates, 2026-11-25.
 * Historical approved workbook and existing search synonyms remain unchanged.
 */
export const HOTEL_OPERATIONAL_NOTICES: readonly OperationalNotice[] = [
  {
    id: 'hotel-gym',
    guestCategory: 'roomUsage', staffCategory: 'hotel-facilities',
    keywords: ["спортзал", "фитнес", "тренажерный зал", '헬스장', '헬스', '운동', '피트니스', 'gym', 'fitness', '健身房', '健身', 'ジム', 'フィットネス'],
    question: { en: 'Where is the gym, and what are its opening hours?', ko: '헬스장은 어디에 있고 몇 시까지 운영하나요?' },
    copy: {
      ru: {"title":"Тренажёрный зал","text":"Тренажёрный зал находится на 4-м этаже и открыт с 06:00 до 23:00."},
      ko: { title: '헬스장 이용 안내', text: '헬스장은 호텔 4층에 있으며, 운영시간은 06:00~23:00입니다.' },
      en: { title: 'Gym', text: 'The gym is on the 4th floor and is open from 6:00 AM to 11:00 PM.' },
      'zh-CN': { title: '健身房', text: '健身房位于酒店4楼，开放时间为06:00至23:00。' },
      ja: { title: 'フィットネスジム', text: 'ジムはホテル4階にあり、営業時間は6:00～23:00です。' },
    },
  },
  {
    id: 'ev-charging-stations',
    guestCategory: 'parking', staffCategory: 'parking',
    keywords: ["электромобиль", "зарядная станция", "зарядка", '전기충전소', '전기차', '전기차 충전소', '전기차충전', '충전소', '완속충전', 'ev charging', 'electric vehicle', '7kw', 'b-23', '充电桩', '電気自動車', '充電器'],
    question: { en: 'Where can I charge my electric vehicle?', ko: '전기차 충전소는 어디에 있나요?' },
    copy: {
      ru: {"title":"Зарядка электромобилей","text":"На подземном этаже B1 в зоне B-23 установлены три зарядные станции мощностью 7 кВт для медленной зарядки."},
      ko: { title: '전기차 충전소', text: '지하 1층 B-23 구역에 7kW 완속 충전기 3기가 설치되어 있습니다.' },
      en: { title: 'EV charging stations', text: 'Three 7 kW slow EV chargers are located in zone B-23 on basement level B1.' },
      'zh-CN': { title: '电动汽车充电站', text: '地下1层B-23区域设有3台7 kW慢速充电桩。' },
      ja: { title: '電気自動車充電設備', text: '地下1階のB-23区画に7 kWの普通充電器が3基設置されています。' },
    },
  },
  {
    id: 'room-blanket-rental',
    guestCategory: 'roomUsage', staffCategory: 'room-usage',
    keywords: ["плед", "одеяло", '담요', '담요 대여', '담요대여', '세탁비', 'blanket', '毛毯', '毛布'],
    question: { en: 'Can I borrow a blanket?', ko: '담요를 대여할 수 있나요?' },
    copy: {
      ru: {"title":"Прокат пледа","text":"При выдаче пледа взимается плата за стирку — 5 000 вон за номер."},
      ko: { title: '담요 대여', text: '담요 대여 시 객실당 5,000원의 세탁비가 부과됩니다.' },
      en: { title: 'Blanket rental', text: 'Blankets are available for rental with a KRW 5,000 laundry fee per room.' },
      'zh-CN': { title: '毛毯租借', text: '租借毛毯时，每间客房收取5,000韩元的洗涤费。' },
      ja: { title: '毛布の貸し出し', text: '毛布の貸し出しには、1室につき5,000ウォンのクリーニング代がかかります。' },
    },
  },
  {
    id: 'bathtub-drain-controls',
    guestCategory: 'roomUsage', staffCategory: 'room-usage',
    keywords: ["ванна", "слив", "пробка", '욕조', '배수구', '욕조 배수구', '욕조배수구', '다이얼', 'bathtub', 'drain', '浴缸', '排水口', '浴槽', '排水栓'],
    question: { en: 'How do I close the bathtub drain?', ko: '욕조 배수구를 어떻게 닫나요?' },
    copy: {
      ru: {"title":"Как закрыть слив ванны","text":"Поверните серебристую ручку внутри ванны, чтобы закрыть слив."},
      ko: { title: '욕조 배수구 닫는 방법', text: '욕조 안쪽에 있는 은색 다이얼을 돌리면 배수구가 닫힙니다.' },
      en: { title: 'Closing the bathtub drain', text: 'Turn the silver dial inside the bathtub to close the drain.' },
      'zh-CN': { title: '关闭浴缸排水口', text: '转动浴缸内侧的银色旋钮即可关闭排水口。' },
      ja: { title: '浴槽の排水栓の閉め方', text: '浴槽内側にある銀色のダイヤルを回すと、排水栓が閉まります。' },
    },
  },
  {
    id: 'phone-charger-rental',
    guestCategory: 'roomUsage', staffCategory: 'room-usage',
    keywords: ["зарядка", "зарядное устройство", "телефон", '충전기', '휴대폰충전기', '충전기대여', 'c타입', '8핀', 'usb-c', 'type-c', 'lightning', 'charger', '手机充电器', '充電器'],
    question: { en: 'Can I borrow a phone charger?', ko: '휴대폰 충전기를 대여할 수 있나요?' },
    copy: {
      ru: {"title":"Прокат зарядного устройства","text":"На стойке регистрации можно взять зарядное устройство USB-C или 8-pin (Lightning) под залог 10 000 вон наличными."},
      ko: { title: '휴대폰 충전기 대여', text: 'C타입 및 8핀 충전기는 프론트에서 현금 보증금 10,000원을 맡기고 대여하실 수 있습니다.' },
      en: { title: 'Phone charger rental', text: 'USB-C and 8-pin (Lightning) chargers are available to borrow at the front desk with a KRW 10,000 cash deposit.' },
      'zh-CN': { title: '手机充电器租借', text: '可在前台支付10,000韩元现金押金，租借USB-C或8针（Lightning）充电器。' },
      ja: { title: '携帯電話充電器の貸し出し', text: 'USB-Cおよび8ピン（Lightning）の充電器は、現金10,000ウォンを保証金としてフロントにお預けいただくことで貸し出し可能です。' },
    },
  },

  {
    "id": "room-water",
    "guestCategory": "roomUsage",
    "staffCategory": "room-usage",
    "keywords": ["вода", "бутылка", "холодильник", 
      "생수",
      "물",
      "물병",
      "냉장고",
      "생수추가",
      "물추가",
      "생수 추가",
      "water",
      "bottled water",
      "extra water",
      "矿泉水",
      "饮用水",
      "ミネラルウォーター",
      "水"
    ],
    "question": {
      "en": "Where can I get extra bottled water?",
      "ko": "생수를 추가로 받을 수 있나요?"
    },
    "copy": {
      ru: {"title":"Питьевая вода","text":"В холодильнике номера предусмотрены 3 бутылки воды. Дополнительно можно получить до 2 бутылок на номер на стойке регистрации."},
      "ko": {
        "title": "생수 제공 안내",
        "text": "객실 냉장고에 생수 3병이 기본으로 비치되어 있습니다. 추가 생수는 객실당 2병까지 프론트에서 수령하실 수 있습니다."
      },
      "en": {
        "title": "Bottled water",
        "text": "Three bottles of water are provided in the room refrigerator. Up to two additional bottles per room can be collected at the front desk."
      },
      "zh-CN": {
        "title": "瓶装饮用水",
        "text": "客房冰箱内备有3瓶饮用水。每间客房可在前台额外领取最多2瓶。"
      },
      "ja": {
        "title": "ミネラルウォーター",
        "text": "客室の冷蔵庫に水を3本ご用意しています。追加のお水は1室につき2本までフロントでお受け取りいただけます。"
      }
    }
  },
  {
    "id": "room-towels",
    "guestCategory": "roomUsage",
    "staffCategory": "room-usage",
    "keywords": ["полотенце", "полотенца", 
      "수건",
      "타월",
      "타올",
      "목욕수건",
      "목욕타월",
      "수건위치",
      "towel",
      "bath towel",
      "毛巾",
      "浴巾",
      "タオル",
      "バスタオル"
    ],
    "question": {
      "en": "Where are the towels?",
      "ko": "수건은 어디에 있나요?"
    },
    "copy": {
      ru: {"title":"Где находятся полотенца","text":"Полотенца находятся в ящиках под раковиной в ванной комнате."},
      "ko": {
        "title": "수건 위치",
        "text": "수건은 화장실 세면대 서랍장에 비치되어 있습니다."
      },
      "en": {
        "title": "Towel location",
        "text": "Towels are provided in the drawer unit beneath the bathroom washbasin."
      },
      "zh-CN": {
        "title": "毛巾位置",
        "text": "毛巾放在浴室洗手台的抽屉柜内。"
      },
      "ja": {
        "title": "タオルの場所",
        "text": "タオルは浴室の洗面台の引き出しにご用意しています。"
      }
    }
  },
  {
    "id": "luggage-storage",
    "guestCategory": "checkIn",
    "staffCategory": "check-in-out",
    "keywords": ["багаж", "чемодан", "хранение багажа", 
      "짐",
      "짐보관",
      "짐 보관",
      "캐리어",
      "가방",
      "수하물",
      "luggage storage",
      "baggage",
      "luggage",
      "suitcase",
      "行李寄存",
      "行李",
      "荷物預かり",
      "スーツケース"
    ],
    "question": {
      "en": "Can I store my luggage before check-in or after check-out?",
      "ko": "체크인 전이나 체크아웃 후에 짐을 맡길 수 있나요?"
    },
    "copy": {
      ru: {"title":"Хранение багажа","text":"До заезда и после выезда вы можете оставить багаж на стойке регистрации."},
      "ko": {
        "title": "짐 보관",
        "text": "체크인 전과 체크아웃 후에는 프론트에서 짐을 보관하실 수 있습니다."
      },
      "en": {
        "title": "Luggage storage",
        "text": "Luggage storage is available at the front desk before check-in and after check-out."
      },
      "zh-CN": {
        "title": "行李寄存",
        "text": "入住前及退房后均可在前台寄存行李。"
      },
      "ja": {
        "title": "お荷物のお預かり",
        "text": "チェックイン前およびチェックアウト後は、フロントでお荷物をお預かりできます。"
      }
    }
  },
  {
    "id": "stayover-housekeeping",
    "guestCategory": "roomUsage",
    "staffCategory": "room-usage",
    "keywords": ["уборка", "клининг", 
      "연박",
      "재실정비",
      "재실정비 청소",
      "청소",
      "객실청소",
      "룸클리닝",
      "문고리",
      "청소요청",
      "housekeeping",
      "room cleaning",
      "make up room",
      "打扫房间",
      "客房清洁",
      "連泊",
      "客室清掃"
    ],
    "question": {
      "en": "How do I request housekeeping during my stay?",
      "ko": "연박 중 객실 청소는 어떻게 요청하나요?"
    },
    "copy": {
      ru: {"title":"Уборка номера при длительном проживании","text":"Если вы хотите, чтобы номер убрали во время проживания, повесьте табличку с просьбой об уборке на наружную ручку двери."},
      "ko": {
        "title": "연박 객실 청소",
        "text": "연박 중 객실 청소를 원하시면 객실 내 재실정비 안내판을 객실 문 바깥쪽 문고리에 걸어 주세요."
      },
      "en": {
        "title": "Housekeeping during your stay",
        "text": "If you would like your room cleaned during a multi-night stay, hang the housekeeping request sign on the outside door handle."
      },
      "zh-CN": {
        "title": "连住客房清洁",
        "text": "连住期间如需清洁客房，请将客房内的清洁提示牌挂在房门外侧的门把手上。"
      },
      "ja": {
        "title": "連泊時の客室清掃",
        "text": "連泊中に客室清掃をご希望の場合は、客室内の清掃希望札をドアの外側の取っ手にお掛けください。"
      }
    }
  },
  {
    "id": "frontdesk-extension",
    "guestCategory": "roomUsage",
    "staffCategory": "room-usage",
    "keywords": ["ресепшен", "телефон", "стойка регистрации", 
      "프론트",
      "내선",
      "내선번호",
      "0번",
      "프론트연결",
      "객실전화",
      "전화기",
      "reception",
      "front desk",
      "extension 0",
      "前台",
      "内线",
      "フロント",
      "内線"
    ],
    "question": {
      "en": "How can I call the front desk from my room?",
      "ko": "객실에서 프론트로 어떻게 전화하나요?"
    },
    "copy": {
      ru: {"title":"Связь со стойкой регистрации","text":"Наберите 0 на телефоне в номере, чтобы связаться со стойкой регистрации."},
      "ko": {
        "title": "프론트 내선번호",
        "text": "객실 전화기에서 0번을 누르시면 프론트로 연결됩니다."
      },
      "en": {
        "title": "Front desk extension",
        "text": "Dial 0 on your room telephone to reach the front desk."
      },
      "zh-CN": {
        "title": "前台内线",
        "text": "使用客房电话拨打0即可联系前台。"
      },
      "ja": {
        "title": "フロント内線番号",
        "text": "客室電話で0番を押すとフロントにつながります。"
      }
    }
  },
  {
    "id": "room-power-keycard",
    "guestCategory": "roomUsage",
    "staffCategory": "room-usage",
    "keywords": ["электричество", "свет", "ключ-карта", 
      "카드키",
      "카드키함",
      "전기",
      "전원",
      "불안켜짐",
      "불 안 켜짐",
      "불안들어옴",
      "전기안들어옴",
      "도어락",
      "key card",
      "power",
      "electricity",
      "room power",
      "房卡",
      "取电",
      "カードキー",
      "電源"
    ],
    "question": {
      "en": "What should I do if the room power does not turn on?",
      "ko": "카드키를 꽂아도 전원이 들어오지 않으면 어떻게 하나요?"
    },
    "copy": {
      ru: {"title":"Если в номере нет электричества","text":"Приложите ключ-карту к дверному замку, затем вставьте ту же карту в держатель ключ-карты внутри номера."},
      "ko": {
        "title": "객실 전원이 들어오지 않을 때",
        "text": "객실 도어락에 카드키를 스캔한 뒤, 스캔한 동일한 카드키를 객실 내부 카드키함에 꽂아 주세요."
      },
      "en": {
        "title": "If the room power does not turn on",
        "text": "Scan your key card on the room door lock, then insert that same card into the key card holder inside the room."
      },
      "zh-CN": {
        "title": "客房无法通电时",
        "text": "请先在客房门锁上刷房卡，再将同一张房卡插入客房内的取电卡槽。"
      },
      "ja": {
        "title": "客室の電源が入らない場合",
        "text": "客室のドアロックにカードキーをかざし、使用した同じカードキーを客室内のカードキーホルダーに差し込んでください。"
      }
    }
  },
  {
    "id": "taxi-assistance",
    "guestCategory": "roomUsage",
    "staffCategory": "hotel-facilities",
    "keywords": ["такси", "аэропорт", "заказ такси", 
      "택시",
      "택시호출",
      "택시예약",
      "카카오택시",
      "콜택시",
      "장거리택시",
      "공항택시",
      "taxi",
      "kakao taxi",
      "taxi reservation",
      "出租车",
      "叫车",
      "タクシー",
      "タクシー予約"
    ],
    "question": {
      "en": "Can the front desk arrange a taxi?",
      "ko": "프론트에서 택시를 불러주실 수 있나요?"
    },
    "copy": {
      ru: {"title":"Вызов и заказ такси","text":"Для дальних поездок, например в аэропорт Инчхон, стойка регистрации поможет забронировать такси. Для обычных поездок сотрудники вызовут такси через Kakao T."},
      "ko": {
        "title": "택시 호출 및 예약",
        "text": "인천공항 등 장거리 이동은 프론트에서 택시 예약을 도와드립니다. 그 외 일반 이동은 프론트에서 카카오택시를 호출해 드립니다."
      },
      "en": {
        "title": "Taxi assistance",
        "text": "For longer journeys, such as to Incheon Airport, the front desk can help reserve a taxi. For other journeys, the front desk can request a taxi through Kakao T."
      },
      "zh-CN": {
        "title": "出租车预约及叫车",
        "text": "前往仁川机场等长途目的地时，前台可协助预约出租车。其他行程可由前台通过Kakao T叫车。"
      },
      "ja": {
        "title": "タクシーの手配",
        "text": "仁川空港など長距離の移動はフロントでタクシーの予約を承ります。それ以外の移動はフロントでKakao Tを利用してタクシーを手配します。"
      }
    }
  },
  {
    "id": "extra-bedding",
    "guestCategory": "roomUsage",
    "staffCategory": "room-usage",
    "keywords": ["подушка", "одеяло", "постель", 
      "베개",
      "배게",
      "이불",
      "침구",
      "추가침구",
      "베개추가",
      "이불추가",
      "pillow",
      "bedding",
      "extra pillow",
      "extra bedding",
      "枕头",
      "被子",
      "寝具",
      "枕",
      "掛け布団"
    ],
    "question": {
      "en": "Can I request extra pillows or bedding?",
      "ko": "베개나 이불을 추가로 받을 수 있나요?"
    },
    "copy": {
      ru: {"title":"Дополнительные подушки и одеяла","text":"За дополнительные подушки или одеяла взимается плата 10 000 вон. При высокой загрузке отеля услуга может быть недоступна."},
      "ko": {
        "title": "베개·이불 추가",
        "text": "베개 및 이불 추가 시 10,000원의 추가 요금이 부과됩니다. 객실 점유율이 높은 날에는 제공이 어려울 수 있습니다."
      },
      "en": {
        "title": "Extra pillows and bedding",
        "text": "An additional charge of KRW 10,000 applies to requests for extra pillows or bedding. These may not be available on days of high room occupancy."
      },
      "zh-CN": {
        "title": "额外枕头及被褥",
        "text": "额外提供枕头或被褥需支付10,000韩元。客房入住率较高时可能无法提供。"
      },
      "ja": {
        "title": "枕・掛け布団の追加",
        "text": "枕や掛け布団の追加には10,000ウォンの追加料金がかかります。客室稼働率が高い日はご用意できない場合があります。"
      }
    }
  },
  {
    "id": "umbrella-rental",
    "guestCategory": "roomUsage",
    "staffCategory": "hotel-facilities",
    "keywords": ["зонт", "дождь", 
      "우산",
      "우산대여",
      "우산 대여",
      "비",
      "비올때",
      "umbrella",
      "umbrella rental",
      "雨伞",
      "借伞",
      "傘",
      "傘の貸出"
    ],
    "question": {
      "en": "Can I borrow an umbrella?",
      "ko": "우산을 빌릴 수 있나요?"
    },
    "copy": {
      ru: {"title":"Прокат зонтов","text":"Зонт можно взять на стойке регистрации."},
      "ko": {
        "title": "우산 대여",
        "text": "우산은 프론트에서 대여하실 수 있습니다."
      },
      "en": {
        "title": "Umbrella rental",
        "text": "Umbrellas are available to borrow at the front desk."
      },
      "zh-CN": {
        "title": "雨伞租借",
        "text": "可在前台借用雨伞。"
      },
      "ja": {
        "title": "傘の貸し出し",
        "text": "フロントで傘をお借りいただけます。"
      }
    }
  },
  {
    "id": "laundry-service",
    "guestCategory": "roomUsage",
    "staffCategory": "hotel-facilities",
    "keywords": ["стирка", "прачечная", "бельё", 
      "세탁",
      "빨래",
      "런더리",
      "런드리",
      "런더리백",
      "세탁물",
      "세탁비",
      "세탁요금",
      "laundry",
      "laundry bag",
      "laundry service",
      "洗衣",
      "洗衣袋",
      "ランドリー",
      "洗濯"
    ],
    "question": {
      "en": "How can I use the laundry service?",
      "ko": "세탁 서비스는 어떻게 이용하나요?"
    },
    "copy": {
      ru: {"title":"Прачечная","text":"В ящике под телевизором находятся прейскурант и пакет для белья. Положите вещи в пакет и повесьте его на дверную ручку номера до 12:00 следующего дня, чтобы воспользоваться платной стиркой. Услуга недоступна, если вы выезжаете на следующий день."},
      "ko": {
        "title": "세탁 서비스",
        "text": "TV 아래 서랍장에 세탁 요금표와 런더리백이 비치되어 있습니다. 세탁물을 런더리백에 담아 다음 날 정오(12:00) 전에 객실 문고리에 걸어 두시면 유료 세탁 서비스를 이용하실 수 있습니다. 다음 날 체크아웃 예정인 경우에는 이용하실 수 없습니다."
      },
      "en": {
        "title": "Laundry service",
        "text": "A laundry price list and laundry bag are in the drawer unit below the TV. Place your laundry in the bag and hang it on the room door handle before noon (12:00 PM) the following day to use the paid laundry service. This service is unavailable if you are checking out the following day."
      },
      "zh-CN": {
        "title": "洗衣服务",
        "text": "电视下方的抽屉柜内备有洗衣价目表和洗衣袋。将衣物放入洗衣袋并于次日中午12点前挂在客房门把手上，即可使用付费洗衣服务。次日退房的客人无法使用此服务。"
      },
      "ja": {
        "title": "ランドリーサービス",
        "text": "テレビ下の引き出しに料金表とランドリーバッグをご用意しています。洗濯物をバッグに入れ、翌日の正午（12:00）前までに客室のドアの取っ手に掛けていただくと、有料ランドリーサービスをご利用いただけます。翌日にチェックアウトされる場合はご利用いただけません。"
      }
    }
  },
  {
    "id": "lounge-room-service",
    "guestCategory": "roomUsage",
    "staffCategory": "hotel-facilities",
    "keywords": ["ресторан", "обед", "ужин", "рум сервис", "меню", "лаунж", 
      "라운지",
      "룸서비스",
      "룸 서비스",
      "점심",
      "저녁",
      "식사",
      "객실식사",
      "호텔식당",
      "메뉴판",
      "룸서비스메뉴",
      "lounge",
      "room service",
      "lunch",
      "dinner",
      "restaurant",
      "客房送餐",
      "餐厅",
      "ラウンジ",
      "ルームサービス"
    ],
    "question": {
      "en": "When can I use the lounge or room service?",
      "ko": "라운지와 룸서비스는 언제 이용할 수 있나요?"
    },
    "copy": {
      ru: {"title":"Лаунж и обслуживание в номере","text":"После завтрака с 12:00 до 21:30 доступны питание в лаунже и обслуживание в номере. Меню обслуживания в номере находится в конце информационного буклета на столе в номере."},
      "ko": {
        "title": "라운지 및 룸서비스",
        "text": "조식 운영 종료 후 12:00~21:30에는 라운지에서 식사 및 룸서비스를 이용하실 수 있습니다. 룸서비스 메뉴는 객실 책상 위 안내 책자의 맨 뒷부분에서 확인하실 수 있습니다."
      },
      "en": {
        "title": "Lounge and room service",
        "text": "After breakfast service, lounge dining and room service are available from 12:00 PM to 9:30 PM. The room service menu is at the back of the information booklet on your room desk."
      },
      "zh-CN": {
        "title": "大堂休息室及客房送餐",
        "text": "早餐服务结束后，12:00至21:30可使用休息室餐饮及客房送餐服务。客房送餐菜单位于客房书桌上指南手册的最后部分。"
      },
      "ja": {
        "title": "ラウンジ・ルームサービス",
        "text": "朝食営業終了後、12:00～21:30はラウンジでのお食事およびルームサービスをご利用いただけます。ルームサービスのメニューは客室のデスク上にある案内冊子の末尾をご覧ください。"
      }
    }
  }
]

export function operationalNoticesFor(category: 'roomUsage' | 'parking' | 'checkIn' | 'checkOut'): readonly OperationalNotice[] {
  return HOTEL_OPERATIONAL_NOTICES.filter(item => item.guestCategory === (category === 'checkOut' ? 'checkIn' : category))
}
