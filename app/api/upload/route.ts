import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, generateUniqueFileName } from '@/lib/aws-s3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Vérification du type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Formats acceptés: JPG, PNG, WEBP, GIF' },
        { status: 400 }
      );
    }

    // Vérification de la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximum: 5MB' },
        { status: 400 }
      );
    }

    // Convertir le fichier en Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Générer un nom de fichier unique
    const key = generateUniqueFileName(file.name, folder);

    // Upload vers S3
    const url = await uploadToS3(buffer, key, file.type);

    return NextResponse.json({
      success: true,
      url,
      key,
      size: file.size,
      type: file.type,
      name: file.name,
    });
  } catch (error) {
    console.error('Erreur upload S3:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    );
  }
}
