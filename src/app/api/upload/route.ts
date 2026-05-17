import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import path from 'path'
import { writeFile, mkdir } from 'fs/promises'

const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 52428800 // 50MB

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/msword': 'doc',
}

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

    const ext = ALLOWED_TYPES[file.type]
    if (!ext) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', session.user.id)
    await mkdir(uploadDir, { recursive: true })

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filepath = path.join(uploadDir, filename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    const url = `/uploads/${session.user.id}/${filename}`

    return NextResponse.json({ url, filename, size: file.size, type: file.type })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
  }
}
