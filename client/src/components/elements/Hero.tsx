import { useLanguage } from "@/lang/LanguageProvider";
import { Link } from "react-router-dom";
import DownloadButton from "./DownloadButton";
import { FaPlay } from "react-icons/fa";
import { useEffect, useState } from "react";


const Hero = () => {
  const { t } = useLanguage();
  const [playlistShow, setPlaylistShow] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<any>(null);

  useEffect(() => {
    // check if ?guide=demarage, then show the playlist
    const params = new URLSearchParams(window.location.search);
    if (params.get("guide") === "demarage") {
      setPlaylistShow(true);
      setCurrentVideo({
        title: "Créer une nouvelle licence",
        path: "./video/comment-creer-une-nouvelle-commande.mp4"
      })
    }
  }, []);
  
  const playlist = [
    {
      title: "Créer un compte",
      path: "./video/cree-compte.mp4"
    },
    {
      title: "Obtenir l’essai gratuit",
      path: "./video/free-trial.mp4"
    },
    {
      title: "Créer une nouvelle licence",
      path: "./video/comment-creer-une-nouvelle-commande.mp4"
    },
    {
      title: "Renouveler la licence",
      path: "./video/renouveler-une-licence.mp4"
    },
  ]

  // bg-image-hero 
  return (
    <section className="py-4 flex flex-col justify-center items-center">
      <div className="w-5/12 min-2xl:w-4/12 max-lg:w-8/12 mx-auto container py-6 flex flex-col justify-center items-center gap-2">
        <div className="flex justify-center -mb-3">
          <div className="inline-flex items-center gap-2 bg-red-100/40 text-primary rounded-full px-2 py-1">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            <span className="font-semibold text-[12px]">
              {t('new_ferracad_zwcad')}
            </span>
          </div>
        </div>

        <h2 className="uppercase text-stone-800 text-center font-bold text-5xl max-sm:text-3xl leading-[1.3]">
          {t("hero_title")}
        </h2>
        <p
          className="text-stone-600 font-medium text-center max-sm:text-sm"
          dangerouslySetInnerHTML={{ __html: t("hero_description") }}
        />
        <div className="flex flex-col items-center gap-3 w-[70%] max-md:w-[80%] max-sm:w-full">
          <div className="flex max-md:flex-col max-md:gap-3 items-center justify-center gap-4 md:gap-3 w-full">
            <DownloadButton
              context={t("hero_download_free")}
              className="flex items-center justify-center gap-2 rounded-xl py-3.5 px-8 bg-primary hover:bg-red-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] cursor-pointer font-semibold text-sm text-white shadow-md"
            />

            <div className="h-[1px] max-md:hidden w-8 bg-stone-300 flex-shrink-0"></div>

            <button
              onClick={() => setPlaylistShow(true)}
              className="flex cursor-pointer items-center gap-3 group hover:opacity-90 transition-opacity duration-200"
            >
              <div className="bg-primary p-2.5 rounded-full group-hover:bg-primary-dark transition-colors duration-200 shadow-sm">
                <FaPlay className="text-xs text-white" />
              </div>
              <p className="text-sm font-semibold text-stone-800 whitespace-nowrap">
                {t('hero_how_it_works')}
              </p>
            </button>

            {/* Simple Playlist Modal */}
            {playlistShow && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={() => setPlaylistShow(false)}
              >
                <div
                  className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[80vh] overflow-hidden animate-fade-in flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-700">
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">Guide de démarrage</h2>
                    <button
                      onClick={() => setPlaylistShow(false)}
                      className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors duration-200"
                    >
                      <svg className="w-5 h-5 text-stone-500 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
                    {/* Video Player */}
                    <div className="md:flex-1 flex items-center justify-center">
                      {currentVideo ? (
                        <div className="rounded-2xl overflow-hidden shadow-lg w-full max-h-[60vh] bg-black">
                          <video
                            src={currentVideo.path}
                            controls
                            className="w-full aspect-video h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-video rounded-2xl bg-stone-100 dark:bg-stone-800 flex flex-col items-center justify-center">
                          <div className="mb-4 p-4 rounded-full bg-stone-200 dark:bg-stone-700">
                            <FaPlay className="text-stone-600 dark:text-stone-200" />
                          </div>
                          <p className="text-stone-600 dark:text-stone-300 text-lg font-medium">Sélectionnez une vidéo</p>
                        </div>
                      )}
                    </div>

                    {/* Playlist */}
                    <div className="md:w-1/3 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                      <div className="space-y-2">
                        {playlist.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentVideo(item)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 shadow-sm
                  ${currentVideo?.path === item.path
                                ? 'bg-primary/20 border border-primary/30'
                                : 'hover:bg-stone-50 dark:hover:bg-stone-700'
                              }`}
                          >
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-semibold text-sm
                  ${currentVideo?.path === item.path
                                ? 'bg-primary text-white'
                                : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200'
                              }`}
                            >
                              {index + 1}
                            </div>

                            <div className="flex-1">
                              <p className="font-medium text-stone-900 dark:text-white text-sm">{item.title}</p>
                            </div>

                            {currentVideo?.path === item.path && (
                              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Footer Button */}
                      <div className="mt-auto pt-4 border-t border-stone-200 dark:border-stone-700">
                        <button
                          onClick={() => setCurrentVideo(playlist[0])}
                          className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-md"
                        >
                          <FaPlay className="text-xs" />
                          Commencer par la première étape
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          <div className="w-full">
            <p className="font-medium text-sm text-center text-stone-600 leading-relaxed">
              {t("hero_subtit_download")}{" "}
              <Link
                to="/louer/register"
                className="font-semibold text-primary hover:text-primary-dark underline underline-offset-2 transition-colors duration-200"
              >
                {t("create_acc")}{" "}
                <span className="font-bold">{t("gratuitement")}</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
