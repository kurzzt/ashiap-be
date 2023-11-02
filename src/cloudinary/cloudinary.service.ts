import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
    async uploadImage(
        file: any,
        folder: string = ""
    ): Promise<UploadApiResponse | UploadApiErrorResponse>{
        return new Promise<UploadApiResponse | UploadApiErrorResponse>((resolve, reject) => {
            const upload = v2.uploader.upload_stream({folder : `ashiap/${folder}`},(error, result) => {
                if (error) return reject(error);
                resolve(result);
            })

            toStream(file.buffer).pipe(upload)
        })
    }
}
