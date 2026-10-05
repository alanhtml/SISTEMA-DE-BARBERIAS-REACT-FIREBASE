/**
 * Servicio de Conexión con IA Local (NVIDIA RTX 4050)
 * Soporta Fooocus API, Stable Diffusion WebUI (A1111/Forge) y ComfyUI
 */

const LOCAL_ENDPOINTS = [
  { name: 'Fooocus API', url: 'http://127.0.0.1:8888', type: 'fooocus' },
  { name: 'SD WebUI / Forge', url: 'http://127.0.0.1:7860', type: 'sd_webui' },
  { name: 'ComfyUI', url: 'http://127.0.0.1:8188', type: 'comfyui' },
  { name: 'Fooocus Local UI', url: 'http://127.0.0.1:7865', type: 'fooocus' }
];

export const localAiService = {
  // Comprobar si el servidor local de IA está activo en la PC
  checkLocalGPU: async () => {
    for (const ep of LOCAL_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        
        let testUrl = `${ep.url}/docs`;
        if (ep.type === 'sd_webui') testUrl = `${ep.url}/sdapi/v1/options`;
        if (ep.type === 'comfyui') testUrl = `${ep.url}/system_stats`;

        const res = await fetch(testUrl, { method: 'GET', signal: controller.signal, mode: 'no-cors' });
        clearTimeout(timeoutId);
        if (res) {
          return { active: true, endpoint: ep.url, name: ep.name, type: ep.type };
        }
      } catch (_err) {
        // Servidor no activo en este puerto
      }
    }
    return { active: false, endpoint: null, name: null, type: null };
  },

  // Generar Inpainting de cabello en la GPU local
  processInpainting: async ({ endpoint, type, imageBase64, cutName, faceType, hairType }) => {
    const faceDesc = faceType ? `${faceType} face shape, ` : '';
    const prompt = `male portrait, handsome man, ${faceDesc}sporting a fresh ${cutName} haircut, ${hairType || 'textured hair'}, sharp skin fade, clean hairline, high-end barbershop portrait, 8k photorealistic, perfect lighting`;
    const negativePrompt = `ugly, deformed, blurry, bad anatomy, bad eyes, cartoon, drawing, painting`;

    // Limpiar header data:image/jpeg;base64, si viene incluido
    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    if (type === 'fooocus') {
      const response = await fetch(`${endpoint}/v1/generation/image-inpaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          negative_prompt: negativePrompt,
          input_image: cleanBase64,
          inpaint_additional_prompt: `man haircut ${cutName}`,
          inpaint_strength: 0.85,
          image_number: 1,
          performance_selection: 'Speed',
          aspect_ratios_selection: '768*1024'
        })
      });
      const data = await response.json();
      if (data && data[0]?.base64) {
        return `data:image/png;base64,${data[0].base64}`;
      } else if (data && data[0]?.url) {
        return `${endpoint}${data[0].url}`;
      }
    } else if (type === 'sd_webui') {
      const response = await fetch(`${endpoint}/sdapi/v1/img2img`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          init_images: [cleanBase64],
          prompt: prompt,
          negative_prompt: negativePrompt,
          denoising_strength: 0.55,
          steps: 20,
          width: 512,
          height: 640
        })
      });
      const data = await response.json();
      if (data.images && data.images[0]) {
        return `data:image/png;base64,${data.images[0]}`;
      }
    }

    throw new Error("No se pudo procesar la imagen en el servidor local.");
  }
};
