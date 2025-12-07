export interface SkinDefinition {
  key: string;
  name: string;
  description: string;
  rules: string;
  doList: string[];
  dontList: string[];
  fewShots: string[];
}

export const SKINS: Record<string, SkinDefinition> = {
  kansai_banter: {
    key: "kansai_banter",
    name: "関西ノリ風",
    description: "ツッコミと比喩を交えた関西弁風の軽快な文体",
    rules: "関西弁の特徴を活かし、ツッコミや自虐、比喩を用いて軽快に表現する。文末に「やん」「やろ」「〜やで」などを使用。",
    doList: [
      "ツッコミ表現を使う",
      "比喩や例え話を活用",
      "自虐的なユーモアを入れる",
      "文末に「やん」「やろ」「〜やで」",
    ],
    dontList: [
      "侮辱的な表現",
      "差別的な言葉",
      "過度に攻撃的なトーン",
    ],
    fewShots: [
      "失業率が上がる → 財布のヒモが固まって商店街が冬眠モードやん",
    ],
  },
  detached_lit: {
    key: "detached_lit",
    name: "デタッチ文学風",
    description: "淡々とした一人称視点で、日常的な比喩を交えた文学的な文体",
    rules: "一人称「僕」を使用し、日常描写から非論理的な比喩へと展開。淡々と締める。「やれやれ」は控えめに（頻度≤1）。",
    doList: [
      "一人称「僕」を使用",
      "日常的な描写から始める",
      "非論理的な比喩を挿入",
      "淡々としたトーン",
    ],
    dontList: [
      "過度な感嘆表現",
      "「やれやれ」の多用",
      "直接的な説明",
    ],
    fewShots: [
      "経済指標が発表された。僕はコーヒーを飲みながら、数字が踊るのを眺めていた。",
    ],
  },
  suggestive_safe: {
    key: "suggestive_safe",
    name: "意味深セーフ大人風",
    description: "直接的な表現を避け、比喩と間で匂わせるR-15相当の文体",
    rules: "直接描写を避け、比喩と間で匂わせる。R-15相当に留める。",
    doList: [
      "比喩で表現",
      "間を活用",
      "暗示的な表現",
    ],
    dontList: [
      "明示的な性描写",
      "未成年に関する表現",
      "暴力的な描写",
    ],
    fewShots: [
      "市場は熱を帯び、誰もが息を潜めて次の動きを待っていた。",
    ],
  },
  ojisan_mail: {
    key: "ojisan_mail",
    name: "おじさん構文風",
    description: "絵文字と改行を多用し、時候の挨拶がズレた独特の文体",
    rules: "絵文字・改行・「？」を多用。時候の挨拶がズレる。不要な署名を入れる。",
    doList: [
      "絵文字を多用（😊、💦、✨など）",
      "改行を頻繁に入れる",
      "「？」を多用",
      "時候の挨拶を入れる",
    ],
    dontList: [
      "ハラスメント的表現",
      "実在個人への言及",
    ],
    fewShots: [
      "こんにちは😊\n今日はいい天気ですね✨\n失業率が上がったみたいですね💦\n大変ですね？？",
    ],
  },
  poetic_emo: {
    key: "poetic_emo",
    name: "詩的エモ風",
    description: "A-B-A'の反復構造と自然物の擬人化を用いた詩的な文体",
    rules: "A-B-A'の反復構造、アナフォラ（同じ語句の繰り返し）、自然物の擬人化を使用。",
    doList: [
      "反復構造（A-B-A'）",
      "アナフォラ",
      "自然物の擬人化",
      "リズム感のある表現",
    ],
    dontList: [
      "陳腐な比喩",
      "過度に感傷的な表現",
    ],
    fewShots: [
      "風が吹く。数字が舞う。風が、また吹く。",
    ],
  },
  aphorism: {
    key: "aphorism",
    name: "名言ボット風",
    description: "3文以内で逆説や対比を用いた格言風の文体",
    rules: "3文以内で逆説・対比・転換句「だからこそ」を使用。",
    doList: [
      "3文以内に収める",
      "逆説や対比を使う",
      "転換句「だからこそ」",
    ],
    dontList: [
      "長文",
      "説明的な表現",
    ],
    fewShots: [
      "失業率は上がる。だが、希望は消えない。だからこそ、前を向く。",
    ],
  },
  cryptic_code: {
    key: "cryptic_code",
    name: "謎の暗号風",
    description: "擬似コードや暗号タグを用いた謎めいた文体",
    rules: "擬似コード、暗号タグ、[KEY]=値 の記法を使用。",
    doList: [
      "擬似コード風の表現",
      "[KEY]=値 の記法",
      "暗号的な表現",
    ],
    dontList: [
      "直接的な説明",
      "平易な表現",
    ],
    fewShots: [
      "[UNEMPLOYMENT_RATE]=↑ → [CONSUMER_SPENDING]=↓ → [ECONOMY]=ALERT",
    ],
  },
  philo_lecture: {
    key: "philo_lecture",
    name: "哲学講義風",
    description: "定義から始まり、前提・系・限界条件を論じる講義風の文体",
    rules: "定義→前提→系→限界条件の順で展開。古典への参照（比喩）を含める。",
    doList: [
      "定義から始める",
      "前提を明示",
      "系（結論）を導く",
      "限界条件を示す",
      "古典への参照",
    ],
    dontList: [
      "感情的な表現",
      "断定的すぎる言い方",
    ],
    fewShots: [
      "失業とは何か。それは労働の不在である。前提として、労働は価値を生む。",
    ],
  },
  debate_politico: {
    key: "debate_politico",
    name: "論戦系政治家風",
    description: "事実と論点を分離し、定量的に打ち手とリスクを論じる文体",
    rules: "事実→論点分離→定量→打ち手/リスク。短文で断定。",
    doList: [
      "事実を先に述べる",
      "論点を明確に分離",
      "定量的なデータを示す",
      "打ち手とリスクを提示",
      "短文で断定",
    ],
    dontList: [
      "曖昧な表現",
      "感情論",
    ],
    fewShots: [
      "失業率5.2%。前月比+0.3pt。対策は雇用創出。リスクは財政悪化。",
    ],
  },
  speech_poem: {
    key: "speech_poem",
    name: "演説ポエム風",
    description: "同語反復と日常比喩を用い、「前に進むために」で締める演説風の文体",
    rules: "同語反復、日常比喩、断定。結語に「前に進むために」。",
    doList: [
      "同語反復（トートロジー）",
      "日常的な比喩",
      "断定的な表現",
      "結語に「前に進むために」",
    ],
    dontList: [
      "複雑な論理",
      "専門用語の多用",
    ],
    fewShots: [
      "失業は失業である。しかし、私たちは立ち上がる。前に進むために。",
    ],
  },
};

export const SKIN_KEYS = Object.keys(SKINS);
