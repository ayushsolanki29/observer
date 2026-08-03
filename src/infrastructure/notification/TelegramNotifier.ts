import axios from 'axios';
import { Notifier, NotificationPayload } from '../../core/Notifier';
import { NetworkError } from '../../core/errors';
import { env } from '../../config/env';

export class TelegramNotifier implements Notifier {
  private readonly apiUrl: string;

  constructor() {
    this.apiUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  }

  async notify(payload: NotificationPayload): Promise<void> {
    try {
      const { monitor, notices } = payload;
      
      if (notices.length === 0) return;

      const noticesList = notices.map(n => `• ${n.title}`).join('\n');
      
      const message = `🎓 ${monitor.name}\n\n📢 ${notices.length} New Notices\n\n${noticesList}\n\n🔗 ${monitor.website.url}`;
      
      await axios.post(this.apiUrl, {
        chat_id: env.TELEGRAM_CHAT_ID,
        text: message,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new NetworkError(`Failed to send Telegram notification: ${error.message}`);
      }
      throw new NetworkError('Failed to send Telegram notification: Unknown error');
    }
  }
}
