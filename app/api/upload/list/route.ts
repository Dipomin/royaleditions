import { NextRequest, NextResponse } from 'next/server';
import { listS3Files } from '@/lib/aws-s3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';
    const maxKeys = parseInt(searchParams.get('maxKeys') || '100');

    const files = await listS3Files(folder, maxKeys);

    return NextResponse.json({
      success: true,
      files,
      count: files.length,
    });
  } catch (error) {
    console.error('Erreur liste S3:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des fichiers' },
      { status: 500 }
    );
  }
}
