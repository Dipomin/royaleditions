import { ChatAdminClient } from "@/components/admin/chat-admin-client";

export const metadata = {
  title: "Chat en Direct - Admin | Royal Editions",
  description: "Gérer les conversations avec les visiteurs",
};

export default function ChatAdminPage() {
  return (
    <div className="container-custom py-8 lg:max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-royal-blue mb-2">
          Chat en Direct
        </h1>
        <p className="text-gray-600">
          Gérez vos conversations avec les visiteurs du site en temps réel
        </p>
      </div>

      <ChatAdminClient />
    </div>
  );
}
