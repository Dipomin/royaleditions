import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-royal-blue via-royal-blue/90 to-gold/20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Royal Editions Admin
          </h1>
          <p className="text-white/80">Créez votre compte administrateur</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
