import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { GithubRepoTarget } from './domain/github-repo-target.enum';
import { GithubIssueCategory } from './domain/github-issue-category.enum';

const REPO_BY_TARGET: Record<
  GithubRepoTarget,
  { owner: string; repo: string }
> = {
  [GithubRepoTarget.FRONT]: {
    owner: 'devs-tocantins',
    repo: 'front-engajamento',
  },
  [GithubRepoTarget.API]: {
    owner: 'devs-tocantins',
    repo: 'api-engajamento',
  },
};

const LABEL_BY_CATEGORY: Record<GithubIssueCategory, string> = {
  [GithubIssueCategory.BUG]: 'bug',
  [GithubIssueCategory.MELHORIA]: 'melhoria',
  [GithubIssueCategory.DUVIDA]: 'duvida',
  [GithubIssueCategory.OUTRO]: 'outro',
};

export type CreatedGithubIssue = {
  url: string;
  number: number;
};

@Injectable()
export class GithubIssuesService {
  private readonly logger = new Logger(GithubIssuesService.name);

  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  /**
   * Cria a issue de verdade no repositório correspondente. Lança em caso de
   * falha — quem chama decide se isso deve bloquear o fluxo (ver uso em
   * SubmissionsService.review, que trata a falha como best-effort).
   */
  async createIssue({
    repoTarget,
    category,
    title,
    body,
  }: {
    repoTarget: GithubRepoTarget;
    category: GithubIssueCategory;
    title: string;
    body: string;
  }): Promise<CreatedGithubIssue> {
    const token = this.configService.get('github.botToken', { infer: true });
    if (!token) {
      throw new Error('GITHUB_BOT_TOKEN não configurado.');
    }

    const { owner, repo } = REPO_BY_TARGET[repoTarget];
    const label = LABEL_BY_CATEGORY[category];

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ title, body, labels: [label] }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `GitHub API retornou ${response.status} ao criar issue em ${owner}/${repo}: ${errorBody}`,
      );
    }

    const data = (await response.json()) as {
      html_url: string;
      number: number;
    };
    this.logger.log(`Issue criada: ${data.html_url}`);

    return { url: data.html_url, number: data.number };
  }
}
