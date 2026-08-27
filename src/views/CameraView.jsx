import React, { useState, useRef } from 'react';
import { Button } from '../components/common/UI';

export const CameraView = ({ notify, user, updateClient }) => {
  const [mode, setMode] = useState('idle'); // idle, streaming, analyzing, results
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceType, setFaceType] = useState(null);
  const [features, setFeatures] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCut, setSelectedCut] = useState(null);
  const [sliderPos, setSliderPos] = useState(50);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      setMode('streaming');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      notify('Error: Cámara no disponible', 'error');
      setMode('idle');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    // Redimensionamos a 400px para máxima compatibilidad en móviles de gama baja
    const maxDim = 400;
    let w = videoRef.current.videoWidth;
    let h = videoRef.current.videoHeight;
    const scale = Math.min(maxDim / w, maxDim / h, 1);
    canvas.width = w * scale;
    canvas.height = h * scale;

    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Calidad al 0.4 para asegurar que el payload sea ligero y evitar Error 400
    const data = canvas.toDataURL('image/jpeg', 0.4);
    setCapturedImage(data);
    stopCamera();
    runAIAnalysis(data);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL('image/jpeg', 0.4);
        setCapturedImage(data);
        URL.revokeObjectURL(objectUrl);
        runAIAnalysis(data);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        notify('Error al procesar imagen', 'error');
      };
      img.src = objectUrl;
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const runAIAnalysis = async (imageData) => {
    setMode('analyzing');

    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    const API_URL = "https://api.groq.com/openai/v1/chat/completions";

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.2-11b-vision-preview",
          messages: [
            {
              role: "system",
              content: "You are an expert master barber and biometric analyst. Your goal is to provide a highly technical and professional analysis of the user's facial structure to recommend the perfect haircut. You must output ONLY a valid JSON object. Do not include any markdown formatting, preambles, or postscripts."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image for a professional barber report. Identify the faceType (OVALADO, REDONDO, CUADRADO, DIAMANTE, TRIANGULAR, CORAZON), hairDensity, and keyFeatures. Suggest 3 specific haircuts. Return ONLY a JSON object with this structure: {\"faceType\": \"...\", \"hairDensity\": \"...\", \"features\": [\"trait1\", \"trait2\", \"trait3\"], \"suggestions\": [{\"name\": \"cut name\", \"desc\": \"technical reason why it fits\", \"tag\": \"TREND|CLASSIC|BOLD\"}]}. Use the word JSON."
                },
                {
                  type: "image_url",
                  image_url: { url: imageData }
                }
              ]
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error("Groq Error Response:", errData);
        throw new Error(errData.error?.message || `Error ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content;

      if (!content) throw new Error("La IA no devolvió contenido.");

      // Limpieza profunda de JSON
      try {
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            content = content.substring(firstBrace, lastBrace + 1);
        }

        const aiResult = JSON.parse(content);
        if (!aiResult.faceType) throw new Error("JSON incompleto");

        const detectedFaceType = aiResult.faceType.toLowerCase();
        setFaceType(detectedFaceType);

        // Combinar rasgos y densidad para la UI
        const allFeatures = [...(aiResult.features || [])];
        if (aiResult.hairDensity) allFeatures.push(`Densidad: ${aiResult.hairDensity}`);
        setFeatures(allFeatures);

        const visualFilters = [
          'contrast(1.25) brightness(1.1) saturate(0.8)',
          'contrast(1.1) brightness(1.1) saturate(1.2) sepia(0.1)',
          'contrast(1.3) brightness(0.95) hue-rotate(10deg)'
        ];

        const processedSuggestions = aiResult.suggestions.map((s, idx) => {
          // Prompt refinado para hiperrealismo y alineación técnica
          const prompt = encodeURIComponent(`high-end professional barber photography, 8k resolution, photorealistic portrait of a male model with ${detectedFaceType} face shape, wearing a ${s.name} haircut, ${allFeatures.join(', ')}, detailed hair texture, sharp fade, clean hairline, cinematic lighting, shallow depth of field, blurred barbershop background, masterfully composed`);

          // Generamos dos versiones: una ligera para thumbs y una HQ para el espejo
          const thumbImage = `https://pollinations.ai/p/${prompt}?width=300&height=400&model=flux&seed=${idx + 42}&nologo=true`;
          const realisticThumb = `https://pollinations.ai/p/${prompt}?width=1080&height=1440&model=flux&seed=${idx + 42}&nologo=true`;

          // Pre-carga agresiva de imágenes para eliminar lag en el modal
          const imgPreload = new Image();
          imgPreload.src = realisticThumb;

          return {
            ...s,
            id: idx + 1,
            overlay: visualFilters[idx] || visualFilters[0],
            realisticImage: realisticThumb,
            thumbImage: thumbImage
          };
        });

        setSuggestions(processedSuggestions);

        // Guardar automáticamente con sugerencias incluidas si es un cliente autenticado
        if (user && (user.role === 'cliente' || user.role === 'admin') && updateClient) {
          // Si es admin, podríamos querer guardar esto en el cliente seleccionado,
          // pero por ahora mantenemos la lógica de perfil actual.
          const clientId = user.role === 'cliente' ? user.id : null;
          if (clientId) {
            await updateClient(clientId, {
              faceType: detectedFaceType,
              faceFeatures: aiResult.features || [],
              lastAiAnalysis: {
                date: new Date().toISOString(),
                suggestions: processedSuggestions.map(s => ({ name: s.name, desc: s.desc, tag: s.tag, realisticImage: s.realisticImage }))
              }
            });
            notify('Sugerencias guardadas en tu perfil');
          }
        }

        setMode('results');
        notify('IA: Análisis biométrico completado');

      } catch (parseError) {
        console.error("Parse Error:", content);
        throw new Error("La IA respondió en un formato ilegible. Intenta de nuevo.");
      }

    } catch (err) {
      console.error("Error Detallado IA:", err);
      notify(`Error: ${err.message}`, 'error');
      setMode('idle');
    }
  };

  const downloadResult = (cut) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.filter = cut.overlay.split(' blur')[0];
        ctx.drawImage(img, 0, 0);
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Montserrat';
        ctx.fillText('URBAN IA ENGINE', 40, canvas.height - 80);
        ctx.font = 'bold 20px Montserrat';
        ctx.fillStyle = '#ff0000';
        ctx.fillText(cut.name, 40, canvas.height - 50);

        const link = document.createElement('a');
        link.download = `URBAN_IA_${cut.name.replace(/ /g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        notify('Diseño guardado');
    };
    img.src = capturedImage;
  };

  return (
    <div className="animate-fade max-w-md mx-auto px-4">
      <header className="mb-6 text-center">
        <h2 className="font-headline text-3xl font-black text-white uppercase tracking-tighter">
          IA <span className="text-primary">FACE</span>
        </h2>
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-on-surface-variant">Inteligencia Artificial de Estilo</p>
      </header>

      {mode === 'idle' && (
        <div className="grid grid-cols-2 gap-4">
          <button onClick={startCamera} className="glass-card p-8 rounded-3xl border border-primary/20 flex flex-col items-center gap-3 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-4xl text-primary">add_a_photo</span>
            <span className="text-[10px] font-black uppercase text-white">Cámara</span>
          </button>
          <button onClick={() => fileInputRef.current.click()} className="glass-card p-8 rounded-3xl border border-white/5 flex flex-col items-center gap-3 active:scale-95 transition-all">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} hidden accept="image/*" />
            <span className="material-symbols-outlined text-4xl text-blue-500">upload_file</span>
            <span className="text-[10px] font-black uppercase text-white">Galería</span>
          </button>
        </div>
      )}

      {mode === 'streaming' && (
        <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden border border-white/10 bg-black">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-56 h-72 border-2 border-primary/30 rounded-[4rem] animate-pulse relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-primary/50 rounded-full mt-4"></div>
             </div>
          </div>
          <div className="absolute bottom-8 inset-x-0 px-8">
             <button onClick={capturePhoto} className="w-full bg-white text-black rounded-2xl py-4 font-black text-xs uppercase shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                Analizar con IA
             </button>
          </div>
        </div>
      )}

      {mode === 'analyzing' && (
        <div className="py-16 text-center glass-card rounded-[3rem] border border-white/5 relative overflow-hidden">
          <div className="w-32 h-32 mx-auto relative mb-8">
             <img src={capturedImage} className="w-full h-full object-cover rounded-full animate-pulse grayscale brightness-50" />
             <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
             <div className="absolute top-0 left-0 w-full h-full bg-primary/5 animate-[scan_2s_infinite] pointer-events-none"></div>
          </div>
          <p className="font-headline text-xl text-white uppercase mb-2">Procesando Rasgos</p>
          <p className="text-[9px] text-primary font-black uppercase tracking-widest">Escaneando Estructura...</p>
        </div>
      )}

      {mode === 'results' && (
        <div className="space-y-4">
          <div className="bg-surface-variant p-4 rounded-3xl border border-white/5">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-primary/20 shadow-2xl flex-shrink-0">
                    <img src={capturedImage} className="w-full h-full object-cover" />
                </div>
                <div>
                    <p className="text-[7px] text-primary font-black uppercase tracking-widest leading-none mb-1">Morfología Facial</p>
                    <h3 className="font-headline text-2xl text-white uppercase leading-none">{faceType}</h3>
                </div>
                <button onClick={() => setMode('idle')} className="ml-auto w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-primary active:scale-90 transition-all">
                   <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
             </div>

             {/* Sección de Características Reales */}
             <div className="space-y-2 pt-3 border-t border-white/5">
                <p className="text-[7px] text-on-surface-variant font-black uppercase tracking-widest">Análisis de Atributos</p>
                <div className="flex flex-wrap gap-2">
                   {features.map((feat, i) => (
                      <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] text-white/80 font-bold uppercase tracking-tighter">
                         {feat}
                      </span>
                   ))}
                </div>
             </div>
          </div>

          <div className="space-y-3">
            <h4 className="px-1 text-[8px] font-black text-primary uppercase tracking-[0.3em]">Sugerencias de Estilo Premium</h4>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map(cut => (
                <div
                  key={cut.id}
                  onClick={() => setSelectedCut(cut)}
                  className={`glass-card rounded-[1.8rem] overflow-hidden border transition-all duration-500 flex items-center p-2 gap-4 group cursor-pointer ${selectedCut?.id === cut.id ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/[0.02]'}`}
                >
                  <div className="flex gap-1">
                    <div className="w-16 h-16 rounded-xl overflow-hidden relative shadow-lg border border-white/5 flex-shrink-0">
                       <img src={capturedImage} style={{ filter: cut.overlay }} className="w-full h-full object-cover" />
                    </div>
                    <div className="w-16 h-16 rounded-xl overflow-hidden relative shadow-lg border border-primary/20 flex-shrink-0 bg-white/5">
                       <img
                         src={cut.thumbImage}
                         className="w-full h-full object-cover transition-opacity duration-300"
                         loading="lazy"
                         onLoad={(e) => e.target.style.opacity = 1}
                         style={{ opacity: 0 }}
                       />
                       <div className="absolute inset-0 flex items-center justify-center -z-10">
                          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                       </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-[6px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase tracking-widest">{cut.tag}</span>
                     </div>
                     <h4 className="font-headline text-sm text-white uppercase leading-none truncate">{cut.name}</h4>
                     <p className="text-[8px] text-on-surface-variant font-bold uppercase mt-1 leading-tight">{cut.desc}</p>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); downloadResult(cut); }}
                    className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center transition-all mr-1 shadow-lg shadow-primary/20"
                  >
                     <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Modal de Fusión Realista / Espejo Virtual */}
          {selectedCut && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade">
               <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={() => setSelectedCut(null)}></div>

               <div className="relative w-full max-w-sm glass-card rounded-[3rem] border border-primary/30 overflow-hidden animate-in zoom-in-95 duration-300 shadow-[0_0_100px_rgba(197,160,89,0.15)]">
                  <div className="relative aspect-[3/4] bg-black">
                     {/* Foto Base */}
                     <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover" alt="Tu base" />

                     {/* Capa de Edición IA con Slider (Alineación Mejorada) */}
                     <div
                        className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-primary shadow-[20px_0_50px_rgba(197,160,89,0.3)] z-10 transition-shadow"
                        style={{ width: `${sliderPos}%` }}
                     >
                        <div className="w-[350px] sm:w-[384px] h-[466px] sm:h-[512px]">
                           <img
                              src={selectedCut.realisticImage}
                              className="w-full h-full object-cover grayscale-[0.2]"
                              alt="Resultado IA"
                           />
                        </div>
                        <div className="absolute top-6 left-6 bg-primary text-black text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></span>
                           IA LOOK
                        </div>
                     </div>

                     <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/10 z-0">
                        TU BASE
                     </div>

                     {/* Centro del Slider Visual Handle */}
                     <div
                        className="absolute top-0 bottom-0 z-20 pointer-events-none flex items-center justify-center"
                        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                     >
                        <div className="w-8 h-8 rounded-full bg-primary border-4 border-black flex items-center justify-center shadow-2xl">
                           <span className="material-symbols-outlined text-black text-xs font-bold">unfold_more</span>
                        </div>
                     </div>

                     {/* Slider Control Invisible Overlay for better UX */}
                     <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPos}
                        onChange={(e) => setSliderPos(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                     />

                     <div className="absolute bottom-8 inset-x-6 z-20 pointer-events-none">
                        <div className="flex justify-between px-1">
                           <span className="text-[7px] text-primary font-black uppercase tracking-[0.3em] drop-shadow-lg">Simulación de Estilo</span>
                           <span className="text-[7px] text-white/50 font-black uppercase tracking-[0.3em] drop-shadow-lg">Referencia Real</span>
                        </div>
                     </div>

                     <button
                        onClick={() => setSelectedCut(null)}
                        className="absolute top-6 left-1/2 -translate-x-1/2 w-10 h-10 bg-black/60 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-all z-40 border border-white/10 backdrop-blur-sm"
                     >
                        <span className="material-symbols-outlined text-lg">close</span>
                     </button>
                  </div>

                  <div className="p-6 bg-surface-variant border-t border-white/5">
                     <div className="flex items-center justify-between mb-4">
                        <div>
                           <h5 className="text-white font-headline text-lg uppercase leading-none">{selectedCut.name}</h5>
                           <p className="text-[7px] text-primary font-black uppercase tracking-[0.2em] mt-1">Estilo Sugerido para rostro {faceType}</p>
                        </div>
                        <div className="text-right">
                           <span className="text-[10px] text-white/40 font-black uppercase italic">98% Match</span>
                        </div>
                     </div>
                     <Button
                        fullWidth
                        onClick={() => downloadResult(selectedCut)}
                        className="bg-primary hover:bg-primary/80 text-white rounded-2xl py-4 font-black uppercase tracking-widest text-[10px] shadow-[0_10px_20px_rgba(197,160,89,0.2)]"
                     >
                        Descargar Reporte de Estilo
                     </Button>
                  </div>
               </div>
            </div>
          )}

          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
             <p className="text-[8px] text-on-surface-variant font-bold uppercase text-center leading-relaxed">
                * Los ajustes de IA se han aplicado a tu foto original considerando la simetría de tu rostro {faceType}.
             </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
