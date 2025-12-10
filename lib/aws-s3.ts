import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuration du client S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN; // Optionnel

/**
 * Upload un fichier vers S3
 * @param file - Le fichier à uploader (Buffer)
 * @param key - Le chemin/nom du fichier dans S3 (ex: "books/cover-123.jpg")
 * @param contentType - Le type MIME du fichier
 * @returns L'URL publique du fichier
 */
export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read', // Fichiers publics accessibles directement
  });

  await s3Client.send(command);

  // Si CloudFront est configuré, retourner l'URL CloudFront
  if (CLOUDFRONT_DOMAIN) {
    return `https://${CLOUDFRONT_DOMAIN}/${key}`;
  }

  // Sinon, retourner l'URL S3
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

/**
 * Génère une URL présignée pour accéder à un fichier privé dans S3
 * @param key - Le chemin du fichier dans S3
 * @param expiresIn - Durée de validité en secondes (défaut: 1 heure)
 * @returns L'URL présignée
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
}

/**
 * Supprime un fichier de S3
 * @param key - Le chemin du fichier dans S3
 */
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Liste les fichiers dans un dossier S3
 * @param prefix - Le préfixe/dossier à lister (ex: "books/")
 * @param maxKeys - Nombre maximum de résultats (défaut: 1000)
 * @returns Liste des fichiers avec leurs métadonnées
 */
export async function listS3Files(
  prefix: string = '',
  maxKeys: number = 1000
): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
    MaxKeys: maxKeys,
  });

  try {
    const response = await s3Client.send(command);

    return (
      response.Contents?.map((item) => ({
        key: item.Key || '',
        size: item.Size || 0,
        lastModified: item.LastModified || new Date(),
      })) || []
    );
  } catch (error: unknown) {
    const err = error as { Code?: string };
    if (err.Code === 'AccessDenied') {
      console.error('S3 ListBucket permission denied. Veuillez ajouter s3:ListBucket à la politique IAM.');
      // Retourner un tableau vide au lieu de planter
      return [];
    }
    throw error;
  }
}

/**
 * Génère un nom de fichier unique
 * @param originalName - Le nom original du fichier
 * @param folder - Le dossier dans S3 (ex: "books", "blog", "categories")
 * @returns Un nom de fichier unique avec timestamp
 */
export function generateUniqueFileName(
  originalName: string,
  folder: string = 'uploads'
): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.split('.').slice(0, -1).join('.');
  const sanitizedName = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  return `${folder}/${sanitizedName}-${timestamp}-${randomString}.${extension}`;
}

/**
 * Extrait la clé S3 depuis une URL complète
 * @param url - L'URL complète du fichier
 * @returns La clé S3 (chemin du fichier)
 */
export function extractS3Key(url: string): string {
  // Si c'est une URL CloudFront
  if (CLOUDFRONT_DOMAIN && url.includes(CLOUDFRONT_DOMAIN)) {
    return url.split(`${CLOUDFRONT_DOMAIN}/`)[1];
  }

  // Si c'est une URL S3 standard
  if (url.includes('.amazonaws.com/')) {
    return url.split('.amazonaws.com/')[1];
  }

  // Si c'est déjà juste la clé
  return url;
}
