import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';

import {
  KycDocumentsDto,
  KycUploadDto,
} from '../dto/kyc.dto';

import { KycService } from '../Service/kyc.service';

@Controller('kyc')
export class KycController {
  constructor(
    private readonly kycService: KycService,
  ) {}

  /**
   * Fetch KYC documents applicable to the user.
   *
   * Example:
   * GET /kyc/documents?user_token=<encrypted-token>
   */
  @Get('documents')
  @HttpCode(HttpStatus.OK)
  async getKycDocuments(
    @Query() dto: KycDocumentsDto,
  ) {
    return this.kycService.getKycDocuments(dto);
  }

  /**
   * Upload or re-upload a KYC document.
   *
   * The service and stored procedure handle:
   * - User validation
   * - Society validation
   * - Document validation
   * - Pending/rejected checks
   * - Insert/update decision
   * - Version management
   */
  @Post('upload')
  async uploadKycDocument(
    @Body() dto: KycUploadDto,
  ) {
    return this.kycService.uploadKycDocument(dto);
  }
}