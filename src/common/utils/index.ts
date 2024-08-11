import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata('isPublic', true);
export const Private = () => SetMetadata('isPrivate', true);
