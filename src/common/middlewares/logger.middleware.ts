import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import config from '../config';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger(config().env);

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl: url, params, query, body, headers } = req;

    const originalSend = res.send;
    res.send = function (responseBody) {
      const statusCode = res.statusCode;

      // 응답 전송
      res.send = originalSend;
      res.send(responseBody);

      const result = () => {
        try {
          return JSON.parse(responseBody);
        } catch (e) {
          return responseBody;
        }
      };

      // 로그 남기기
      this.logger.log(
        `${method} ${url} ${statusCode}\n ========================[REQUEST]========================\n` +
          `Params: ${JSON.stringify(params, null, 2)}\n` +
          `Query: ${JSON.stringify(query, null, 2).replace(/,/g, ',\n')}\n` +
          `Body: ${JSON.stringify(body, null, '')}\n` +
          `Headers: {\n` +
          Object.keys(headers)
            .map((key) => `  "${key}": "${headers[key]}"`)
            .join(',\n') +
          `\n}\n` +
          `========================[RESPONSE]========================\n` +
          `Status:${statusCode}\n` +
          `Body: ${JSON.stringify(result(), null, '')}`,
      );
    }.bind(this);

    next();
  }
}
