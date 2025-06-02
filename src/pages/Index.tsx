import React, { useState, useRef, useCallback } from "react";
import { Upload, Type, Download, Images, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import MemeCanvas from "@/components/MemeCanvas";
import MemeGallery from "@/components/MemeGallery";

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: string;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [showGallery, setShowGallery] = useState(false);
  const [savedMemes, setSavedMemes] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          // toast({
          //   title: "Fichier trop volumineux",
          //   description: "Veuillez sélectionner une image de moins de 5MB.",
          //   variant: "destructive",
          // });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target?.result as string);
          setTextElements([]);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const addTextElement = useCallback(() => {
    if (!currentText.trim()) {
      // toast({
      //   title: "Texte vide",
      //   description: "Veuillez entrer du texte avant d'ajouter.",
      //   variant: "destructive",
      // });
      return;
    }

    const newTextElement: TextElement = {
      id: Date.now().toString(),
      text: currentText,
      x: 50,
      y: 50 + textElements.length * 60,
      fontSize: 32,
      color: "#ffffff",
      fontWeight: "bold",
    };

    setTextElements([...textElements, newTextElement]);
    setCurrentText("");

    // toast({
    //   title: "Texte ajouté",
    //   description: "Vous pouvez maintenant le positionner sur l'image.",
    // });
  }, [currentText, textElements]);

  const updateTextElement = useCallback(
    (id: string, updates: Partial<TextElement>) => {
      setTextElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
      );
    },
    []
  );

  const deleteTextElement = useCallback((id: string) => {
    setTextElements((prev) => prev.filter((el) => el.id !== id));
  }, []);

  const downloadMeme = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `meme-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    // Sauvegarder le mème dans la galerie
    const memeData = canvas.toDataURL();
    setSavedMemes((prev) => [memeData, ...prev]);

    // toast({
    //   title: "Mème téléchargé",
    //   description: "Votre mème a été téléchargé et ajouté à la galerie !",
    // });
  }, []);

  const shareMeme = useCallback(() => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob && navigator.share) {
        const file = new File([blob], "meme.png", { type: "image/png" });
        navigator.share({
          title: "Mon mème génial !",
          files: [file],
        });
      } else {
        // Fallback: copier l'URL
        // toast({
        //   title: "Partage",
        //   description:
        //     "Utilisez le bouton télécharger pour sauvegarder et partager votre mème.",
        // });
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-blue-500 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Générateur de Mèmes
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de contrôle */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Upload className="h-5 w-5" />
                  Télécharger une image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                  size="lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choisir une image
                </Button>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  PNG, JPG jusqu'à 5MB
                </p>
              </CardContent>
            </Card>

            {selectedImage && (
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Type className="h-5 w-5" />
                    Ajouter du texte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="meme-text">Texte du mème</Label>
                    <Textarea
                      id="meme-text"
                      placeholder="Entrez votre texte hilarant..."
                      value={currentText}
                      onChange={(e) => setCurrentText(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={addTextElement}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    disabled={!currentText.trim()}
                  >
                    Ajouter le texte
                  </Button>
                </CardContent>
              </Card>
            )}

            {textElements.length > 0 && (
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-700">
                    Textes ajoutés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {textElements.map((element) => (
                      <div
                        key={element.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm truncate flex-1">
                          {element.text}
                        </span>
                        <Button
                          onClick={() => deleteTextElement(element.id)}
                          variant="destructive"
                          size="sm"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Zone de création */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-center text-gray-700">
                  Votre Mème
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedImage ? (
                  <div className="space-y-4">
                    <MemeCanvas
                      ref={canvasRef}
                      image={selectedImage}
                      textElements={textElements}
                      onUpdateTextElement={updateTextElement}
                    />
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={downloadMeme}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                      <Button
                        onClick={shareMeme}
                        variant="outline"
                        className="border-2 border-blue-300 hover:bg-blue-50"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Upload className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-xl">
                        Téléchargez une image pour commencer
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bouton Galerie */}
        <div className="mt-6 text-center">
          <Button
            onClick={() => setShowGallery(!showGallery)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 text-lg"
          >
            <Images className="h-5 w-5 mr-2" />
            {showGallery ? "Masquer" : "Voir"} la Galerie ({savedMemes.length})
          </Button>
        </div>

        {/* Galerie */}
        {showGallery && (
          <div className="mt-6">
            <MemeGallery memes={savedMemes} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
