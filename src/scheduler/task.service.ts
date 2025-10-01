import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DiscordService } from 'src/notifications/discord.service';
import { NinetyNineFreelasScraper } from 'src/scraping/implementations/ninety-nine-freelas.scraper';
import { Job } from 'src/scraping/scraper.strategy';

@Injectable()
export class TaskService {
  private readonly notifiedJobsUrls = new Set<string>();
  private readonly keywords = ['Node.js', 'NestJS', 'Backend', 'TypeScript'];

  constructor(
    private readonly ninetyNineFreelasScraper: NinetyNineFreelasScraper,
    private readonly discordService: DiscordService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES) // Roda a cada 10 minutos
  async handleCron() {
    console.log('--- Iniciando busca por novas vagas ---');

    for (const keyword of this.keywords) {
      const jobs = await this.ninetyNineFreelasScraper.scrape(keyword);

      for (const job of jobs) {
        if (!this.notifiedJobsUrls.has(job.url)) {
          await this.discordService.sendNotification(job);
          this.notifiedJobsUrls.add(job.url);
        }
      }
    }

    console.log('--- Busca finalizada ---');
  }
}
