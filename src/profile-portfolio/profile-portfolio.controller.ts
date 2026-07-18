import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProfilePortfolioService } from './profile-portfolio.service';
import { ProofPortfolioItem } from './domain/proof-portfolio-item';

@ApiTags('Profileportfolio')
@Controller({
  path: 'profile-portfolio',
  version: '1',
})
export class ProfilePortfolioController {
  constructor(
    private readonly profilePortfolioService: ProfilePortfolioService,
  ) {}

  // Público — alimenta o "Portfólio de provas" do perfil público (/u/[username]).
  @Get(':profileId')
  @ApiParam({ name: 'profileId', type: String })
  @ApiOkResponse({ type: [ProofPortfolioItem] })
  getProofPortfolio(
    @Param('profileId') profileId: string,
  ): Promise<ProofPortfolioItem[]> {
    return this.profilePortfolioService.getProofPortfolio(profileId);
  }
}
