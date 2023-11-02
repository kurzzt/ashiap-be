import { v2 } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'Cloudinary',
  useFactory: () => {
    return v2.config({
      cloud_name: process.env.CD_NAME,
      api_key: process.env.CD_KEY,
      api_secret: process.env.CD_SECRET,
    });
  },
};