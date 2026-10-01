import {HttpException,Injectable,InternalServerErrorException,} from '@nestjs/common';
import {KycDocumentsDto,KycUploadDto,} from '../dto/kyc.dto';
import { KycRepository } from '../repositories/kyc.repository';
import { Request } from 'express';
/**
 * Response structure returned by
 * dbo.USP_User_Registration_KYC_GET.
 */
export interface KycProcedureResponse {
  statusCode: number;
  status: string;
  message: string;
  data: unknown[];
}
/**
 * Response structure returned by
 * dbo.USP_User_KYC_Upload.
 */
export interface KycUploadProcedureResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    documentName: string;
    version: number;
    actionPerformed: string;
  } | null;
}
@Injectable()
export class KycService {
  constructor(
    private readonly kycRepository: KycRepository,
  ) {}
  /**
   * Fetch KYC documents applicable to the user.
   */
  async getKycDocuments(
  userToken: string,
) {
  try {
    const result =
      await this.kycRepository.getKycDocuments(
        userToken,
      );

    if (!result) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        status: 'error',
        message:
          'An unexpected error occurred while fetching KYC documents.',
        data: null,
      });
    }

    let response;

    try {
      response = JSON.parse(result);
    } catch {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        status: 'error',
        message:
          'Invalid response received from KYC document procedure.',
        data: null,
      });
    }

    if (
      !response ||
      typeof response.statusCode !== 'number'
    ) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        status: 'error',
        message:
          'Invalid KYC document response.',
        data: null,
      });
    }

    // 200 is successful, including data: [].
    if (response.statusCode === 200) {
      return response;
    }

    // Preserve the status code returned by the SP.
    throw new HttpException(
      response,
      response.statusCode,
    );
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException({
      success: false,
      statusCode: 500,
      status: 'error',
      message:
        'An unexpected error occurred while fetching KYC documents.',
      data: null,
    });
  }
}
  /**
   * Upload  a KYC document.
   * The stored procedure determines whether the operation
   * is an insert or re-upload and manages the document version.
   */
  async uploadKycDocument(
  dto: KycUploadDto,
  req: Request,
) {
  try {
  const ipAddress = req.ip || '';
  const userAgent =
    req.headers['user-agent']?.toString() || '';
  const result =
    await this.kycRepository.uploadKycDocument(
      dto.user_id,
      dto.doc_id,
      dto.doc_url,
      ipAddress,
      userAgent,
    );
  if (!result) {
    throw new InternalServerErrorException({
      success: false,
      statusCode: 500,
      message:
        'An unexpected error occurred while uploading the KYC document.',
      data: null,
    });
  }
    let response;
    try {
      response = JSON.parse(result);
    } catch {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        message:
          'Invalid response received from KYC upload procedure.',
        data: null,
      });
    }
    if (
      !response ||
      typeof response.statusCode !== 'number'
    ) {
      throw new InternalServerErrorException({
        success: false,
        statusCode: 500,
        message:
          'Invalid KYC upload response.',
        data: null,
      });
    }
    // 200 = existing document re-uploaded successfully.
    // 201 = new document uploaded successfully.
    if (
      response.statusCode === 200 ||
      response.statusCode === 201
    ) {
      return response;
    }
    // Preserve validation/business errors returned by the SP.
    throw new HttpException(
      response,
      response.statusCode,
    );
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new InternalServerErrorException({
      success: false,
      statusCode: 500,
      message:
        'An unexpected error occurred while uploading the KYC document.',
      data: null,
    });
  }
}
}