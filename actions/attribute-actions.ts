'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface AttributeWithValues {
    id: string;
    name: string;
    type: string;
    values: {
        id: string;
        name: string;
        value: string;
        createdAt: Date;
    }[];
    createdAt: Date;
}

// Get all attributes with their values
export async function getAttributes() {
    try {
        const attributes = await prisma.attribute.findMany({
            include: {
                values: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
        return attributes as AttributeWithValues[];
    } catch (error) {
        console.error('Error fetching attributes:', error);
        return [];
    }
}

// Get attributes by type
export async function getAttributesByType(type: string) {
    try {
        const attributes = await prisma.attribute.findMany({
            where: { type },
            include: {
                values: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });
        return attributes as AttributeWithValues[];
    } catch (error) {
        console.error('Error fetching attributes by type:', error);
        return [];
    }
}

// Create new attribute type
export async function createAttribute(formData: FormData) {
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;

    if (!name || !type) {
        return { error: 'Name and type are required' };
    }

    try {
        await prisma.attribute.create({
            data: {
                name,
                type,
            },
        });

        revalidatePath('/attributes');
        return { success: true };
    } catch (error) {
        console.error('Error creating attribute:', error);
        return { error: 'Failed to create attribute' };
    }
}

// Create new attribute value
export async function createAttributeValue(attributeId: string, formData: FormData) {
    const name = formData.get('name') as string;
    const value = formData.get('value') as string;

    if (!name || !value) {
        return { error: 'Name and value are required' };
    }

    try {
        await prisma.attributeValue.create({
            data: {
                attributeId,
                name,
                value,
            },
        });

        revalidatePath('/attributes');
        return { success: true };
    } catch (error) {
        console.error('Error creating attribute value:', error);
        return { error: 'Failed to create attribute value' };
    }
}

// Update attribute value
export async function updateAttributeValue(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const value = formData.get('value') as string;

    if (!name || !value) {
        return { error: 'Name and value are required' };
    }

    try {
        await prisma.attributeValue.update({
            where: { id },
            data: {
                name,
                value,
            },
        });

        revalidatePath('/attributes');
        return { success: true };
    } catch (error) {
        console.error('Error updating attribute value:', error);
        return { error: 'Failed to update attribute value' };
    }
}

// Delete attribute value
export async function deleteAttributeValue(id: string) {
    try {
        // TODO: Check if value is used in any products before deleting
        await prisma.attributeValue.delete({
            where: { id },
        });

        revalidatePath('/attributes');
        return { success: true };
    } catch (error) {
        console.error('Error deleting attribute value:', error);
        return { error: 'Failed to delete attribute value' };
    }
}

// Initialize default attributes (to be called manually or on first setup)
export async function initializeDefaultAttributes() {
    try {
        // Check if attributes already exist
        const existing = await prisma.attribute.findFirst();
        if (existing) {
            return { error: 'Attributes already initialized' };
        }

        // Create Color attribute
        const colorAttr = await prisma.attribute.create({
            data: {
                name: 'Color',
                type: 'COLOR',
                values: {
                    create: [
                        { name: 'Crimson Red', value: '#DC143C' },
                        { name: 'Royal Blue', value: '#4169E1' },
                        { name: 'Emerald Green', value: '#50C878' },
                        { name: 'Golden', value: '#FFD700' },
                        { name: 'Ivory', value: '#FFFFF0' },
                        { name: 'Maroon', value: '#800000' },
                        { name: 'Navy Blue', value: '#000080' },
                        { name: 'Pink', value: '#FFC0CB' },
                        { name: 'Orange', value: '#FFA500' },
                        { name: 'Black', value: '#000000' },
                    ],
                },
            },
        });

        // Create Size attribute
        const sizeAttr = await prisma.attribute.create({
            data: {
                name: 'Size',
                type: 'SIZE',
                values: {
                    create: [
                        { name: 'Extra Small (XS)', value: 'XS' },
                        { name: 'Small (S)', value: 'S' },
                        { name: 'Medium (M)', value: 'M' },
                        { name: 'Large (L)', value: 'L' },
                        { name: 'Extra Large (XL)', value: 'XL' },
                        { name: 'XXL', value: 'XXL' },
                        { name: 'Free Size', value: 'Free Size' },
                    ],
                },
            },
        });

        // Create Material attribute
        const materialAttr = await prisma.attribute.create({
            data: {
                name: 'Material',
                type: 'TEXT',
                values: {
                    create: [
                        { name: 'Cotton', value: 'Cotton' },
                        { name: 'Silk', value: 'Silk' },
                        { name: 'Georgette', value: 'Georgette' },
                        { name: 'Chiffon', value: 'Chiffon' },
                        { name: 'Linen', value: 'Linen' },
                        { name: 'Velvet', value: 'Velvet' },
                    ],
                },
            },
        });

        // Create Tags attribute for collections
        const tagsAttr = await prisma.attribute.create({
            data: {
                name: 'Tags',
                type: 'TEXT',
                values: {
                    create: [
                        { name: 'Wedding Collection', value: 'wedding' },
                        { name: 'Festive Wear', value: 'festive' },
                        { name: 'Bestseller', value: 'bestseller' },
                        { name: 'New Arrival', value: 'new' },
                    ],
                },
            },
        });

        revalidatePath('/attributes');
        return { success: true };
    } catch (error) {
        console.error('Error initializing attributes:', error);
        return { error: 'Failed to initialize attributes' };
    }
}
