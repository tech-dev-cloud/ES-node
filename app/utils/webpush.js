const webPush = require('web-push');
const vapidKey = {
  publicKey:
    'BJKC9gBPnVd2XDhGUjpfA7jZQd7KIIAOxaYlTX-55mAPmd84ltRksKixs5dR93P6HoK1mZFaL-mTqGuzllUtxzA',
  privateKey: 'imiKLUB1ko0HT4Nr0qeZwom9jLpGOxw2Sxr9q3jUY9Y',
};

class WebPush {
  constructor() {}

  static publishMessage(sub) {
    webPush.setVapidDetails(
      'mailto:theeduseeker@gmail.com',
      vapidKey.publicKey,
      vapidKey.privateKey
    );

    const payload = {
      notification: {
        actions: [
          {
            action: 'view',
            icon: '',
            placeholder: null,
            title: 'View Offer',
            type: 'button',
          },
        ],
        badge: '',
        body: '20% off on all products!',
        data: {
          dateOfArrival: 1609833449680,
        },
        dir: 'auto',
        icon: 'http://localhost:8080/assets/img/logo.png',
        image: '',
        lang: '',
        renotify: false,
        requireInteraction: true,
        silent: false,
        tag: '',
        timestamp: 1609833556106,
        title: 'New Offer on Beauty Products',
        vibrate: [100, 50, 100],
      },
    };

    webPush
      .sendNotification(sub, JSON.stringify(payload))
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = WebPush;
