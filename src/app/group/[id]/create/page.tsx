import CreatePostForm from '@/components/CreatePostForm'

export default async function CreatePostPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params
    return <CreatePostForm groupId={id} />
}
