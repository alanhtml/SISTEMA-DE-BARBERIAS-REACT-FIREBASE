@echo off
title URBAN BARBER LP - MOTOR IA LOCAL (NVIDIA RTX 4050)
color 06
cls
echo =========================================================================
echo       URBAN BARBER LP - SERVIDOR IA LOCAL DE VISAGISMO E INPAINTING
echo =========================================================================
echo   [!] Detectando GPU NVIDIA RTX 4050...
echo.

if exist "Fooocus\run.bat" (
    echo   [+] Fooocus detectado. Iniciando motor de IA con aceleracion CUDA...
    cd Fooocus
    call run.bat --listen --port 8888
) else if exist "..\Fooocus\run.bat" (
    echo   [+] Fooocus detectado en directorio superior. Iniciando...
    cd ..\Fooocus
    call run.bat --listen --port 8888
) else (
    echo   [?] No se encontro la carpeta portable de Fooocus en esta ruta.
    echo.
    echo   =====================================================================
    echo   PASOS DE INSTALACION RAPIDA (1 SOLA VEZ):
    echo   =====================================================================
    echo   1. Descarga el paquete portable oficial de Fooocus (1.8 GB):
    echo      https://github.com/lllyasviel/Fooocus/releases/download/v2.5.0/Fooocus_win64_2-5-0.7z
    echo.
    echo   2. Descomprime la carpeta 'Fooocus' aqui mismo en:
    echo      %~dp0Fooocus
    echo.
    echo   3. Vuelve a ejecutar este archivo 'iniciar_ia_rtx4050.bat'.
    echo   =====================================================================
    echo.
    echo   Presiona cualquier tecla para abrir el enlace de descarga de Fooocus...
    pause >nul
    start https://github.com/lllyasviel/Fooocus/releases
)
