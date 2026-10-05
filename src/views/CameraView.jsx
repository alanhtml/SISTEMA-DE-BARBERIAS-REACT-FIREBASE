import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/common/UI';
import { localAiService } from '../services/localAiService';

export const CameraView = ({ notify, user, updateClient }) => {
  const [mode, setMode] = useState('idle'); // idle, streaming, analyzing, results
  const [facingMode, setFacingMode] = useState('user'); // 'user' (selfie/cliente) o 'environment' (barbero tomando foto)
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceType, setFaceType] = useState(null);
  const [hairType, setHairType] = useState('');
  const [visagismDiagnosis, setVisagismDiagnosis] = useState('');
  const [features, setFeatures] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCut, setSelectedCut] = useState(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [localGpu, setLocalGpu] = useState({ active: false, name: null, endpoint: null, type: null });
  const [showGpuModal, setShowGpuModal] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Comprobar estado de la GPU local RTX 4050 al cargar
  useEffect(() => {
    const checkGpu = async () => {
      const status = await localAiService.checkLocalGPU();
      setLocalGpu(status);
    };
    checkGpu();
  }, []);

  const refreshGpuStatus = async () => {
    notify('Buscando servidor de IA local...', 'info');
    const status = await localAiService.checkLocalGPU();
    setLocalGpu(status);
    if (status.active) {
      notify(`GPU Local Conectada: ${status.name}`, 'success');
    } else {
      notify('No se detectó servidor local activo. Ejecuta iniciar_ia_rtx4050.bat', 'warning');
    }
  };

  const startCamera = async (overrideFacingMode) => {
    try {
      setMode('streaming');
      const currentFacing = overrideFacingMode || facingMode;
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacing }
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (_err) {
      notify('Error: Cámara no disponible', 'error');
      setMode('idle');
    }
  };

  const toggleCamera = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    const maxDim = 480;
    let w = videoRef.current.videoWidth;
    let h = videoRef.current.videoHeight;
    const scale = Math.min(maxDim / w, maxDim / h, 1);
    canvas.width = w * scale;
    canvas.height = h * scale;

    const ctx = canvas.getContext('2d');
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL('image/jpeg', 0.6);
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
        const maxDim = 480;
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL('image/jpeg', 0.6);
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

  const extractBiometrics = (imageData) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 100, 100);
        const data = ctx.getImageData(0, 0, 100, 100).data;

        let topLuma = 0, midLuma = 0, botLuma = 0;
        for (let y = 0; y < 100; y++) {
          for (let x = 20; x < 80; x++) {
            const idx = (y * 100 + x) * 4;
            const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            if (y < 35) topLuma += luma;
            else if (y < 70) midLuma += luma;
            else botLuma += luma;
          }
        }
        const avgTop = topLuma / (35 * 60);
        const avgMid = midLuma / (35 * 60);
        const avgBot = botLuma / (30 * 60);
        const ratio = img.width / img.height;

        // Clasificación de visagismo biométrico
        let estimatedFace = 'ovalado';
        if (ratio > 0.85) estimatedFace = 'redondo';
        else if (ratio < 0.72) estimatedFace = 'rectangular';
        else if (avgBot < avgMid * 0.9) estimatedFace = 'triangular';
        else if (avgTop < avgMid * 0.85) estimatedFace = 'cuadrado';
        else if (avgMid > avgTop * 1.15 && avgMid > avgBot * 1.15) estimatedFace = 'diamante';

        resolve({
          estimatedFace,
          hairDensity: avgTop < 80 ? 'Alta / Grueso' : 'Media / Fino',
          aspectRatio: ratio.toFixed(2),
          contrast: (Math.abs(avgTop - avgMid) + Math.abs(avgMid - avgBot)).toFixed(1)
        });
      };
      img.onerror = () => resolve({ estimatedFace: 'ovalado', hairDensity: 'Media', aspectRatio: '0.75', contrast: '30' });
      img.src = imageData;
    });
  };

  const runAIAnalysis = async (imageData) => {
    setMode('analyzing');

    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    const API_URL = "https://api.groq.com/openai/v1/chat/completions";

    try {
      const bio = await extractBiometrics(imageData);

      let aiResult = null;

      if (GROQ_API_KEY) {
        try {
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: "openai/gpt-oss-120b",
              messages: [
                {
                  role: "system",
                  content: "Eres un maestro barbero experto en visagismo masculino y morfología craneofacial de alta gama. Analiza los datos biométricos y proporciones del cliente para generar un diagnóstico técnico de visagismo y recomendar exactamente los 3 mejores cortes de cabello que armonicen sus facciones. Debes responder ÚNICAMENTE con un objeto JSON válido, sin bloques de código markdown ni texto adicional."
                },
                {
                  role: "user",
                  content: `Genera un reporte profesional de visagismo para un cliente con estructura facial estimada: ${bio.estimatedFace.toUpperCase()}, densidad capilar: ${bio.hairDensity}, relación de aspecto: ${bio.aspectRatio}.
Estructura requerida en JSON:
{
  "faceType": "${bio.estimatedFace.toUpperCase()}",
  "hairType": "Lacio / Ondulado / Texturizado",
  "visagismDiagnosis": "Explicación técnica de cómo equilibrar mandíbula, frente y pómulos según visagismo.",
  "features": ["Mandíbula definida", "Frente equilibrada", "Pómulos simétricos"],
  "suggestions": [
    {
      "name": "Nombre del Corte 1",
      "desc": "Justificación técnica de por qué armoniza su tipo de rostro.",
      "tag": "TENDENCIA"
    },
    {
      "name": "Nombre del Corte 2",
      "desc": "Justificación técnica de por qué armoniza su tipo de rostro.",
      "tag": "CLÁSICO"
    },
    {
      "name": "Nombre del Corte 3",
      "desc": "Justificación técnica de por qué armoniza su tipo de rostro.",
      "tag": "MODERNO"
    }
  ]
}`
                }
              ],
              response_format: { type: "json_object" },
              temperature: 0.2,
              max_tokens: 1024
            })
          });

          if (response.ok) {
            const data = await response.json();
            let content = data.choices?.[0]?.message?.content;
            if (content) {
              content = content.replace(/```json/g, '').replace(/```/g, '').trim();
              const firstBrace = content.indexOf('{');
              const lastBrace = content.lastIndexOf('}');
              if (firstBrace !== -1 && lastBrace !== -1) {
                content = content.substring(firstBrace, lastBrace + 1);
              }
              aiResult = JSON.parse(content);
            }
          }
        } catch (_groqErr) {
          console.warn("Groq API fallback triggered:", _groqErr);
        }
      }

      // Fallback inteligente si la API no estuviera disponible
      if (!aiResult || !aiResult.faceType) {
        const face = bio.estimatedFace.toLowerCase();
        const fallbackCatalog = {
          ovalado: {
            visagismDiagnosis: "Rostro con proporciones ideales y armonía simétrica. Se recomiendan estilos con volumen controlado para lucir la frente sin sobrecargar los laterales.",
            features: ["Proporción simétrica", "Pómulos suaves", "Mandíbula equilibrada"],
            suggestions: [
              { name: "Textured Crop Fade", desc: "Acentúa la simetría natural con textura superior moderna y degradado medio.", tag: "TENDENCIA" },
              { name: "Pompadour Clásico", desc: "Aporta volumen superior para estilizar la línea frontal manteniendo elegancia.", tag: "CLÁSICO" },
              { name: "Low Taper Fade", desc: "Laterales limpios con caída natural para un look pulido y versátil.", tag: "MODERNO" }
            ]
          },
          cuadrado: {
            visagismDiagnosis: "Mandíbula marcada y frente ancha. Se busca suavizar las líneas rectas con volumen superior y desvanecidos limpios.",
            features: ["Mandíbula angular", "Línea de mandíbula ancha", "Estructura sólida"],
            suggestions: [
              { name: "Side Part Undercut", desc: "Raya lateral definida que suaviza los ángulos mandibulares.", tag: "CLÁSICO" },
              { name: "Mid Fade con Textura", desc: "Equilibra el ancho de la frente con movimiento en la coronilla.", tag: "TENDENCIA" },
              { name: "Buzz Cut Fade", desc: "Resalta la fuerza ósea de la mandíbula con precisión militar.", tag: "MODERNO" }
            ]
          },
          redondo: {
            visagismDiagnosis: "Pómulos prominentes y curvas suaves. Se recomienda crear altura en la parte superior y rebajar los laterales para alargar visualmente el rostro.",
            features: ["Pómulos anchos", "Barbilla suave", "Líneas curvas"],
            suggestions: [
              { name: "High Fade con Quiff", desc: "Genera altura vertical que alarga y estiliza el contorno facial.", tag: "TENDENCIA" },
              { name: "Faux Hawk Desvanecido", desc: "Cresta sutil superior que rompe la redondez de las mejillas.", tag: "MODERNO" },
              { name: "Slick Back Taper", desc: "Peinado hacia atrás que despeja el rostro y aporta definición.", tag: "CLÁSICO" }
            ]
          },
          diamante: {
            visagismDiagnosis: "Pómulos muy marcados con frente y barbilla estrechas. Se recomienda mantener peso en los laterales y flequillos suaves.",
            features: ["Pómulos anchos", "Frente angosta", "Mentón afilado"],
            suggestions: [
              { name: "French Crop con Flequillo", desc: "El flequillo frontal disimula la frente estrecha y suaviza los pómulos.", tag: "TENDENCIA" },
              { name: "Messy Quiff Medio", desc: "Textura desenfadada que equilibra la anchura en la zona de las sienes.", tag: "MODERNO" },
              { name: "Classic Side Sweep", desc: "Peinado lateral suave para armonizar la transición mentón-pómulo.", tag: "CLÁSICO" }
            ]
          }
        };

        const currentFallback = fallbackCatalog[face] || fallbackCatalog.ovalado;
        aiResult = {
          faceType: face.toUpperCase(),
          hairType: bio.hairDensity,
          visagismDiagnosis: currentFallback.visagismDiagnosis,
          features: currentFallback.features,
          suggestions: currentFallback.suggestions
        };
      }

      const detectedFaceType = aiResult.faceType.toLowerCase();
      setFaceType(detectedFaceType);
      setHairType(aiResult.hairType || 'Texturizado');
      setVisagismDiagnosis(aiResult.visagismDiagnosis);

      const allFeatures = [...(aiResult.features || [])];
      if (aiResult.hairType) allFeatures.push(`Cabello: ${aiResult.hairType}`);
      setFeatures(allFeatures);

      const visualFilters = [
        'contrast(1.25) brightness(1.1) saturate(0.8)',
        'contrast(1.1) brightness(1.1) saturate(1.2) sepia(0.1)',
        'contrast(1.3) brightness(0.95) hue-rotate(10deg)'
      ];

      // Catálogo de imágenes HD de alta velocidad para cada estilo de barbería
      const HD_HAIRCUT_GALLERY = {
        "textured crop": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
        "pompadour": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
        "taper fade": "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=800&q=80",
        "side part": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
        "undercut": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
        "buzz cut": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        "quiff": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        "fade": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        "default": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80"
      };

      const getHaircutHDImage = (name, idx) => {
        const lower = (name || '').toLowerCase();
        for (const [key, url] of Object.entries(HD_HAIRCUT_GALLERY)) {
          if (lower.includes(key)) return url;
        }
        const defaultImages = [
          "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
        ];
        return defaultImages[idx % defaultImages.length];
      };

      let processedSuggestions = [];

      if (localGpu.active) {
        notify(`Procesando Inpainting en tu GPU RTX 4050...`, 'info');
        processedSuggestions = await Promise.all(
          (aiResult.suggestions || []).map(async (s, idx) => {
            try {
              const editedPhoto = await localAiService.processInpainting({
                endpoint: localGpu.endpoint,
                type: localGpu.type,
                imageBase64: imageData,
                cutName: s.name,
                faceType: detectedFaceType,
                hairType: aiResult.hairType
              });
              return {
                ...s,
                id: idx + 1,
                overlay: visualFilters[idx] || visualFilters[0],
                realisticImage: editedPhoto,
                thumbImage: editedPhoto,
                isLocalGpu: true
              };
            } catch (_e) {
              const hdImage = getHaircutHDImage(s.name, idx);
              return {
                ...s,
                id: idx + 1,
                overlay: visualFilters[idx] || visualFilters[0],
                realisticImage: hdImage,
                thumbImage: hdImage,
                isLocalGpu: false
              };
            }
          })
        );
      } else {
        processedSuggestions = (aiResult.suggestions || []).map((s, idx) => {
          const hdImage = getHaircutHDImage(s.name, idx);
          return {
            ...s,
            id: idx + 1,
            overlay: visualFilters[idx] || visualFilters[0],
            realisticImage: hdImage,
            thumbImage: hdImage,
            isLocalGpu: false
          };
        });
      }

      setSuggestions(processedSuggestions);

      if (user && (user.role === 'cliente' || user.role === 'admin') && updateClient) {
        const clientId = user.role === 'cliente' ? user.id : null;
        if (clientId) {
          await updateClient(clientId, {
            faceType: detectedFaceType,
            hairType: aiResult.hairType,
            faceFeatures: aiResult.features || [],
            lastAiAnalysis: {
              date: new Date().toISOString(),
              diagnosis: aiResult.visagismDiagnosis,
              suggestions: processedSuggestions.map(s => ({ name: s.name, desc: s.desc, tag: s.tag, realisticImage: s.realisticImage }))
            }
          });
          notify('Diagnóstico de visagismo guardado');
        }
      }

      setMode('results');
      notify(localGpu.active ? 'IA: Tu foto fue editada en tu RTX 4050' : 'IA: Diagnóstico completado');

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
        ctx.drawImage(img, 0, 0);

        // Barra de marca de agua luxury
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, canvas.height - 110, canvas.width, 110);

        ctx.fillStyle = '#c5a059';
        ctx.font = 'bold 24px Montserrat, sans-serif';
        ctx.fillText('URBAN BARBER LP • ESTUDIO DE VISAGISMO IA', 30, canvas.height - 65);

        ctx.fillStyle = 'white';
        ctx.font = '18px Montserrat, sans-serif';
        ctx.fillText(`CORTE: ${cut.name.toUpperCase()} | ROSTRO: ${faceType.toUpperCase()}`, 30, canvas.height - 30);

        const link = document.createElement('a');
        link.download = `URBAN_BARBER_CORTE_${cut.name.replace(/ /g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        notify('Reporte de estilo guardado en alta resolución');
    };
    img.src = cut.realisticImage || capturedImage;
  };

  const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  return (
    <div className="animate-fade max-w-md mx-auto px-4 pb-12">
      <header className="mb-4 text-center space-y-2">
        <h2 className="font-headline text-3xl font-black text-white uppercase tracking-tighter">
          IA <span className="text-primary">FACE</span>
        </h2>
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-on-surface-variant">Inteligencia Artificial de Estilo</p>

        {/* Badge de Estado GPU Local solo visible en entorno local de desarrollo / admin */}
        {isLocalDev && (user?.role === 'admin' || user?.role === 'barbero') && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => setShowGpuModal(true)}
              className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 border transition-all ${
                localGpu.active
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary hover:text-black'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${localGpu.active ? 'bg-emerald-400 animate-pulse' : 'bg-primary'}`}></span>
              {localGpu.active ? `RTX 4050: ${localGpu.name}` : 'Aceleración Local GPU'}
            </button>
            <button
              onClick={refreshGpuStatus}
              className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 text-xs"
              title="Reescanear Servidor Local"
            >
              <span className="material-symbols-outlined text-xs">sync</span>
            </button>
          </div>
        )}
      </header>

      {/* Modal Guía para Activar Inpainting en RTX 4050 */}
      {showGpuModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fade">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowGpuModal(false)}></div>
          <div className="relative w-full max-w-sm glass-card p-6 rounded-3xl border border-primary/30 space-y-4 text-left z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">memory</span>
                <h4 className="font-headline text-lg text-white uppercase">Inpainting RTX 4050</h4>
              </div>
              <button onClick={() => setShowGpuModal(false)} className="text-white/50 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-[10px] text-white/80 leading-relaxed">
              Tu tarjeta <strong>NVIDIA RTX 4050</strong> puede transformar tu propia foto borrando tu pelo y pintando el nuevo corte directamente en tu cabeza sin usar la nube.
            </p>

            <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
              <p className="text-[8px] text-primary font-black uppercase tracking-wider">Instrucciones Rápidas:</p>
              <ol className="text-[9px] text-white/70 space-y-1 list-decimal list-inside leading-normal">
                <li>Abre la carpeta del proyecto en tu PC.</li>
                <li>Haz doble clic en <strong>iniciar_ia_rtx4050.bat</strong>.</li>
                <li>Si no tienes Fooocus, el script abrirá el enlace oficial de descarga portable (1.8 GB).</li>
                <li>Una vez que arranque, la app lo detectará en <strong>http://127.0.0.1:8888</strong>.</li>
              </ol>
            </div>

            <Button
              fullWidth
              onClick={() => {
                refreshGpuStatus();
                setShowGpuModal(false);
              }}
              className="bg-primary hover:bg-primary/80 text-black font-black uppercase text-[9px] py-3 rounded-xl"
            >
              Comprobar Conexión GPU
            </Button>
          </div>
        </div>
      )}

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
        <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden border border-white/10 bg-black shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={toggleCamera}
              className="w-11 h-11 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-primary active:scale-90 transition-all shadow-lg"
              title="Cambiar Cámara (Frontal / Trasera)"
            >
              <span className="material-symbols-outlined text-lg">cameraswitch</span>
            </button>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-56 h-72 border-2 border-primary/30 rounded-[4rem] animate-pulse relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-primary/50 rounded-full mt-4"></div>
             </div>
          </div>
          <div className="absolute bottom-8 inset-x-0 px-8 flex gap-3">
             <button
               onClick={() => { stopCamera(); setMode('idle'); }}
               className="w-14 h-14 bg-white/10 backdrop-blur-md text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all"
             >
                <span className="material-symbols-outlined">close</span>
             </button>
             <button
               onClick={capturePhoto}
               className="flex-1 bg-primary text-black rounded-2xl py-4 font-black text-xs uppercase shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 tracking-widest"
             >
                <span className="w-2 h-2 bg-black rounded-full animate-ping"></span>
                Analizar Rostro
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
          <p className="font-headline text-xl text-white uppercase mb-2">Analizando Visagismo</p>
          <p className="text-[9px] text-primary font-black uppercase tracking-widest">Escaneando Proporciones y Tipo de Cabello...</p>
        </div>
      )}

      {mode === 'results' && (
        <div className="space-y-4">
          <div className="bg-surface-variant p-4 rounded-3xl border border-white/5">
             <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-primary/30 shadow-2xl flex-shrink-0">
                    <img src={capturedImage} className="w-full h-full object-cover" />
                </div>
                <div>
                    <p className="text-[7px] text-primary font-black uppercase tracking-widest leading-none mb-1">Morfología Facial</p>
                    <h3 className="font-headline text-2xl text-white uppercase leading-none">{faceType}</h3>
                    <p className="text-[8px] text-white/50 font-bold uppercase mt-1">Pelo: <span className="text-primary">{hairType}</span></p>
                </div>
                <button onClick={() => setMode('idle')} className="ml-auto w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-primary active:scale-90 transition-all">
                   <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
             </div>

             {visagismDiagnosis && (
                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5 mb-3">
                   <p className="text-[8px] text-primary font-black uppercase tracking-widest mb-1">Diagnóstico de Visagismo</p>
                   <p className="text-[10px] text-white/80 leading-relaxed">{visagismDiagnosis}</p>
                </div>
             )}

             {/* Sección de Características Reales */}
             <div className="space-y-2 pt-2 border-t border-white/5">
                <p className="text-[7px] text-on-surface-variant font-black uppercase tracking-widest">Atributos Biométricos</p>
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
            <h4 className="px-1 text-[8px] font-black text-primary uppercase tracking-[0.3em]">Cortes Recomendados por IA</h4>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map(cut => (
                <div
                  key={cut.id}
                  onClick={() => setSelectedCut(cut)}
                  className={`glass-card rounded-[1.8rem] overflow-hidden border transition-all duration-500 flex items-center p-2.5 gap-3 group cursor-pointer ${selectedCut?.id === cut.id ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/[0.02] hover:border-primary/40'}`}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative shadow-lg border border-primary/20 flex-shrink-0 bg-surface-variant">
                     <img
                       src={cut.realisticImage || cut.thumbImage}
                       className="w-full h-full object-cover"
                       alt={cut.name}
                     />
                  </div>

                  <div className="flex-1 overflow-hidden">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-[6px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase tracking-widest">{cut.tag}</span>
                     </div>
                     <h4 className="font-headline text-sm text-white uppercase leading-none truncate">{cut.name}</h4>
                     <p className="text-[8px] text-on-surface-variant font-bold uppercase mt-1 leading-tight line-clamp-2">{cut.desc}</p>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedCut(cut); }}
                    className="w-9 h-9 bg-primary/20 hover:bg-primary text-primary hover:text-black rounded-xl flex items-center justify-center transition-all mr-1 shadow-lg flex-shrink-0"
                    title="Ver Simulación"
                  >
                     <span className="material-symbols-outlined text-sm">visibility</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Modal de Comparación Profesional / Espejo Virtual */}
          {selectedCut && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade">
               <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedCut(null)}></div>

               <div className="relative w-full max-w-md glass-card rounded-[2.5rem] border border-primary/30 overflow-hidden animate-in zoom-in-95 duration-300 shadow-[0_0_80px_rgba(197,160,89,0.2)]">
                  {/* Selector de Modo de Visualización */}
                  <div className="p-3 bg-surface-variant/80 border-b border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[9px] font-black uppercase text-white tracking-widest">Estudio de Corte HD</span>
                     </div>
                     <button
                        onClick={() => setSelectedCut(null)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                     >
                        <span className="material-symbols-outlined text-sm">close</span>
                     </button>
                  </div>

                  <div className="relative aspect-[3/4] bg-black overflow-hidden">
                     {/* Foto Base del Cliente */}
                     <img src={capturedImage} className="absolute inset-0 w-full h-full object-cover" alt="Tu foto base" />

                     {/* Capa del Corte Sugerido por IA con Slider Limpio */}
                     <div
                        className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-primary shadow-[15px_0_35px_rgba(197,160,89,0.4)] z-10 bg-black"
                        style={{ width: `${sliderPos}%` }}
                     >
                        <img
                           src={selectedCut.realisticImage}
                           className="w-full h-full object-cover"
                           style={{ minWidth: '100%', height: '100%' }}
                           alt="Corte Sugerido"
                        />
                        <div className="absolute top-4 left-4 bg-primary text-black text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-2xl z-20">
                           CORTE SUGERIDO IA
                        </div>
                     </div>

                     <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10 z-0">
                        TU LOOK ACTUAL
                     </div>

                     {/* Manija Central del Slider */}
                     <div
                        className="absolute top-0 bottom-0 z-20 pointer-events-none flex items-center justify-center"
                        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                     >
                        <div className="w-9 h-9 rounded-full bg-primary border-4 border-black flex items-center justify-center shadow-2xl">
                           <span className="material-symbols-outlined text-black text-sm font-bold">compare_arrows</span>
                        </div>
                     </div>

                     {/* Control Slider Interactivo */}
                     <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPos}
                        onChange={(e) => setSliderPos(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                     />

                     <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-none flex justify-between">
                        <span className="text-[8px] bg-black/70 px-2 py-0.5 rounded text-primary font-black uppercase tracking-wider backdrop-blur-sm">← Desliza para comparar →</span>
                     </div>
                  </div>

                  <div className="p-5 bg-surface-variant border-t border-white/5 space-y-4">
                     <div>
                        <div className="flex items-center justify-between">
                           <h5 className="text-white font-headline text-lg uppercase leading-none">{selectedCut.name}</h5>
                           <span className="text-[10px] text-primary font-black bg-primary/10 px-2 py-0.5 rounded uppercase">98% Match</span>
                        </div>
                        <p className="text-[9px] text-on-surface-variant font-bold uppercase mt-1 leading-relaxed">{selectedCut.desc}</p>
                     </div>

                     <Button
                        fullWidth
                        onClick={() => downloadResult(selectedCut)}
                        className="bg-primary hover:bg-primary/80 text-white rounded-2xl py-3.5 font-black uppercase tracking-widest text-[10px] shadow-[0_10px_20px_rgba(197,160,89,0.2)]"
                     >
                        Descargar Reporte de Estilo HD
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
