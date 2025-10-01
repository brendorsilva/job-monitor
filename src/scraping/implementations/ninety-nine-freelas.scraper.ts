// src/scraping/implementations/ninety-nine-freelas.scraper.ts

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Job, ScraperStrategy } from '../scraper.strategy';

@Injectable()
export class NinetyNineFreelasScraper implements ScraperStrategy {
  private readonly BASE_URL = 'https://www.99freelas.com.br/projects';
  private readonly logger = new Logger(NinetyNineFreelasScraper.name);

  async scrape(keywords: string): Promise<Job[]> {
    this.logger.log(`[99Freelas] Buscando por: "${keywords}"`);
    const jobs: Job[] = [];
    try {
      const url = `${this.BASE_URL}?q=${encodeURIComponent(keywords)}&state=open`;
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        },
      });
      const $ = cheerio.load(data);

      $('ul.result-list > li.result-item').each((index, element) => {
        // --- AJUSTE FINAL E PRECISO BASEADO NO SEU HTML ---
        // O seletor anterior ('div.result-title h1 a') estava incorreto.
        // O caminho correto é através da tag <hgroup>.
        const titleElement = $(element).find('hgroup > h1.title > a');

        // --- AJUSTE FINAL NA DESCRIÇÃO ---
        // O seletor anterior ('div.description p') não era garantido.
        // O seletor correto pega o texto da div principal da descrição.
        const description = $(element)
          .find('div.item-text.description')
          .text()
          .trim();

        const title = titleElement.text().trim();
        const relativeUrl = titleElement.attr('href');

        // A verificação de URL e título garante que não peguemos "lixo"
        if (title && relativeUrl) {
          const url = relativeUrl.startsWith('http')
            ? relativeUrl
            : `https://www.99freelas.com.br${relativeUrl}`;

          jobs.push({
            title,
            url,
            description: description.substring(0, 250) + '...',
            source: '99Freelas',
          });
        }
      });

      if (jobs.length === 0) {
        this.logger.warn(
          `[99Freelas] Nenhum projeto encontrado para "${keywords}". Verifique o HTML do site.`,
        );
      } else {
        this.logger.log(
          `[99Freelas] Encontrados ${jobs.length} projetos para "${keywords}".`,
        );
      }
      return jobs;
    } catch (error) {
      this.logger.error(
        `[99Freelas] Erro ao raspar a página para "${keywords}":`,
        error.stack,
      );
      return [];
    }
  }
}
