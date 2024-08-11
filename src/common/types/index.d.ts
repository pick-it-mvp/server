import { UserByJWT } from 'src/users/entities';

declare global {
  namespace Express {
    export interface Request {
      user: UserByJWT;
    }
  }
}
