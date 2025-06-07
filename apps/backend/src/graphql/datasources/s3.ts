import { v4 as uuidv4 } from 'uuid';
import { deleteS3Object, generatePresignedUrl } from '@aws';
import { IS3DataSource } from './types';
import { GraphQLError } from 'graphql';

export default class S3Source implements IS3DataSource {
  getPresignedUrl = async (fileType: string, folder?: string) => {
    const fileExt = fileType.split('/')[1];
    const safeFolder =
      folder?.replace(/[^a-zA-Z0-9/_-]/g, '') || 'profile-picture'; // can remove this profile-picture later
    const fileName = `${safeFolder}/${uuidv4()}.${fileExt}`;

    const upload_url = await generatePresignedUrl(fileName, fileType);
    const file_url = `https://${process.env['AWS_BUCKET_NAME']}.s3.${process.env['AWS_REGION']}.amazonaws.com/${fileName}`;

    return { upload_url, file_url };
  };

  deleteProfilePhoto = async (photoUrl: string) => {
    try {
      console.log('Deleting photo from S3:', photoUrl);
      const urlParts = photoUrl.split(
        `https://${process.env['AWS_BUCKET_NAME']}.s3.${process.env['AWS_REGION']}.amazonaws.com/`
      );
      console.log('url parts:', urlParts);
      if (urlParts.length !== 2) {
        throw new GraphQLError('Invalid S3 URL format');
      }

      const key = urlParts[1];
      return await deleteS3Object(key);
    } catch (error) {
      console.error('Error deleting profile photo:', error);
      return false;
    }
  };
}
