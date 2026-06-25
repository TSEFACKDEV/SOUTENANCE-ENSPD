import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 52428800 // 50MB

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
])

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop grand. Maximum ${MAX_FILE_SIZE / 1024 / 1024} Mo` },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const resourceType = file.type.startsWith('image/') ? 'image' : 'raw'

    const result = await new Promise<{ secure_url: string; public_id: string; bytes: number }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: `soutenance/${session.user!.id}`, resource_type: resourceType },
            (error, res) => {
              if (error || !res) reject(error ?? new Error('Upload failed'))
              else resolve(res as { secure_url: string; public_id: string; bytes: number })
            }
          )
          .end(buffer)
      }
    )

    return NextResponse.json({ url: result.secure_url, filename: result.public_id, size: result.bytes, type: file.type })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 })
  }
}
