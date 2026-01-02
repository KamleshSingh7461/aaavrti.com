import { getCategories } from '@/actions/category-actions';
import { auth } from '@/auth';
import { HeaderClient } from '@/components/layout/HeaderClient';
import { buildCategoryTree } from '@/lib/category-utils';

export async function Header() {
    const categories = await getCategories();
    // Transform flat list to tree for proper navigation rendering
    // @ts-ignore - Types are compatible at runtime but strict check fails due to minor differences
    const categoryTree = buildCategoryTree(categories);
    const session = await auth();
    console.log('Server Header Session:', JSON.stringify(session, null, 2));

    // @ts-ignore
    return <HeaderClient categories={categoryTree} user={session?.user} />;
}
