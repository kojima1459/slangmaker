import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 翻訳リソース
const resources = {
  ja: {
    translation: {
      // ヘッダー
      appTitle: '言い換えメーカー',
      appSubtitle: '言葉を着せ替え、表現を楽しむ\n同じ内容、違う世界。文体マジック',
      login: 'ログイン',
      
      // ホームページ
      transformArticle: 'テキストを変換',
      pasteArticle: 'テキストを貼り付けて、お好みのスキン（文体）で読み直しましょう',
      articleText: 'テキスト',
      articlePlaceholder: '変換したいテキストをここに貼り付けてください...',
      characterCount: '{{count}} / 10000文字',
      characterWarning: '変換したいテキストをコピー&ペーストしてください',
      characterLimit: '文字数が上限（10000文字）を超えています',
      geminiApiKey: 'Gemini API Key',
      geminiApiKeyPlaceholder: 'AIza...',
      geminiApiKeyNote: 'APIキーはローカルに保存され、サーバーには送信されません',
      skinStyle: 'スキン（文体）',
      transform: '変換する',
      transforming: '変換中...',
      advancedSettings: '詳細設定',
      temperature: '温度 (Temperature)',
      temperatureDesc: '値が高いほどランダムな変換になります',
      maxOutputTokens: '最大出力トークン数',
      maxOutputTokensDesc: '変換後の文章の最大長さを指定します',
      articleTextRequired: 'テキストを入力してください',
      apiKeyRequired: 'Gemini APIキーを入力してください',
      settings: '設定',
      recommended5000: '推奨: 5000文字以内',
      limitExceeded: '上限超過',
      loginRequired: 'ログインが必要です',
      loginToSaveSettings: '設定を保存するにはログインしてください',
      settingsSaved: '設定を保存しました',
      settingsSaveFailed: '設定の保存に失敗しました',
      back: '戻る',
      manageSettings: 'アプリの設定を管理',
      basicSettings: '基本設定',
      basicSettingsDesc: 'デフォルトのスキンやAPIキーを設定できます',
      apiKeyEncrypted: 'APIキーはローカルに暗号化して保存されます',
      defaultSkin: 'デフォルトスキン',
      saving: '保存中...',
      saveSettings: '設定を保存',
      
      // スキン名
      'skin.kansai_banter': '関西ノリ風',
      'skin.ojisan_mail': 'おじさん構文風',
      'skin.poetic_emo': '詩的エモ風',
      'skin.detached_lit': 'デタッチ文学風',
      'skin.suggestive_safe': '意味深セーフ大人風',
      'skin.gen_z_slang': '若者言葉風（Z世代）',
      'skin.rap_style': 'ラップ風',
      'skin.academic_paper': '学術論文風',
      'skin.gyaru_slang': 'ギャル語風',
      'skin.keigo_excessive': '敬語過剰風',
      'skin.cryptic_code': 'エンジニア風',
      'skin.philo_lecture': 'ロジカル政治家風',
      'skin.aphorism': '哲学名言風',
      'skin.speech_poem': '熱血演説風',
      'skin.debate_politico': '定量分析政治家風',
      
      // 説明ページ
      learnJapaneseSlang: '言い回しを楽しもう！',
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
      
      // Error messages
      errorTimeout: '変換がタイムアウトしました。もう一度お試しください。',
      errorRateLimit: '一日の変換回数上限（100回）に達しました。明日またお試しください。',
      errorGeneric: '変換に失敗しました。もう一度お試しください。',
      retryButton: 'もう一度試す',
      
      // Rate limit status
      rateLimitStatus: '今日の残り変換回数',
      rateLimitRemaining: '{{remaining}}/{{limit}}回',
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
      advancedSettings: 'Advanced Settings',
      temperature: 'Temperature',
      temperatureDesc: 'Higher values make the transformation more random',
      maxOutputTokens: 'Max Output Tokens',
      maxOutputTokensDesc: 'Specify the maximum length of the transformed text',
      articleTextRequired: 'Please enter article text',
      apiKeyRequired: 'Please enter Gemini API key',
      settings: 'Settings',
      recommended5000: 'Recommended: Under 5000 characters',
      limitExceeded: 'Limit exceeded',
      loginRequired: 'Login Required',
      loginToSaveSettings: 'Please login to save settings',
      settingsSaved: 'Settings saved',
      settingsSaveFailed: 'Failed to save settings',
      back: 'Back',
      manageSettings: 'Manage app settings',
      basicSettings: 'Basic Settings',
      basicSettingsDesc: 'Configure default skin and API key',
      apiKeyEncrypted: 'API key is encrypted and stored locally',
      defaultSkin: 'Default Skin',
      saving: 'Saving...',
      saveSettings: 'Save Settings',
      
      // Skin names
      'skin.kansai_banter': 'Kansai Dialect',
      'skin.ojisan_mail': 'Middle-aged Man Style',
      'skin.poetic_emo': 'Poetic Emo',
      'skin.detached_lit': 'Detached Literary',
      'skin.suggestive_safe': 'Suggestive Adult',
      'skin.gen_z_slang': 'Gen Z Slang',
      'skin.rap_style': 'Rap Style',
      'skin.academic_paper': 'Academic Paper',
      'skin.gyaru_slang': 'Gyaru Slang',
      'skin.keigo_excessive': 'Excessive Keigo',
      
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
      
      // Error messages
      errorTimeout: 'Transformation timed out. Please try again.',
      errorRateLimit: 'Daily transformation limit (100 times) reached. Please try again tomorrow.',
      errorGeneric: 'Transformation failed. Please try again.',
      retryButton: 'Try Again',
      
      // Rate limit status
      rateLimitStatus: 'Remaining transformations today',
      rateLimitRemaining: '{{remaining}}/{{limit}} times',
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
      advancedSettings: '详细设置',
      temperature: '温度 (Temperature)',
      temperatureDesc: '值越高，转换越随机',
      maxOutputTokens: '最大输出令牌数',
      maxOutputTokensDesc: '指定转换后文本的最大长度',
      articleTextRequired: '请输入文章文本',
      apiKeyRequired: '请输入Gemini API密钥',
      settings: '设置',
      recommended5000: '推荐：5000字符以内',
      limitExceeded: '超过限制',
      loginRequired: '需要登录',
      loginToSaveSettings: '请登录以保存设置',
      settingsSaved: '设置已保存',
      settingsSaveFailed: '保存设置失败',
      back: '返回',
      manageSettings: '管理应用设置',
      basicSettings: '基本设置',
      basicSettingsDesc: '配置默认风格和API密钥',
      apiKeyEncrypted: 'API密钥加密存储在本地',
      defaultSkin: '默认风格',
      saving: '保存中...',
      saveSettings: '保存设置',
      
      // 皮肤名称
      'skin.kansai_banter': '关西方言风',
      'skin.ojisan_mail': '大叔邮件风',
      'skin.poetic_emo': '诗意情感风',
      'skin.detached_lit': '疏离文学风',
      'skin.suggestive_safe': '暗示成人风',
      'skin.gen_z_slang': 'Z世代俚语风',
      'skin.rap_style': '说唱风',
      'skin.academic_paper': '学術论文风',
      'skin.gyaru_slang': '辣妹语风',
      'skin.keigo_excessive': '过度敬语风',
      
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
      
      // Error messages
      errorTimeout: '转换超时。请重试。',
      errorRateLimit: '已达到每日转换次数上限（100次）。请明天再试。',
      errorGeneric: '转换失败。请重试。',
      retryButton: '重试',
      
      // Rate limit status
      rateLimitStatus: '今天剩余转换次数',
      rateLimitRemaining: '{{remaining}}/{{limit}}次',
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
