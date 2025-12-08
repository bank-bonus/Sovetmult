import bridge from '@vkontakte/vk-bridge';

export const vkService = {
  // Инициализация (обычно делается в index.tsx, но можно проверить и тут)
  init: () => {
    bridge.send("VKWebAppInit");
  },

  // Показ полноэкранной рекламы (между уровнями)
  showInterstitial: async (): Promise<boolean> => {
    try {
      const data = await bridge.send("VKWebAppShowNativeAds", { ad_format: "interstitial" });
      return data.result;
    } catch (error) {
      console.warn("Interstitial ad failed or skipped", error);
      return false;
    }
  },

  // Показ рекламы за вознаграждение (возрождение)
  showRewarded: async (): Promise<boolean> => {
    try {
      const data = await bridge.send("VKWebAppShowNativeAds", { ad_format: "reward" });
      return data.result;
    } catch (error) {
      console.warn("Rewarded ad failed", error);
      return false;
    }
  },

  // Вибрация (Taptic Engine) при ошибке или успехе
  taptic: (type: 'success' | 'warning' | 'error') => {
    if (bridge.isWebView()) {
      bridge.send("VKWebAppTapticNotificationOccurred", { type });
    }
  },

  // Поделиться на стене
  shareWall: (score: number) => {
    bridge.send("VKWebAppShowWallPostBox", {
      message: `Я угадал ${score} советских мультфильмов! Сможешь побить мой рекорд? #СоюзМультКвиз`,
      // attachments: "photo123_456" // Сюда можно добавить ссылку на промо-картинку игры
    });
  }
};
