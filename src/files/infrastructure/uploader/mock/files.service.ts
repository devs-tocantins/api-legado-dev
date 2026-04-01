import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

import { FileRepository } from '../../persistence/file.repository';
import { AllConfigType } from '../../../../config/config.type';
import { FileType } from '../../../domain/file';

@Injectable()
export class FilesMockService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly fileRepository: FileRepository,
  ) {}

  async create(file: Express.Multer.File): Promise<{ file: FileType }> {
    if (!file) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: 'selectFile',
        },
      });
    }

    try {
      // Registra no banco de dados
      const result = {
        file: await this.fileRepository.create({
          path: `/mock/${file.originalname}`,
        }),
      };

      // Deleta o arquivo do disco imediatamente (não armazena em lugar nenhum)
      if (file.path) {
        fs.unlinkSync(file.path);
      }

      return result;
    } catch (error) {
      // Se houver erro, tenta deletar o arquivo de qualquer forma
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }
}
