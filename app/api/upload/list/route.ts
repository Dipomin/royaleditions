import { NextRequest, NextResponse } from 'next/server';
import { listS3Files } from '@/lib/aws-s3';

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';
    const maxKeys = parseInt(searchParams.get('maxKeys') || '100');

    const files = await listS3Files(folder, maxKeys);

    // Générer les URLs complètes pour chaque fichier
    const filesWithUrls = files.map((file) => {
      let url: string;
      
      // Si CloudFront est configuré, utiliser l'URL CloudFront
      if (CLOUDFRONT_DOMAIN) {
        url = `https://${CLOUDFRONT_DOMAIN}/${file.key}`;
      } else {
        // Sinon, utiliser l'URL S3 standard
        url = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${file.key}`;
      }

      return {
        key: file.key,
        url,
        size: file.size,
        lastModified: file.lastModified,
        name: file.key.split('/').pop() || file.key,
      };
    });

    // Filtrer uniquement les images
    const imageFiles = filesWithUrls.filter((file) => {
      const ext = file.name.toLowerCase().split('.').pop();
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
    });

    return NextResponse.json({
      success: true,
      files: imageFiles,
      count: imageFiles.length,
    });
  } catch (error) {
    console.error('Erreur liste S3:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des fichiers' },
      { status: 500 }
    );
  }
}
