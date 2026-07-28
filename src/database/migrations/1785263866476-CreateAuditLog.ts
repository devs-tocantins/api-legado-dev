import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLog1785263866476 implements MigrationInterface {
  name = 'CreateAuditLog1785263866476';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "learning_track" DROP CONSTRAINT "FK_learning_track_requiresTrackId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_suggestion" DROP CONSTRAINT "FK_track_suggestion_reviewedByProfileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_suggestion" DROP CONSTRAINT "FK_track_suggestion_trackId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_suggestion" DROP CONSTRAINT "FK_track_suggestion_profileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_section" DROP CONSTRAINT "FK_track_section_badgeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_section" DROP CONSTRAINT "FK_track_section_trackId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "FK_course_submittedByProfileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP CONSTRAINT "FK_track_item_courseId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP CONSTRAINT "FK_track_item_missionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP CONSTRAINT "FK_track_item_activityId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP CONSTRAINT "FK_track_item_sectionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP CONSTRAINT "FK_track_item_trackId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" DROP CONSTRAINT "FK_submission_trackItemId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" DROP CONSTRAINT "FK_track_item_completion_submissionId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" DROP CONSTRAINT "FK_track_item_completion_profileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" DROP CONSTRAINT "FK_track_item_completion_itemId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_enrollment" DROP CONSTRAINT "FK_track_enrollment_profileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_enrollment" DROP CONSTRAINT "FK_track_enrollment_trackId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_event_coverImageId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_event_reviewerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_event_organizerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_subscription" DROP CONSTRAINT "FK_event_subscription_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_subscription" DROP CONSTRAINT "FK_event_subscription_eventId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_course" DROP CONSTRAINT "FK_track_item_course_profile"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_course" DROP CONSTRAINT "FK_track_item_course_course"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_course" DROP CONSTRAINT "FK_track_item_course_trackItem"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" DROP CONSTRAINT "FK_course_review_profileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" DROP CONSTRAINT "FK_course_review_courseId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_track_suggestion_profileId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_track_suggestion_trackId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_track_suggestion_status"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_track_section_trackId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_track_item_trackId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_track_item_sectionId"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_track_item_completion_profileId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_track_enrollment_profileId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ranking_snapshot_period"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ranking_snapshot_profileId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_event_status_startAt"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_event_subscription_eventId_userId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_course_review_courseId"`);
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" DROP CONSTRAINT "UQ_track_item_completion_itemId_profileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_enrollment" DROP CONSTRAINT "UQ_track_enrollment_trackId_profileId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ranking_snapshot" DROP CONSTRAINT "UQ_ranking_snapshot_profile_period"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_course" DROP CONSTRAINT "UQ_track_item_course_item_course"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" DROP CONSTRAINT "UQ_course_review_courseId_profileId"`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actorUserId" integer, "action" character varying(100) NOT NULL, "entityType" character varying(100) NOT NULL, "entityId" character varying(100) NOT NULL, "targetUserId" integer, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b2a2e69f0abb8e3c1293fea255" ON "audit_log" ("actorUserId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_78e013ffae12f5a1fc1dbefff9" ON "audit_log" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7253c576c9bcaf94fe064341dd" ON "audit_log" ("entityType", "entityId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP COLUMN "auditorReward"`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" DROP COLUMN "requiresActivityDate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission" DROP COLUMN "requiresProof"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission" DROP COLUMN "requiresDescription"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission" DROP COLUMN "participationReward"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission" DROP COLUMN "auditorReward"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" DROP COLUMN "activityDate"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."notification_type_enum" RENAME TO "notification_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_type_enum" AS ENUM('SUBMISSION_APPROVED', 'MISSION_WON', 'SUBMISSION_REJECTED', 'CONTRIBUTION_REPORT_UPHELD', 'CONTRIBUTION_REPORT_RECEIVED', 'TRACK_MILESTONE_APPROVED', 'TRACK_BADGE_GRANTED', 'LEGAL_DOCUMENT_UPDATED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "type" TYPE "public"."notification_type_enum" USING "type"::"text"::"public"."notification_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum_old"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_73a96be178240318095ba761ce" ON "ranking_snapshot" ("profileId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4aa1b69d4dc6a3acecf436e502" ON "ranking_snapshot" ("periodType", "periodKey") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6723669fd40b2dab0b7fc67378" ON "event" ("status", "startAt") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f1324c0c67b3d0a15429460805" ON "event_subscription" ("eventId", "userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" ADD CONSTRAINT "UQ_3317746f13dc0a1e8b1c0208602" UNIQUE ("itemId", "profileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_enrollment" ADD CONSTRAINT "UQ_3af3a9d44a616ebb2b0f67eeec6" UNIQUE ("trackId", "profileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "ranking_snapshot" ADD CONSTRAINT "UQ_6068249314ca9e1cb671ede16fe" UNIQUE ("profileId", "periodType", "periodKey")`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_course" ADD CONSTRAINT "UQ_c27968eed49355984d50c5df4f0" UNIQUE ("trackItemId", "courseId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" ADD CONSTRAINT "UQ_08906e373d745ccd7e3869232ad" UNIQUE ("courseId", "profileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track" ADD CONSTRAINT "FK_3d633df54601ed96f873c15c66a" FOREIGN KEY ("requiresTrackId") REFERENCES "learning_track"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_suggestion" ADD CONSTRAINT "FK_deef1872d5d09171db76550a904" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_suggestion" ADD CONSTRAINT "FK_7f37b4af8bebece25a7ffc20139" FOREIGN KEY ("trackId") REFERENCES "learning_track"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_section" ADD CONSTRAINT "FK_32f398913ff9076afecaa2804e3" FOREIGN KEY ("trackId") REFERENCES "learning_track"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_section" ADD CONSTRAINT "FK_7da97c5023ce106f63088ad35b0" FOREIGN KEY ("badgeId") REFERENCES "badge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_22d2cc542d92a57fcb69d37f3ee" FOREIGN KEY ("submittedByProfileId") REFERENCES "gamification_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD CONSTRAINT "FK_a909468a07c4ce8152a984b9e0e" FOREIGN KEY ("trackId") REFERENCES "learning_track"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD CONSTRAINT "FK_008d52d276e557170d2c814e240" FOREIGN KEY ("sectionId") REFERENCES "track_section"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD CONSTRAINT "FK_4ff076ce51201c3e8213881c487" FOREIGN KEY ("activityId") REFERENCES "activity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD CONSTRAINT "FK_6be2e22a18dc58b9c2fc3e10db6" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD CONSTRAINT "FK_4a1b8513450e55a468eea106562" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD CONSTRAINT "FK_87a523713ea6deb415efb079c85" FOREIGN KEY ("trackItemId") REFERENCES "track_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" ADD CONSTRAINT "FK_650ecb22368552920748eb0734e" FOREIGN KEY ("itemId") REFERENCES "track_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" ADD CONSTRAINT "FK_0bb0f5f8665f0d49e3464c2e2df" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" ADD CONSTRAINT "FK_8c17faa575131f128e767991a9c" FOREIGN KEY ("submissionId") REFERENCES "submission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_enrollment" ADD CONSTRAINT "FK_224598dd9b667a9655d1cf88a2c" FOREIGN KEY ("trackId") REFERENCES "learning_track"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_enrollment" ADD CONSTRAINT "FK_88d288cdb7b4077d1e769f4ef4a" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_19642e6a244b4885e14eab0fdc0" FOREIGN KEY ("organizerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_f3d2a9e03b1d34421313f22381f" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_aba43b83fb503dba44bcb3379d7" FOREIGN KEY ("coverImageId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_subscription" ADD CONSTRAINT "FK_7e789e21480c0a6e229f034532f" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_subscription" ADD CONSTRAINT "FK_2cafb4ca625ae9cbd3fc16407f8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_course" ADD CONSTRAINT "FK_003764aa7804ef2d9ef5d51673a" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_course" ADD CONSTRAINT "FK_90cdf5091ace1eb07dd9aed2e68" FOREIGN KEY ("submittedByProfileId") REFERENCES "gamification_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" ADD CONSTRAINT "FK_9fac4258c1f8b81a63bc5fd46b8" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" ADD CONSTRAINT "FK_4faec4e87ac6a8fbc98cdccf4b8" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_review" DROP CONSTRAINT "FK_4faec4e87ac6a8fbc98cdccf4b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" DROP CONSTRAINT "FK_9fac4258c1f8b81a63bc5fd46b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_course" DROP CONSTRAINT "FK_90cdf5091ace1eb07dd9aed2e68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_course" DROP CONSTRAINT "FK_003764aa7804ef2d9ef5d51673a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_subscription" DROP CONSTRAINT "FK_2cafb4ca625ae9cbd3fc16407f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_subscription" DROP CONSTRAINT "FK_7e789e21480c0a6e229f034532f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_aba43b83fb503dba44bcb3379d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_f3d2a9e03b1d34421313f22381f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_19642e6a244b4885e14eab0fdc0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_enrollment" DROP CONSTRAINT "FK_88d288cdb7b4077d1e769f4ef4a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_enrollment" DROP CONSTRAINT "FK_224598dd9b667a9655d1cf88a2c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" DROP CONSTRAINT "FK_8c17faa575131f128e767991a9c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" DROP CONSTRAINT "FK_0bb0f5f8665f0d49e3464c2e2df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" DROP CONSTRAINT "FK_650ecb22368552920748eb0734e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" DROP CONSTRAINT "FK_87a523713ea6deb415efb079c85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP CONSTRAINT "FK_4a1b8513450e55a468eea106562"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP CONSTRAINT "FK_6be2e22a18dc58b9c2fc3e10db6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP CONSTRAINT "FK_4ff076ce51201c3e8213881c487"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP CONSTRAINT "FK_008d52d276e557170d2c814e240"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" DROP CONSTRAINT "FK_a909468a07c4ce8152a984b9e0e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" DROP CONSTRAINT "FK_22d2cc542d92a57fcb69d37f3ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_section" DROP CONSTRAINT "FK_7da97c5023ce106f63088ad35b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_section" DROP CONSTRAINT "FK_32f398913ff9076afecaa2804e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_suggestion" DROP CONSTRAINT "FK_7f37b4af8bebece25a7ffc20139"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_suggestion" DROP CONSTRAINT "FK_deef1872d5d09171db76550a904"`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track" DROP CONSTRAINT "FK_3d633df54601ed96f873c15c66a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" DROP CONSTRAINT "UQ_08906e373d745ccd7e3869232ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_course" DROP CONSTRAINT "UQ_c27968eed49355984d50c5df4f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ranking_snapshot" DROP CONSTRAINT "UQ_6068249314ca9e1cb671ede16fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_enrollment" DROP CONSTRAINT "UQ_3af3a9d44a616ebb2b0f67eeec6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" DROP CONSTRAINT "UQ_3317746f13dc0a1e8b1c0208602"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f1324c0c67b3d0a15429460805"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6723669fd40b2dab0b7fc67378"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4aa1b69d4dc6a3acecf436e502"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_73a96be178240318095ba761ce"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_type_enum_old" AS ENUM('SUBMISSION_APPROVED', 'MISSION_WON', 'SUBMISSION_REJECTED', 'CONTRIBUTION_REPORT_UPHELD', 'CONTRIBUTION_REPORT_RECEIVED', 'NEW_SUBMISSION_PENDING', 'TRACK_MILESTONE_APPROVED', 'TRACK_BADGE_GRANTED', 'LEGAL_DOCUMENT_UPDATED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ALTER COLUMN "type" TYPE "public"."notification_type_enum_old" USING "type"::"text"::"public"."notification_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."notification_type_enum_old" RENAME TO "notification_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD "activityDate" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission" ADD "auditorReward" integer NOT NULL DEFAULT '20'`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission" ADD "participationReward" integer NOT NULL DEFAULT '50'`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission" ADD "requiresDescription" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "mission" ADD "requiresProof" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "requiresActivityDate" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity" ADD "auditorReward" integer NOT NULL DEFAULT '10'`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7253c576c9bcaf94fe064341dd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_78e013ffae12f5a1fc1dbefff9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b2a2e69f0abb8e3c1293fea255"`,
    );
    await queryRunner.query(`DROP TABLE "audit_log"`);
    await queryRunner.query(
      `ALTER TABLE "course_review" ADD CONSTRAINT "UQ_course_review_courseId_profileId" UNIQUE ("courseId", "profileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_course" ADD CONSTRAINT "UQ_track_item_course_item_course" UNIQUE ("trackItemId", "courseId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "ranking_snapshot" ADD CONSTRAINT "UQ_ranking_snapshot_profile_period" UNIQUE ("profileId", "periodType", "periodKey")`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_enrollment" ADD CONSTRAINT "UQ_track_enrollment_trackId_profileId" UNIQUE ("trackId", "profileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" ADD CONSTRAINT "UQ_track_item_completion_itemId_profileId" UNIQUE ("itemId", "profileId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_course_review_courseId" ON "course_review" ("courseId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_event_subscription_eventId_userId" ON "event_subscription" ("eventId", "userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_event_status_startAt" ON "event" ("startAt", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ranking_snapshot_profileId" ON "ranking_snapshot" ("profileId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ranking_snapshot_period" ON "ranking_snapshot" ("periodKey", "periodType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_enrollment_profileId" ON "track_enrollment" ("profileId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_item_completion_profileId" ON "track_item_completion" ("profileId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_item_sectionId" ON "track_item" ("sectionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_item_trackId" ON "track_item" ("trackId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_section_trackId" ON "track_section" ("trackId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_suggestion_status" ON "track_suggestion" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_suggestion_trackId" ON "track_suggestion" ("trackId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_track_suggestion_profileId" ON "track_suggestion" ("profileId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" ADD CONSTRAINT "FK_course_review_courseId" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_review" ADD CONSTRAINT "FK_course_review_profileId" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_course" ADD CONSTRAINT "FK_track_item_course_trackItem" FOREIGN KEY ("trackItemId") REFERENCES "track_item"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_course" ADD CONSTRAINT "FK_track_item_course_course" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_course" ADD CONSTRAINT "FK_track_item_course_profile" FOREIGN KEY ("submittedByProfileId") REFERENCES "gamification_profile"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_subscription" ADD CONSTRAINT "FK_event_subscription_eventId" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_subscription" ADD CONSTRAINT "FK_event_subscription_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_event_organizerId" FOREIGN KEY ("organizerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_event_reviewerId" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_event_coverImageId" FOREIGN KEY ("coverImageId") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_enrollment" ADD CONSTRAINT "FK_track_enrollment_trackId" FOREIGN KEY ("trackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_enrollment" ADD CONSTRAINT "FK_track_enrollment_profileId" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" ADD CONSTRAINT "FK_track_item_completion_itemId" FOREIGN KEY ("itemId") REFERENCES "track_item"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" ADD CONSTRAINT "FK_track_item_completion_profileId" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item_completion" ADD CONSTRAINT "FK_track_item_completion_submissionId" FOREIGN KEY ("submissionId") REFERENCES "submission"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD CONSTRAINT "FK_submission_trackItemId" FOREIGN KEY ("trackItemId") REFERENCES "track_item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD CONSTRAINT "FK_track_item_trackId" FOREIGN KEY ("trackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD CONSTRAINT "FK_track_item_sectionId" FOREIGN KEY ("sectionId") REFERENCES "track_section"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD CONSTRAINT "FK_track_item_activityId" FOREIGN KEY ("activityId") REFERENCES "activity"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD CONSTRAINT "FK_track_item_missionId" FOREIGN KEY ("missionId") REFERENCES "mission"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_item" ADD CONSTRAINT "FK_track_item_courseId" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_course_submittedByProfileId" FOREIGN KEY ("submittedByProfileId") REFERENCES "gamification_profile"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_section" ADD CONSTRAINT "FK_track_section_trackId" FOREIGN KEY ("trackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_section" ADD CONSTRAINT "FK_track_section_badgeId" FOREIGN KEY ("badgeId") REFERENCES "badge"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_suggestion" ADD CONSTRAINT "FK_track_suggestion_profileId" FOREIGN KEY ("profileId") REFERENCES "gamification_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_suggestion" ADD CONSTRAINT "FK_track_suggestion_trackId" FOREIGN KEY ("trackId") REFERENCES "learning_track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_suggestion" ADD CONSTRAINT "FK_track_suggestion_reviewedByProfileId" FOREIGN KEY ("reviewedByProfileId") REFERENCES "gamification_profile"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "learning_track" ADD CONSTRAINT "FK_learning_track_requiresTrackId" FOREIGN KEY ("requiresTrackId") REFERENCES "learning_track"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
