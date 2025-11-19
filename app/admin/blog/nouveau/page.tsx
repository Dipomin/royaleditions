import { BlogPostForm } from "@/components/admin/blog-post-form";

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-royal-blue">
          Nouvel Article de Blog
        </h1>
        <p className="text-gray-600">Créez un nouvel article pour votre blog</p>
      </div>

      <BlogPostForm />
    </div>
  );
}
