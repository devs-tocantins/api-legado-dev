import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as fs from 'fs/promises';
import * as nodePath from 'path';

import { FileRepository } from './infrastructure/persistence/file.repository';
import { FileType } from './domain/file';
import { NullableType } from '../utils/types/nullable.type';
import { AllConfigType } from '../config/config.type';
import { FileDriver } from './config/file-config.type';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private s3: S3Client | null = null;

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    const driver = this.configService.get('file.driver', { infer: true });
    if (driver === FileDriver.S3 || driver === FileDriver.S3_PRESIGNED) {
      const endpoint = this.configService.get('file.awsS3Endpoint', {
        infer: true,
      });
      this.s3 = new S3Client({
        region: this.configService.get('file.awsS3Region', { infer: true }),
        credentials: {
          accessKeyId: this.configService.getOrThrow('file.accessKeyId', {
            infer: true,
          }),
          secretAccessKey: this.configService.getOrThrow(
            'file.secretAccessKey',
            { infer: true },
          ),
        },
        ...(endpoint && { endpoint, forcePathStyle: true }),
      });
    }
  }

  create(data: FileType): Promise<FileType> {
    return this.fileRepository.create(data);
  }

  findById(id: FileType['id']): Promise<NullableType<FileType>> {
    return this.fileRepository.findById(id);
  }

  findByIds(ids: FileType['id'][]): Promise<FileType[]> {
    return this.fileRepository.findByIds(ids);
  }

  /**
   * Deletes a file from storage and removes the DB record.
   * storagePath must be the raw S3 key (not a full URL).
   * Failures are logged but never throw — deletion is best-effort.
   */
  async deleteFile(storagePath: string): Promise<void> {
    if (!storagePath) return;

    const driver = this.configService.get('file.driver', { infer: true });

    try {
      if (
        (driver === FileDriver.S3 || driver === FileDriver.S3_PRESIGNED) &&
        this.s3
      ) {
        const bucket = this.configService.getOrThrow(
          'file.awsDefaultS3Bucket',
          { infer: true },
        );
        await this.s3.send(
          new DeleteObjectCommand({ Bucket: bucket, Key: storagePath }),
        );
      } else if (driver === FileDriver.LOCAL) {
        const filename = nodePath.basename(storagePath);
        await fs.unlink(nodePath.join('files', filename));
      }
    } catch (err) {
      this.logger.warn(
        `Could not delete file from storage "${storagePath}": ${err}`,
      );
    }

    try {
      await this.fileRepository.deleteByPath(storagePath);
    } catch (err) {
      this.logger.warn(
        `Could not delete file record for path "${storagePath}": ${err}`,
      );
    }
  }

  /** Extracts the raw S3 key from a full URL or returns the value as-is. */
  extractStoragePath(urlOrKey: string): string {
    if (urlOrKey.startsWith('http://') || urlOrKey.startsWith('https://')) {
      try {
        return new URL(urlOrKey).pathname.replace(/^\//, '');
      } catch {
        return urlOrKey.split('/').pop() ?? urlOrKey;
      }
    }
    return urlOrKey;
  }
}
