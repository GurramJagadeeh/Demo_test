import {HttpException,Injectable,InternalServerErrorException,} from '@nestjs/common';
import {KycDocumentsDto,KycUploadDto,} from '../dto/kyc.dto';
import { KycRepository } from '../repositories/kyc.repository';
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
    dto: KycDocumentsDto,
  ): Promise<KycProcedureResponse> {
    try {
      // Execute the KYC GET stored procedure.
      const result =
        await this.kycRepository.getKycDocuments(
          dto.user_token,
        );
      // A missing SP response is treated as an internal error.
      if (!result) {
        throw this.createInternalServerError();
      }
      let response: KycProcedureResponse;
      try {
        // The stored procedure returns JSON as a string.
        response = JSON.parse(
          result,
        ) as KycProcedureResponse;
      } catch (error) {
        console.error(
          'Invalid JSON returned by dbo.USP_User_Registration_KYC_GET:',
          error,
        );
        throw this.createInternalServerError();
      }
      // Validate the status code returned by the SP.
      const statusCode = response?.statusCode;
      if (
        typeof statusCode !== 'number' ||
        !Number.isInteger(statusCode)
      ) {
        throw this.createInternalServerError();
      }
      // Return successful SP responses directly.
      if (
        statusCode >= 200 &&
        statusCode < 300
      ) {
        return response;
      }
      // Preserve the status code and message returned
      // by the stored procedure for expected errors.
      throw new HttpException(
        response,
        statusCode,
      );
    } catch (error) {
      // Do not convert our intended HTTP exceptions
      // into a generic 500 error.
      if (error instanceof HttpException) {
        throw error;
      }
      console.error(
        'Error fetching KYC documents:',
        error,
      );
      throw this.createInternalServerError();
    }
  }
  /**
   * Upload or re-upload a KYC document.
   * The stored procedure determines whether the operation
   * is an insert or re-upload and manages the document version.
   */
  async uploadKycDocument(
    dto: KycUploadDto,
  ): Promise<KycUploadProcedureResponse> {
    try {
      // Execute the KYC upload stored procedure.
      const result =
        await this.kycRepository.uploadKycDocument(
          dto.user_id,
          dto.doc_id,
          dto.doc_url,
        );
      // A missing SP response indicates an unexpected failure.
      if (!result) {
        throw this.createInternalServerError();
      }
      let response: KycUploadProcedureResponse;
      try {
        // The stored procedure returns its response as JSON.
        response = JSON.parse(
          result,
        ) as KycUploadProcedureResponse;
      } catch (error) {
        console.error(
          'Invalid JSON returned by dbo.USP_User_KYC_Upload:',
          error,
        );
        throw this.createInternalServerError();
      }
      // Validate the status code returned by the SP.
      const statusCode = response?.statusCode;
      if (
        typeof statusCode !== 'number' ||
        !Number.isInteger(statusCode)
      ) {
        throw this.createInternalServerError();
      }
      // Return successful responses such as:
      // 201 - New document uploaded
      // 200 - Existing document re-uploaded
      if (
        statusCode >= 200 &&
        statusCode < 300
      ) {
        return response;
      }
      // Preserve expected business errors such as:
      // 400 - Invalid input
      // 403 - Inactive user
      // 404 - User/document/society not found
      // 409 - Pending/rejected document
      throw new HttpException(
        response,
        statusCode,
      );
    } catch (error) {
      // Preserve the status code and message for expected
      // stored-procedure/business errors.
      if (error instanceof HttpException) {
        throw error;
      }
      // Log the actual server-side error.
      console.error(
        'Error uploading/re-uploading KYC document:',
        error,
      );
      // Never expose unexpected database/application
      // error details directly to the client.
      throw this.createInternalServerError();
    }
  }
  /**
   * Create a consistent generic 500 response.
   * Internal database/application details are logged
   * server-side but are not exposed to the client.
   */
  private createInternalServerError():
    InternalServerErrorException {
    return new InternalServerErrorException({
      success: false,
      statusCode: 500,
      message:
        'An unexpected error occurred while processing the request.',
      data: null,
    });
  }
}