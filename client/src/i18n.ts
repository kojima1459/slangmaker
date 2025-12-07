import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 翻訳リソース
const resources = {
  ja: {
    translation: {
      // ヘッダー
      appTitle: '言い換えメーカー',
      appSubtitle: 'ニュースをスキンで読む - 記事を様々な文体で楽しむ',
      login: 'ログイン',
      
      // ホームページ
      transformArticle: '記事を変換',
      pasteArticle: '記事本文を貼り付けて、お好みのスキン（文体）で読み直しましょう',
      articleText: '記事本文',
      articlePlaceholder: '記事の本文をここに貼り付けてください...',
      characterCount: '{{count}} / 10000文字',
      characterWarning: '変換したい記事の本文をコピー&ペーストしてください',
      characterLimit: '文字数が上限（10000文字）を超えています',
      geminiApiKey: 'Gemini API Key',
      geminiApiKeyPlaceholder: 'AIza...',
      geminiApiKeyNote: 'APIキーはローカルに保存され、サーバーには送信されません',
      skinStyle: 'スキン（文体）',
      transform: '変換する',
      transforming: '変換中...',
      
      // スキン名と説明
      'skins.kansai_banter.name': '関西ノリ風',
      'skins.kansai_banter.description': 'ツッコミと誇張表現を交えた爆笑関西弁風の文体',
      'skins.detached_lit.name': 'デタッチ文学風',
      'skins.detached_lit.description': '淡々とした一人称視点で、シュールな比喩を交えた文学的な文体',
      'skins.suggestive_safe.name': '意味深セーフ大人風',
      'skins.suggestive_safe.description': '二重の意味を含ませつつギリギリセーフな大人の文体',
      'skins.ojisan_mail.name': 'おじさん構文風',
      'skins.ojisan_mail.description': '絵文字と改行を多用し、時候の挨拶がズレた痛々しい文体',
      'skins.poetic_emo.name': '詩的エモ風',
      "skins.poetic_emo.description": "A-B-A'の反復構造とシュールな擬人化を用いた過剰なポエム文体",
      'skins.aphorism.name': '名言ボット風',
      'skins.aphorism.description': '3文以内で逆説や対比を用いた格言風の文体',
      'skins.cryptic_code.name': '謎の暗号風',
      'skins.cryptic_code.description': '擬似コードや暗号タグを用いた謎めいた文体',
      'skins.philo_lecture.name': '哲学講義風',
      'skins.philo_lecture.description': '定義から始まり、前提・系・限界条件を論じる講義風の文体',
      'skins.debate_politico.name': '論戦系政治家風',
      'skins.debate_politico.description': '事実と論点を分離し、定量的に打ち手とリスクを論じる文体',
      'skins.speech_poem.name': '演説ポエム風',
      'skins.speech_poem.description': '同語反復と日常比喩を用い、「前に進むために」で締める演説風の文体',
      'skins.gen_z_slang.name': '若者言葉風（Z世代）',
      'skins.gen_z_slang.description': '「マジ」「ヤバい」「エモい」を多用した若者言葉の文体',
      'skins.rap_style.name': 'ラップ風',
      'skins.rap_style.description': '韻を踏んでリズム感のあるラップ風の文体',
      'skins.academic_paper.name': '学術論文風',
      'skins.academic_paper.description': '「〜である」調で引用や考察を含む学術的な文体',
      
      // 説明ページ
      learnJapaneseSlang: '日本語のスラングや言い回しを学ぼう',
      multipleStyles: '複数の表現を提案',
      multipleStylesDesc: 'シーンやニュアンスごとのちょうどいい表現を提案してくれます',
      funLearning: '楽しく学べる',
      funLearningDesc: '同じニュースを様々な文体で読むことで、日本語の表現力を楽しく学べます',
      realExamples: '実際の例文',
      realExamplesDesc: '実際のニュース記事を使って、自然な日本語表現を学べます',
      
      // フッター
      history: '履歴',
      guide: '使い方',
      share: '共有',
      
      // チュートリアル
      'tutorial.step1.title': '記事を貼り付け',
      'tutorial.step1.description': 'ニュース記事の本文をコピーして、テキストエリアに貼り付けます',
      'tutorial.step2.title': 'スキンを選択',
      'tutorial.step2.description': 'お好みのスキン（文体）を選択します。関西ノリ風、おじさん構文風など13種類から選べます',
      'tutorial.step3.title': 'APIキーを入力',
      'tutorial.step3.description': 'Gemini APIキーを入力します。APIキーはローカルに保存され、サーバーには送信されません',
      'tutorial.step4.title': '変換ボタンをクリック',
      'tutorial.step4.description': '「変換する」ボタンをクリックすると、AIが記事を選択したスキンで書き直します',
      'tutorial.step5.title': '結果を楽しむ',
      'tutorial.step5.description': '変換された記事を読んで、TwitterやLINEで共有できます',
      'tutorial.prev': '前へ',
      'tutorial.next': '次へ',
      'tutorial.start': '始める',
      'tutorial.skip': 'スキップ',
    },
  },
  en: {
    translation: {
      // Header
      appTitle: 'Paraphrase Maker',
      appSubtitle: 'Read news in different styles - Enjoy articles in various writing styles',
      login: 'Login',
      
      // Home page
      transformArticle: 'Transform Article',
      pasteArticle: 'Paste article text and read it in your favorite style',
      articleText: 'Article Text',
      articlePlaceholder: 'Paste the article text here...',
      characterCount: '{{count}} / 10000 characters',
      characterWarning: 'Please copy & paste the article text you want to transform',
      characterLimit: 'Character count exceeds the limit (10000 characters)',
      geminiApiKey: 'Gemini API Key',
      geminiApiKeyPlaceholder: 'AIza...',
      geminiApiKeyNote: 'API key is stored locally and not sent to the server',
      skinStyle: 'Style (Skin)',
      transform: 'Transform',
      transforming: 'Transforming...',
      
      // Skin names and descriptions
      'skins.kansai_banter.name': 'Kansai Dialect',
      'skins.kansai_banter.description': 'Explosive Kansai dialect with tsukkomi and exaggeration',
      'skins.detached_lit.name': 'Detached Literary',
      'skins.detached_lit.description': 'Literary style with first-person perspective and surreal metaphors',
      'skins.suggestive_safe.name': 'Suggestive Adult',
      'skins.suggestive_safe.description': 'Adult style with double meanings that stays just safe',
      'skins.ojisan_mail.name': 'Middle-aged Man Style',
      'skins.ojisan_mail.description': 'Painful style with excessive emojis and mismatched greetings',
      'skins.poetic_emo.name': 'Poetic Emo',
      "skins.poetic_emo.description": "Excessive poem style with A-B-A' repetition and surreal personification",
      'skins.aphorism.name': 'Aphorism Bot',
      'skins.aphorism.description': 'Aphoristic style with paradox and contrast in 3 sentences',
      'skins.cryptic_code.name': 'Cryptic Code',
      'skins.cryptic_code.description': 'Mysterious style with pseudo-code and cipher tags',
      'skins.philo_lecture.name': 'Philosophy Lecture',
      'skins.philo_lecture.description': 'Lecture style discussing definitions, premises, corollaries, and limits',
      'skins.debate_politico.name': 'Debate Politician',
      'skins.debate_politico.description': 'Style separating facts and arguments with quantitative analysis',
      'skins.speech_poem.name': 'Speech Poem',
      'skins.speech_poem.description': 'Speech style with tautology and daily metaphors, ending with "to move forward"',
      'skins.gen_z_slang.name': 'Gen Z Slang',
      'skins.gen_z_slang.description': 'Youth slang with frequent use of "really", "crazy", and "emo"',
      'skins.rap_style.name': 'Rap Style',
      'skins.rap_style.description': 'Rap style with rhymes and rhythm',
      'skins.academic_paper.name': 'Academic Paper',
      'skins.academic_paper.description': 'Academic style with "is/are" tone and citations',
      
      // About page
      learnJapaneseSlang: 'Learn Japanese Slang and Expressions',
      multipleStyles: 'Multiple Expression Suggestions',
      multipleStylesDesc: 'Get suggestions for the right expressions for different scenes and nuances',
      funLearning: 'Fun Learning',
      funLearningDesc: 'Learn Japanese expressions in a fun way by reading the same news in various styles',
      realExamples: 'Real Examples',
      realExamplesDesc: 'Learn natural Japanese expressions using actual news articles',
      
      // Footer
      history: 'History',
      guide: 'Guide',
      share: 'Share',
      
      // Tutorial
      'tutorial.step1.title': 'Paste Article',
      'tutorial.step1.description': 'Copy the news article text and paste it into the text area',
      'tutorial.step2.title': 'Select Style',
      'tutorial.step2.description': 'Choose your favorite style (skin). Choose from 13 styles including Kansai Dialect and Middle-aged Man Style',
      'tutorial.step3.title': 'Enter API Key',
      'tutorial.step3.description': 'Enter your Gemini API key. The API key is stored locally and not sent to the server',
      'tutorial.step4.title': 'Click Transform',
      'tutorial.step4.description': 'Click the "Transform" button and AI will rewrite the article in the selected style',
      'tutorial.step5.title': 'Enjoy the Result',
      'tutorial.step5.description': 'Read the transformed article and share it on Twitter or LINE',
      'tutorial.prev': 'Previous',
      'tutorial.next': 'Next',
      'tutorial.start': 'Start',
      'tutorial.skip': 'Skip',
    },
  },
  zh: {
    translation: {
      // 标题
      appTitle: '改写生成器',
      appSubtitle: '用不同风格阅读新闻 - 以各种文体享受文章',
      login: '登录',
      
      // 主页
      transformArticle: '转换文章',
      pasteArticle: '粘贴文章文本，以您喜欢的风格重新阅读',
      articleText: '文章正文',
      articlePlaceholder: '在此粘贴文章正文...',
      characterCount: '{{count}} / 10000字符',
      characterWarning: '请复制并粘贴您想要转换的文章正文',
      characterLimit: '字符数超过限制（10000字符）',
      geminiApiKey: 'Gemini API密钥',
      geminiApiKeyPlaceholder: 'AIza...',
      geminiApiKeyNote: 'API密钥本地保存，不会发送到服务器',
      skinStyle: '风格（皮肤）',
      transform: '转换',
      transforming: '转换中...',
      
      // 皮肤名称和描述
      'skins.kansai_banter.name': '关西方言風',
      'skins.kansai_banter.description': '带有吐槽和夸张表达的爆笑关西方言风格',
      'skins.detached_lit.name': '疏离文学風',
      'skins.detached_lit.description': '淡淡的第一人称视角，带有超现实比喻的文学风格',
      'skins.suggestive_safe.name': '暗示成人風',
      'skins.suggestive_safe.description': '包含双关语但保持安全的成人风格',
      'skins.ojisan_mail.name': '大叔邮件風',
      'skins.ojisan_mail.description': '过度使用表情符号和不合时宜问候的痛苦风格',
      'skins.poetic_emo.name': '诗意情感風',
      "skins.poetic_emo.description": "带有A-B-A'重复结构和超现实拟人化的过度诗意风格",
      'skins.aphorism.name': '名言机器人風',
      'skins.aphorism.description': '在3句话内使用惖论和对比的格言风格',
      'skins.cryptic_code.name': '神秘密码風',
      'skins.cryptic_code.description': '使用伪代码和密码标签的神秘风格',
      'skins.philo_lecture.name': '哲学讲座風',
      'skins.philo_lecture.description': '从定义开始，讨论前提、推论和限制条件的讲座风格',
      'skins.debate_politico.name': '论战政治家風',
      'skins.debate_politico.description': '分离事实和论点，定量分析对策和风险的风格',
      'skins.speech_poem.name': '演讲诗歌風',
      'skins.speech_poem.description': '使用同语反复和日常比喻，以“为了前进”结尾的演讲风格',
      'skins.gen_z_slang.name': 'Z世代俗语風',
      'skins.gen_z_slang.description': '频繁使用“真的”、“疯狂”和“情感”的年轻俗语',
      'skins.rap_style.name': '说唱風',
      'skins.rap_style.description': '带有韵脚和节奏的说唱风格',
      'skins.academic_paper.name': '学术论文風',
      'skins.academic_paper.description': '使用“是/为”语气和引用的学术风格',
      
      // 说明页面
      learnJapaneseSlang: '学习日语俚语和表达方式',
      multipleStyles: '多种表达建议',
      multipleStylesDesc: '根据不同场景和语气提供恰当的表达建议',
      funLearning: '趣味学习',
      funLearningDesc: '通过以各种文体阅读同一新闻，有趣地学习日语表达',
      realExamples: '实际例句',
      realExamplesDesc: '使用实际新闻文章学习自然的日语表达',
      
      // 页脚
      history: '历史',
      guide: '使用指南',
      share: '分享',
      
      // 教程
      'tutorial.step1.title': '粘贴文章',
      'tutorial.step1.description': '复制新闻文章文本并粘贴到文本区域',
      'tutorial.step2.title': '选择风格',
      'tutorial.step2.description': '选择您喜欢的风格（皮肤）。从13种风格中选择，包括关西方言风和大叔邮件风',
      'tutorial.step3.title': '输入API密钥',
      'tutorial.step3.description': '输入您的Gemini API密钥。API密钥本地保存，不会发送到服务器',
      'tutorial.step4.title': '点击转换',
      'tutorial.step4.description': '点击“转换”按钮，AI将以选定的风格重写文章',
      'tutorial.step5.title': '享受结果',
      'tutorial.step5.description': '阅读转换后的文章并在Twitter或LINE上分享',
      'tutorial.prev': '上一步',
      'tutorial.next': '下一步',
      'tutorial.start': '开始',
      'tutorial.skip': '跳过',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ja',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
