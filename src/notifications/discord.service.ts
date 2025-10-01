import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Job } from 'src/scraping/scraper.strategy';

@Injectable()
export class DiscordService {
  private readonly webhookUrl: string;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('DISCORD_WEBHOOK_URL');
    if (!url) {
      throw new Error('DISCORD_WEBHOOK_URL is not configured!');
    }
    this.webhookUrl = url;
  }

  async sendNotification(job: Job): Promise<void> {
    if (!this.webhookUrl) {
      console.error('URL do Webhook do Discord não configurada!');
      return;
    }

    const embed = {
      title: `Nova Vaga em: ${job.source}`,
      description: `**${job.title}**\n\n${job.description}`,
      url: job.url,
      color: 0x0099ff, // Uma cor azulada
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Job Monitor Bot',
      },
    };

    try {
      await axios.post(this.webhookUrl, { embeds: [embed] });
      console.log(`[Discord] Notificação enviada para: ${job.title}`);
    } catch (error) {
      console.error('[Discord] Erro ao enviar notificação:', error.message);
    }
  }
}
