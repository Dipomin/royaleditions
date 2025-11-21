"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mail, MapPin, Clock, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de l'envoi");
      }

      setIsSuccess(true);
      toast.success("Message envoyé avec succès!");
      reset();

      // Réinitialiser le message de succès après 5 secondes
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="container-custom py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl font-bold text-royal-blue mb-4">
            Contactez-nous
          </h1>
          <p className="text-xl text-gray-600">
            Notre équipe est à votre écoute pour répondre à toutes vos questions
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="font-heading text-2xl font-semibold text-royal-blue mb-6">
                Nos coordonnées
              </h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-6 w-6 text-gold shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-royal-blue">Adresse</p>
                    <p className="text-gray-600 text-sm">
                      Abidjan, Cocody
                      <br />
                      Côte d&apos;Ivoire
                    </p>
                  </div>
                </div>
                {/**
             * 
             * 
                <div className="flex items-start space-x-3">
                  <Phone className="h-6 w-6 text-gold shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-royal-blue">Téléphone</p>
                    <p className="text-gray-600 text-sm">+225 00 00 00 00 00</p>
                  </div>
                </div>
             */}

                <div className="flex items-start space-x-3">
                  <Mail className="h-6 w-6 text-gold shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-royal-blue">Email</p>
                    <p className="text-gray-600 text-sm">
                      contact@royaleditions.ci
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-gold shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-royal-blue">Horaires</p>
                    <p className="text-gray-600 text-sm">
                      Lundi - Samedi
                      <br />
                      8h00 - 18h00
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-linear-to-br from-gold/10 to-gold/5">
              <h3 className="font-heading text-lg font-semibold text-royal-blue mb-3">
                Besoin d&apos;aide ?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Consultez notre FAQ pour des réponses rapides aux questions
                fréquentes
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="/faq">Voir la FAQ</a>
              </Button>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="font-heading text-2xl font-semibold text-royal-blue mb-6">
                Envoyez-nous un message
              </h2>

              {isSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800">
                      Message envoyé avec succès !
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Nous vous répondrons dans les plus brefs délais.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Nom complet <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Votre nom"
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="votre@email.com"
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone (optionnel)</Label>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-3 rounded-md border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700">
                      +225
                    </span>
                    <Input
                      id="phone"
                      {...register("phone")}
                      placeholder="0123456789"
                      maxLength={10}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">
                    Sujet <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    {...register("subject")}
                    placeholder="Objet de votre message"
                    disabled={isSubmitting}
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-500">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    placeholder="Votre message..."
                    rows={6}
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full btn-gold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le message"
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
