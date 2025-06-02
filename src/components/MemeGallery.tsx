
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MemeGalleryProps {
  memes: string[];
}

const MemeGallery: React.FC<MemeGalleryProps> = ({ memes }) => {
  const downloadMeme = (memeData: string, index: number) => {
    const link = document.createElement('a');
    link.download = `meme-gallery-${index + 1}.png`;
    link.href = memeData;
    link.click();

    toast({
      title: "Mème téléchargé",
      description: "Le mème a été téléchargé avec succès !",
    });
  };

  const shareMeme = async (memeData: string) => {
    try {
      const response = await fetch(memeData);
      const blob = await response.blob();
      
      if (navigator.share) {
        const file = new File([blob], 'meme.png', { type: 'image/png' });
        await navigator.share({
          title: 'Mon mème génial !',
          files: [file]
        });
      } else {
        toast({
          title: "Partage",
          description: "Utilisez le bouton télécharger pour sauvegarder et partager ce mème.",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de partager le mème.",
        variant: "destructive"
      });
    }
  };

  if (memes.length === 0) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="text-center py-12">
          <div className="text-gray-500">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold mb-2">Aucun mème créé</h3>
            <p>Vos créations apparaîtront ici une fois que vous aurez téléchargé vos premiers mèmes !</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-center text-2xl text-purple-700">
          🎨 Ma Galerie de Mèmes ({memes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {memes.map((memeData, index) => (
            <div key={index} className="group relative">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="aspect-square relative">
                  <img
                    src={memeData}
                    alt={`Mème ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => downloadMeme(memeData, index)}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => shareMeme(memeData)}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-3 text-center">
                  <p className="text-sm text-gray-600 font-medium">
                    Mème #{index + 1}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MemeGallery;
