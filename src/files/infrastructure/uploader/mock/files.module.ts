import {
  HttpStatus,
  Module,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FilesMockController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import * as fs from 'fs';
import * as path from 'path';

import { FilesMockService } from './files.service';
import { RelationalFilePersistenceModule } from '../../persistence/relational/relational-persistence.module';

const infrastructurePersistenceModule = RelationalFilePersistenceModule;

@Module({
  imports: [
    infrastructurePersistenceModule,
    MulterModule.register({
      fileFilter: (request, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return callback(
            new UnprocessableEntityException({
              status: HttpStatus.UNPROCESSABLE_ENTITY,
              errors: {
                file: `cantUploadFileType`,
              },
            }),
            false,
          );
        }

        callback(null, true);
      },
      storage: diskStorage({
        destination: (request, file, callback) => {
          // Diretório temporário que será limpo após o processamento
          const tmpDir = '/tmp/mock-uploads';
          if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
          }
          callback(null, tmpDir);
        },
        filename: (request, file, callback) => {
          callback(
            null,
            `${randomStringGenerator()}.${file.originalname
              .split('.')
              .pop()
              ?.toLowerCase()}`,
          );
        },
      }),
      limits: {
        fileSize: 5242880, // 5mb
      },
    }),
  ],
  controllers: [FilesMockController],
  providers: [FilesMockService],
  exports: [FilesMockService],
})
export class FilesMockModule {}
