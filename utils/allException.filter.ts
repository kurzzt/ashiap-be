// import {
//   ExceptionFilter,
//   Catch,
//   ArgumentsHost,
//   HttpException,
//   HttpStatus
// } from "@nestjs/common";

import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, HttpException } from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.FORBIDDEN;

    /**
     * @description Exception json response
     * @param message
     */
    const responseMessage = (type, message) => {
      response.status(status).json({
        statusCode: status,
        errorType: type,
        errorMessage: message
      });
    };

    // Throw an exceptions for either
    // MongoError, ValidationError, TypeError, CastError and Error
    if (exception.message) {
      responseMessage("Error", exception.message);
    } else {
      responseMessage(exception.name, exception.message);
    }
  }
}

// @Catch(MongoError)
// export class MongoExceptionFilter implements ExceptionFilter {
//   catch(exception: MongoError, host: ArgumentsHost) {
//     switch (exception.code) {
//       case 11000:
//         var status = HttpStatus.FORBIDDEN
//       default: console.log(exception,'ALERT ERROR CATCHED');
//         // duplicate exception
//         // do whatever you want here, for instance send error to client


//     }
//     const ctx = host.switchToHttp(),
//       response = ctx.getResponse();

//     return response.status(status).json({
//       statusCode: status,
//       createdBy: 'MongoError : ValidationErrorFilter, Schema or Model definition',
//       errors: exception,
//     });

//   }
// }