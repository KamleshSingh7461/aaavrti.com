import { getSizeGuideById } from '@/actions/size-guide-actions';
import { getCategories } from '@/actions/category-actions';
import SizeGuideEditorClient from './SizeGuideEditorClient';

export default async function SizeGuidePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const isNew = id === 'new';

    // Parallel fetching
    const [sizeGuideRes, categoriesRes] = await Promise.all([
        !isNew ? getSizeGuideById(id) : Promise.resolve({ success: true, guide: null }),
        getCategories()
    ]);

    const initialData = sizeGuideRes.success ? sizeGuideRes.guide : null;
    const categories = categoriesRes && Array.isArray(categoriesRes) ? categoriesRes : (categoriesRes as any)?.categories || [];

    return (
        <SizeGuideEditorClient
            id={id}
            isNew={isNew}
            initialData={initialData}
            categories={categories}
        />
    );
}
