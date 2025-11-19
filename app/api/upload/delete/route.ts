import { NextRequest, NextResponse } from 'next/server';
import { deleteFromS3, extractS3Key } from '@/lib/aws-s3';

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL non fournie' },
        { status: 400 }
      );
    }

    // Extraire la clé S3 depuis l'URL
    const key = extractS3Key(url);

    // Supprimer le fichier de S3
    await deleteFromS3(key);

    return NextResponse.json({
      success: true,
      message: 'Fichier supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur suppression S3:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du fichier' },
      { status: 500 }
    );
  }
}
