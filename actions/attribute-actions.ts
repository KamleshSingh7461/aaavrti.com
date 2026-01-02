'use server';

import dbConnect from '@/lib/db';
import { Attribute } from '@/lib/models/Product';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

export interface AttributeWithValues {
    id: string;
    name: string;
    type: string;
    values: {
        id: string;
        name: string;
        value: string;
    }[];
}

// Get all attributes with their values
export async function getAttributes() {
    try {
        await dbConnect();
        const attributes = await Attribute.find()
            .sort({ name: 1 })
            .lean();

        return attributes.map((attr: any) => ({
            id: attr._id.toString(),
            name: attr.name,
            type: attr.type,
            values: (attr.values || []).map((v: any) => ({
                id: v._id.toString(),
                name: v.name,
                value: v.value
            }))
        }));
    } catch (error) {
        console.error('Error fetching attributes:', error);
        return [];
    }
}

export async function getAttributesByType(type: string) {
    try {
        await dbConnect();
        const attributes = await Attribute.find({ type })
            .sort({ name: 1 })
            .lean();

        return attributes.map((attr: any) => ({
            id: attr._id.toString(),
            name: attr.name,
            type: attr.type,
            values: (attr.values || []).map((v: any) => ({
                id: v._id.toString(),
                name: v.name,
                value: v.value
            }))
        }));
    } catch (error) {
        console.error('Error fetching attributes by type:', error);
        return [];
    }
}

export async function createAttribute(formData: FormData) {
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;

    if (!name || !type) {
        return { error: 'Name and type are required' };
    }

    try {
        await dbConnect();
        await Attribute.create({ name, type, values: [] });
        revalidatePath('/admin/attributes');
        return { success: true };
    } catch (error) {
        console.error('Error creating attribute:', error);
        return { error: 'Failed to create attribute' };
    }
}

export async function createAttributeValue(attributeId: string, formData: FormData) {
    const name = formData.get('name') as string;
    const value = formData.get('value') as string;

    if (!name || !value) {
        return { error: 'Name and value are required' };
    }

    try {
        await dbConnect();
        await Attribute.findByIdAndUpdate(attributeId, {
            $push: { values: { name, value } }
        });

        revalidatePath('/admin/attributes');
        return { success: true };
    } catch (error) {
        console.error('Error creating attribute value:', error);
        return { error: 'Failed to create attribute value' };
    }
}

export async function updateAttributeValue(id: string, formData: FormData) {
    // ID here implies value ID potentially, OR we need attribute ID too.
    // Mongoose locator: "values._id": id

    const name = formData.get('name') as string;
    const value = formData.get('value') as string;

    if (!name || !value) return { error: 'Name and value are required' };

    try {
        await dbConnect();
        // Since we only have 'id' (value id), we must find parent attribute
        await Attribute.findOneAndUpdate(
            { "values._id": id },
            {
                $set: {
                    "values.$.name": name,
                    "values.$.value": value
                }
            }
        );

        revalidatePath('/admin/attributes');
        return { success: true };
    } catch (error) {
        console.error('Error updating attribute value:', error);
        return { error: 'Failed to update attribute value' };
    }
}

export async function deleteAttributeValue(id: string) {
    try {
        await dbConnect();
        await Attribute.findOneAndUpdate(
            { "values._id": id },
            { $pull: { values: { _id: id } } }
        );

        revalidatePath('/admin/attributes');
        return { success: true };
    } catch (error) {
        console.error('Error deleting attribute value:', error);
        return { error: 'Failed to delete attribute value' };
    }
}

export async function initializeDefaultAttributes() {
    try {
        await dbConnect();
        console.log('Using debugged initializeDefaultAttributes');

        const defaults = [
            {
                name: 'Color',
                type: 'COLOR',
                values: [
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
                ]
            },
            {
                name: 'Size',
                type: 'SIZE',
                values: [
                    { name: 'Extra Small (XS)', value: 'XS' },
                    { name: 'Small (S)', value: 'S' },
                    { name: 'Medium (M)', value: 'M' },
                    { name: 'Large (L)', value: 'L' },
                    { name: 'Extra Large (XL)', value: 'XL' },
                    { name: 'XXL', value: 'XXL' },
                    { name: 'Free Size', value: 'Free Size' },
                ]
            },
            {
                name: 'Material',
                type: 'TEXT',
                values: [
                    { name: 'Cotton', value: 'Cotton' },
                    { name: 'Silk', value: 'Silk' },
                    { name: 'Georgette', value: 'Georgette' },
                    { name: 'Chiffon', value: 'Chiffon' },
                    { name: 'Linen', value: 'Linen' },
                    { name: 'Velvet', value: 'Velvet' },
                ]
            },
            {
                name: 'Tags',
                type: 'TEXT',
                values: [
                    { name: 'Wedding Collection', value: 'wedding' },
                    { name: 'Festive Wear', value: 'festive' },
                    { name: 'Bestseller', value: 'bestseller' },
                    { name: 'New Arrival', value: 'new' },
                ]
            }
        ];

        for (const def of defaults) {
            const existing = await Attribute.findOne({ name: def.name });
            if (!existing) {
                await Attribute.create(def);
            }
        }

        revalidatePath('/admin/attributes');
        return { success: true };
    } catch (error) {
        console.error('Error initializing attributes:', error);
        return { error: 'Failed to initialize attributes' };
    }
}
