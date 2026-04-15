import { useState } from 'react';
import { FaRocket, FaDownload, FaCheck, FaPlay } from 'react-icons/fa';
import { MdOutlineOpenInNew } from 'react-icons/md';
import previewZwcad from "@/assets/ferracad-docs/dalle ZWCAD.mp4";

const FerracadZWCADPage = () => {
  const [openVideo, setOpenVideo] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-700 font-medium text-sm">
              ✅ Ferracad pour ZWCAD - Maintenant disponible !
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Ferracad pour ZWCAD
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            La solution ultime de CAO optimisée pour ZWCAD - Performance, précision et productivité réunies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Video & Features */}
          <div className="space-y-8">
            
            {/* Video Preview */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <div className="relative">
                <video 
                  autoPlay 
                  muted 
                  loop 
                  className="w-full h-64 md:h-80 object-cover"
                  poster={previewZwcad}
                >
                  <source src="/videos/zwcad.mp4" type="video/mp4" />
                </video>
                
                <button
                  onClick={() => setOpenVideo(true)}
                  className="absolute inset-0 bg-black/20 flex items-center justify-center group"
                >
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FaPlay className="text-blue-600 text-xl ml-1" />
                  </div>
                </button>
              </div>

              <div className="p-6">
                <button
                  onClick={() => setOpenVideo(true)}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FaPlay />
                  Voir la démonstration complète
                </button>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaRocket className="text-blue-500" />
                Fonctionnalités principales
              </h3>
              
              <div className="space-y-3">
                {[
                  "Interface optimisée pour ZWCAD",
                  "Outils de dessin et modification avancés",
                  "Gestion des calques et styles",
                  "Compatible avec les formats DWG/DXF",
                  "Rendu 3D haute performance",
                  "Scripts et automatisation"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-700">
                    <FaCheck className="text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Description & CTA */}
          <div className="space-y-8">
            
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                L'alternative puissante à AutoCAD
              </h2>
              
              <div className="space-y-4 text-gray-600">
                <p>
                  Ferracad pour ZWCAD combine la puissance de Ferracad avec la stabilité 
                  et la compatibilité de ZWCAD. Conçu pour les professionnels qui recherchent 
                  une solution de CAO complète et économique.
                </p>
                
                <p>
                  Profitez d'une expérience fluide et intuitive, avec tous les outils 
                  nécessaires pour vos projets de conception les plus exigeants.
                </p>

                <p className="font-semibold text-blue-600">
                  ✅ Téléchargez dès maintenant et commencez à créer !
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Prêt à commencer ?</h3>
              <p className="mb-6 opacity-90">
                Téléchargez Ferracad pour ZWCAD et découvrez pourquoi des milliers 
                de professionnels nous font confiance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 flex-1">
                  <FaDownload />
                  Télécharger maintenant
                </button>
                
                <button 
                  onClick={() => setOpenVideo(true)}
                  className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 flex-1"
                >
                  <MdOutlineOpenInNew />
                  Voir la démo
                </button>
              </div>
              
              <p className="text-sm opacity-80 mt-4 text-center">
                Version d'essai gratuite disponible - Compatible ZWCAD 2024+
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {openVideo && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/80 backdrop-blur-sm">
          <div className="bg-white p-6 w-[95%] max-w-6xl rounded-2xl relative">
            <button
              onClick={() => setOpenVideo(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors text-2xl"
            >
              <MdOutlineOpenInNew className="h-8 w-8" />
            </button>

            <p className="text-2xl font-bold text-center mb-6 text-gray-900">
              Démonstration Ferracad pour ZWCAD
            </p>
            
            <video
              className="w-full h-auto max-h-[70vh] rounded-xl"
              controls
              controlsList="nodownload"
              autoPlay
            >
              <source src={previewZwcad} type="video/mp4" />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default FerracadZWCADPage;