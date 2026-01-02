
import { revalidatePath } from 'next/cache';

export default async function RevalidatePage() {
    revalidatePath('/', 'layout');
    return <div>Cache cleared</div>;
}
