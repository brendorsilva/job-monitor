import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskService } from './scheduler/task.service';
import { DiscordService } from './notifications/discord.service';
import { NinetyNineFreelasScraper } from './scraping/implementations/ninety-nine-freelas.scraper';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ScheduleModule.forRoot()],
  controllers: [],
  providers: [TaskService, DiscordService, NinetyNineFreelasScraper],
})
export class AppModule {}
