import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './database/config/database.config';
import authConfig from './auth/config/auth.config';
import appConfig from './config/app.config';
import mailConfig from './mail/config/mail.config';
import whatsappConfig from './whatsapp/config/whatsapp.config';
import fileConfig from './files/config/file.config';
import googleConfig from './auth-google/config/google.config';
import githubConfig from './auth-github/config/github.config';
import path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGoogleModule } from './auth-google/auth-google.module';
import { AuthGitHubModule } from './auth-github/auth-github.module';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { MailModule } from './mail/mail.module';
import { HomeModule } from './home/home.module';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AllConfigType } from './config/config.type';
import { SessionModule } from './session/session.module';
import { MailerModule } from './mailer/mailer.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

const infrastructureDatabaseModule = TypeOrmModule.forRootAsync({
  useClass: TypeOrmConfigService,
  dataSourceFactory: async (options: DataSourceOptions) => {
    return new DataSource(options).initialize();
  },
});

import { GamificationProfilesModule } from './gamification-profiles/gamification-profiles.module';

import { ActivitiesModule } from './activities/activities.module';

import { SubmissionsModule } from './submissions/submissions.module';

import { TransactionsModule } from './transactions/transactions.module';
import { BadgesModule } from './badges/badges.module';
import { AdminModule } from './admin/admin.module';
import { MissionsModule } from './missions/missions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ContributionReportsModule } from './contribution-reports/contribution-reports.module';

import { EventsModule } from './events/events.module';

import { LearningTracksModule } from './learning-tracks/learning-tracks.module';

import { TrackSectionsModule } from './track-sections/track-sections.module';

import { TrackItemsModule } from './track-items/track-items.module';

import { CoursesModule } from './courses/courses.module';

import { CourseReviewsModule } from './course-reviews/course-reviews.module';

import { TrackEnrollmentsModule } from './track-enrollments/track-enrollments.module';

import { TrackItemCompletionsModule } from './track-item-completions/track-item-completions.module';

import { ProfilePortfolioModule } from './profile-portfolio/profile-portfolio.module';

import { LegalDocumentsModule } from './legal-documents/legal-documents.module';

import { TrackSuggestionsModule } from './track-suggestions/track-suggestions.module';
import { RankingSnapshotsModule } from './ranking-snapshots/ranking-snapshots.module';

@Module({
  imports: [
    RankingSnapshotsModule,
    TrackSuggestionsModule,
    LegalDocumentsModule,
    TrackItemCompletionsModule,
    ProfilePortfolioModule,
    TrackEnrollmentsModule,
    CourseReviewsModule,
    CoursesModule,
    TrackItemsModule,
    TrackSectionsModule,
    LearningTracksModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: Number(process.env.THROTTLE_SHORT_LIMIT) || 10,
      },
      {
        name: 'medium',
        ttl: 60_000,
        limit: Number(process.env.THROTTLE_MEDIUM_LIMIT) || 100,
      },
    ]),
    AdminModule,
    BadgesModule,
    MissionsModule,
    NotificationsModule,
    ContributionReportsModule,
    TransactionsModule,
    SubmissionsModule,
    ActivitiesModule,
    GamificationProfilesModule,
    EventsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        fileConfig,
        googleConfig,
        githubConfig,
        whatsappConfig,
      ],
      envFilePath: ['.env'],
    }),
    infrastructureDatabaseModule,
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    UsersModule,
    FilesModule,
    AuthModule,
    AuthGoogleModule,
    AuthGitHubModule,
    SessionModule,
    MailModule,
    MailerModule,
    WhatsappModule,
    HomeModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
