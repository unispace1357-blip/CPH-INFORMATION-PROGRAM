import type { GuideLanguage } from '../types/guide.ts'
/** Approved staff policy, adapted for guests. Billing unit and other unconfirmed rules are not inferred. */
type PetNotice = { key: string; keywords: readonly string[]; copy: Record<GuideLanguage, readonly [string,string]> }
export const PET_STAY_NOTICES: readonly PetNotice[] = [
  {
    "key": "conditions",
    "keywords": [
      "펫캉스",
      "반려견",
      "강아지",
      "애견",
      "펫룸",
      "9층",
      "10kg",
      "몸무게",
      "견종",
      "여러마리",
      "pet stay",
      "dog friendly",
      "pet room",
      "pet weight",
      "犬",
      "ペット",
      "宠物",
      "狗",
      "собака",
      "питомец",
      "10 кг"
    ],
    "copy": {
      "ko": [
        "이용 가능 객실 및 조건",
        "반려견 동반 객실은 9층에 위치하며, 디럭스 더블 센트럴파크뷰와 디럭스 패밀리 트윈을 이용하실 수 있습니다. 스카이 디럭스와 파크스위트는 이용할 수 없습니다. 10kg 초과 반려견은 동반할 수 없으며, 여러 마리 동반 시 프론트에 사전 문의해 주세요."
      ],
      "en": [
        "Eligible rooms and conditions",
        "Dog-friendly rooms are on the 9th floor. Deluxe Double Central Park View and Deluxe Family Twin rooms are eligible; Sky Deluxe and Park Suite rooms are not. Dogs weighing over 10 kg are not permitted. Please contact the front desk in advance if bringing more than one dog."
      ],
      "zh-CN": [
        "可入住客房及条件",
        "可携带犬只入住的客房位于9楼，可选择豪华中央公园景观双人间或豪华家庭双床间。Sky Deluxe及Park Suite不可携带犬只入住。体重超过10公斤的犬只不可入住。如携带多只犬只，请提前咨询前台。"
      ],
      "ja": [
        "利用可能な客室・条件",
        "愛犬同伴客室は9階にあり、デラックスダブル セントラルパークビューとデラックスファミリーツインをご利用いただけます。スカイデラックスとパークスイートはご利用いただけません。体重10kgを超える犬は同伴できません。複数頭の場合は事前にフロントへお問い合わせください。"
      ],
      "ru": [
        "Доступные номера и условия",
        "Номера для проживания с собаками расположены на 9-м этаже. Доступны Deluxe Double Central Park View и Deluxe Family Twin; номера Sky Deluxe и Park Suite недоступны. Собаки весом более 10 кг не допускаются. Если вы планируете привезти несколько собак, заранее обратитесь на стойку регистрации."
      ]
    }
  },
  {
    "key": "fees",
    "keywords": [
      "펫캉스",
      "펫요금",
      "펫청소",
      "애견청소비",
      "반려견 청소비",
      "청소비",
      "성수기",
      "보증금",
      "33000",
      "55000",
      "pet fee",
      "pet cleaning fee",
      "pet deposit",
      "deposit",
      "清洁费",
      "押金",
      "清掃費",
      "デポジット",
      "плата за уборку",
      "залог"
    ],
    "copy": {
      "ko": [
        "청소비 및 보증금",
        "펫캉스 기본 청소비는 33,000원이며, 성수기(7월 16일~8월 31일)에는 55,000원입니다. 펫캉스 보증금은 별도로 받지 않습니다. 적용 요금 기준은 프론트에 확인해 주세요. 침구 오염이나 가구 파손에 따른 추가 비용은 별도입니다."
      ],
      "en": [
        "Cleaning fee and deposit",
        "The standard pet-stay cleaning fee is KRW 33,000; during peak season (July 16–August 31), it is KRW 55,000. No separate pet-stay deposit is required. Please confirm how the fee applies with the front desk. Additional charges for soiled bedding or furniture damage are separate."
      ],
      "zh-CN": [
        "清洁费及押金",
        "宠物住宿基本清洁费为33,000韩元，旺季（7月16日至8月31日）为55,000韩元。不另收宠物住宿押金。费用适用标准请向前台确认。床上用品污染或家具损坏产生的额外费用另计。"
      ],
      "ja": [
        "清掃費・保証金",
        "ペット同伴宿泊の基本清掃費は33,000ウォン、繁忙期（7月16日～8月31日）は55,000ウォンです。ペット同伴宿泊の保証金は別途いただきません。料金の適用基準はフロントへご確認ください。寝具の汚れや家具の破損に伴う追加費用は別途となります。"
      ],
      "ru": [
        "Плата за уборку и залог",
        "Стандартная плата за уборку при проживании с питомцем составляет 33 000 вон, в высокий сезон (16 июля — 31 августа) — 55 000 вон. Отдельный залог за проживание с питомцем не взимается. Порядок начисления платы уточняйте на стойке регистрации. Дополнительные расходы за загрязнение постельных принадлежностей или повреждение мебели оплачиваются отдельно."
      ]
    }
  },
  {
    "key": "movement",
    "keywords": [
      "펫캉스",
      "반려견이동",
      "강아지가방",
      "캐리어",
      "매너벨트",
      "중성화",
      "pet carrier",
      "dog carrier",
      "belly band",
      "中性化",
      "宠物包",
      "キャリー",
      "マナーベルト",
      "переноска",
      "пояс для собак"
    ],
    "copy": {
      "ko": [
        "호텔 내 이동 및 매너벨트",
        "호텔 내부에서 반려견과 이동할 때는 캐리어 또는 강아지가방을 이용해 주세요. 중성화 수술을 하지 않은 반려견은 매너벨트를 착용해 주세요."
      ],
      "en": [
        "Moving around the hotel",
        "Please use a pet carrier or dog bag when moving around the hotel. Dogs that have not been neutered or spayed should wear a pet hygiene belt."
      ],
      "zh-CN": [
        "酒店内移动及卫生带",
        "携带犬只在酒店内移动时，请使用宠物航空箱或宠物包。未绝育的犬只请佩戴宠物卫生带。"
      ],
      "ja": [
        "館内移動・マナーベルト",
        "館内を愛犬と移動する際は、キャリーまたは犬用バッグをご利用ください。去勢・避妊手術を受けていない犬にはマナーベルトを着用してください。"
      ],
      "ru": [
        "Передвижение по отелю",
        "При передвижении по отелю с собакой используйте переноску или сумку для собак. Для нестерилизованных собак используйте гигиенический пояс для питомцев."
      ]
    }
  },
  {
    "key": "kit",
    "keywords": [
      "펫캉스",
      "애견용품",
      "펫키트",
      "애견침대",
      "애견식기",
      "배변패드",
      "pet amenities",
      "dog bed",
      "pet bowl",
      "pee pad",
      "宠物用品",
      "尿垫",
      "ペット用品",
      "ペットシーツ",
      "лежанка",
      "миска",
      "пелёнка"
    ],
    "copy": {
      "ko": [
        "제공 용품",
        "애견침대, 애견식기, 배변패드를 제공해 드립니다. 그 외 필요한 반려견 용품은 직접 준비해 주세요."
      ],
      "en": [
        "Provided pet supplies",
        "A dog bed, pet bowls and toilet pads are provided. Please bring any other supplies your dog may need."
      ],
      "zh-CN": [
        "提供的宠物用品",
        "提供宠物床、宠物食器及尿垫。其他所需宠物用品请自行准备。"
      ],
      "ja": [
        "ご用意しているペット用品",
        "犬用ベッド、食器、ペットシーツをご用意しています。その他必要な用品はお客様ご自身でご準備ください。"
      ],
      "ru": [
        "Предоставляемые принадлежности",
        "Предоставляются лежанка для собаки, миски и впитывающие пелёнки. Остальные необходимые принадлежности привезите с собой."
      ]
    }
  }
]
export const PET_NOTE_INDEXES = [6,7,5,3,4] as const
export const PET_NOTE_LABELS: Record<GuideLanguage, readonly string[]> = {
  "ko": [
    "반려동물 동반 객실",
    "동반 신고",
    "미신고 추가 요금",
    "침구 오염 추가 청소비",
    "가구 파손"
  ],
  "en": [
    "Pet-friendly rooms",
    "Pet declaration",
    "Undeclared pet surcharge",
    "Soiled bedding cleaning fee",
    "Furniture damage"
  ],
  "zh-CN": [
    "宠物友好型客房",
    "宠物入住申报",
    "未申报附加费用",
    "床品污染清洁费",
    "家具损坏"
  ],
  "ja": [
    "ペット同伴客室",
    "ペット同伴の申告",
    "未申告追加料金",
    "寝具汚れの追加清掃費",
    "家具の破損"
  ],
  "ru": [
    "Номера для питомцев",
    "Уведомление о питомце",
    "Доплата при отсутствии уведомления",
    "Уборка загрязнённого белья",
    "Повреждение мебели"
  ]
}
export const PET_NOTE_ALIAS_IDS = ['pet-friendly-rooms','pet-declaration','pet-declaration','pet-cleaning-damage','pet-cleaning-damage'] as const
