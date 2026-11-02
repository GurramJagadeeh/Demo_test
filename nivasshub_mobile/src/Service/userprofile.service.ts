import { Injectable } from '@nestjs/common';
import { UserProfileRepository,UserProfileResponse,GetUserProfileParams } from '../repositories/userprofile.repository';
import { from } from 'rxjs';
@Injectable()
export class UserProfileService {
  constructor(
    private readonly userProfileRepository: UserProfileRepository,
  ) {}
  async getUserProfile(
    params: GetUserProfileParams,
  ): Promise<UserProfileResponse> {
    return await this.userProfileRepository.getUserProfile(params);
  }
}
