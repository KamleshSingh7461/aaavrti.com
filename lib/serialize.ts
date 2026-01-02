/**
 * Utility to serialize Mongoose documents/objects for Next.js Client Components.
 * Converts ObjectIds to strings and Dates to ISO strings recursively.
 */
export function serialize(data: any): any {
    if (data === null || data === undefined) {
        return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(serialize);
    }

    // Handle Dates
    if (data instanceof Date) {
        return data.toISOString();
    }

    // Handle ObjectIds
    if (data._bsontype === 'ObjectId' || (data.constructor && data.constructor.name === 'ObjectId')) {
        return data.toString();
    }

    // Handle Objects
    if (typeof data === 'object') {
        // If it's a Mongoose lean object, it might still have hidden properties or non-plain fields
        // We iterate and serialize each property
        const result: any = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                // Skip Mongoose internal fields if any
                if (key === '__v') continue;

                // Special handling for _id to also provide 'id' for Prisma compatibility if needed
                if (key === '_id') {
                    const idStr = data[key].toString();
                    result._id = idStr;
                    result.id = idStr;
                    continue;
                }

                result[key] = serialize(data[key]);
            }
        }
        return result;
    }

    return data;
}
