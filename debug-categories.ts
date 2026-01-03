
import dbConnect from './lib/db';
import { Category } from './lib/models/Product';

async function checkCategories() {
    await dbConnect();
    const categories = await Category.find({}).lean();
    console.log(JSON.stringify(categories, null, 2));
    process.exit(0);
}

checkCategories();
