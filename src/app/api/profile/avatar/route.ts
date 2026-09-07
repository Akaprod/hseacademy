import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

// ============================================================================
// POST /api/profile/avatar — Upload photo de profil
// DELETE /api/profile/avatar — Supprimer photo de profil
// ============================================================================

const AVATAR_DIR = process.env.AVATAR_UPLOAD_DIR || `${process.env.HOME}/domains/hseacademy.online/public_html/avatars`;
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get('avatar');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 2 MB)' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format non supporté (JPG, PNG, WebP)' }, { status: 400 });
    }

    // Générer un nom de fichier sécurisé
    const ext = file.type === 'image/jpeg' ? '.jpg' : file.type === 'image/png' ? '.png' : '.webp';
    const safeName = `${randomBytes(16).toString('hex')}${ext}`;
    const avatarPath = `${AVATAR_DIR}/${safeName}`;

    // Créer le répertoire
    await fs.mkdir(AVATAR_DIR, { recursive: true });

    // Écrire le fichier
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(avatarPath, buffer);

    // URL publique
    const avatarUrl = `/avatars/${safeName}`;

    // Mettre à jour le profil
    let profile = await db.userProfile.findUnique({ where: { userId: auth.id } });
    if (!profile) {
      profile = await db.userProfile.create({ data: { userId: auth.id, avatar: avatarUrl } });
    } else {
      // Supprimer l'ancienne image si elle existe
      if (profile.avatar) {
        const oldPath = path.join(AVATAR_DIR, path.basename(profile.avatar));
        try { await fs.unlink(oldPath); } catch {}
      }
      await db.userProfile.update({
        where: { userId: auth.id },
        data: { avatar: avatarUrl },
      });
    }

    return NextResponse.json({ avatar: avatarUrl });
  } catch (error) {
    console.error('POST /api/profile/avatar error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const profile = await db.userProfile.findUnique({ where: { userId: auth.id } });
    if (!profile || !profile.avatar) {
      return NextResponse.json({ error: 'Pas de photo à supprimer' }, { status: 400 });
    }

    // Supprimer le fichier
    const oldPath = path.join(AVATAR_DIR, path.basename(profile.avatar));
    try { await fs.unlink(oldPath); } catch {}

    // Mettre à jour le profil
    await db.userProfile.update({
      where: { userId: auth.id },
      data: { avatar: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/profile/avatar error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
