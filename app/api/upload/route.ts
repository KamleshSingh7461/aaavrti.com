
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Check if Cloudinary is configured
        const hasCloudinary = !!process.env.CLOUDINARY_API_KEY;

        if (hasCloudinary) {
            // Upload to Cloudinary
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'ournika/products',
                        resource_type: 'auto',
                        transformation: [
                            { quality: 'auto:good' },
                            { fetch_format: 'auto' },
                        ],
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });

            return NextResponse.json({
                success: true,
                url: (result as any).secure_url,
                publicId: (result as any).public_id,
            });
        } else {
            // Local Upload Fallback
            const uploadsDir = path.join(process.cwd(), 'public/uploads');
            await mkdir(uploadsDir, { recursive: true });

            const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            const filepath = path.join(uploadsDir, filename);

            await writeFile(filepath, buffer);

            return NextResponse.json({
                success: true,
                url: `/uploads/${filename}`,
                publicId: filename, // Use filename as mock publicId
            });
        }
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { publicId } = await request.json();

        if (!publicId) {
            return NextResponse.json(
                { error: 'No public ID provided' },
                { status: 400 }
            );
        }

        // Check if Cloudinary is configured
        const hasCloudinary = !!process.env.CLOUDINARY_API_KEY;

        if (hasCloudinary) {
            const result = await cloudinary.uploader.destroy(publicId);
            return NextResponse.json({
                success: true,
                result,
            });
        } else {
            // Local Delete (Optional: Implement file deletion if critical)
            // For now, just return success since we can't easily undo
            return NextResponse.json({ success: true });
        }
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: 'Delete failed' },
            { status: 500 }
        );
    }
}
