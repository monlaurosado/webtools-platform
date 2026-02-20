# Prompt para Codex --- Generación de Documentación Técnica

## Tarea

Genera una documentación técnica completa del proyecto a partir del
código del repositorio actual.

Debe incluir:

1.  Explicación clara del propósito del proyecto.
2.  Problema real que soluciona.
3.  Arquitectura del proyecto.
4.  Tecnologías utilizadas y justificación.
5.  Estructura de carpetas explicada.
6.  Flujo interno de funcionamiento.
7.  Instrucciones detalladas para ejecutar el proyecto en local desde
    cero.
8.  Instrucciones para build y despliegue.
9.  Posibles mejoras futuras.

La documentación debe servir para: - Un profesor que evalúa el
proyecto. - Un desarrollador externo que quiera ejecutarlo en su
máquina.

------------------------------------------------------------------------

## Contexto

Este proyecto es una herramienta interna para automatizar el
procesamiento de newsletters HTML en una empresa de marketing.

Problema que resuelve:

-   Antes el proceso era manual:
    -   Extraer enlaces (href) de un HTML.
    -   Pasarlos por un sistema de tracking.
    -   Sustituirlos uno a uno.
    -   Extraer imágenes (src).
    -   Subirlas al servidor propio.
    -   Reemplazar las URLs.
-   Cuando hay muchos enlaces distintos, el proceso es lento, repetitivo
    y propenso a errores.

La herramienta:

-   Permite subir un HTML.
-   Permite elegir si extraer atributos `href` o `src`.
-   Procesa enlaces en batch.
-   Sustituye automáticamente dentro del HTML.
-   Optimiza tiempos y reduce errores humanos.

Es la primera herramienta dentro de una futura plataforma de utilidades
internas para la empresa.

------------------------------------------------------------------------

## Persona

Actúa como un Senior Software Architect y Technical Writer.

La documentación debe:

-   Ser clara.
-   Estar bien estructurada.
-   Ser profesional.
-   Tener nivel técnico sólido.
-   No ser superficial.

------------------------------------------------------------------------

## Formato

Genera un README.md estructurado con:

-   Títulos en Markdown (#, ##, ###)
-   Secciones bien separadas
-   Bloques de código para comandos
-   Ejemplos cuando sea necesario
-   Lista clara de requisitos previos
-   Paso a paso detallado de instalación

Debe incluir obligatoriamente estas secciones:

1.  # Overview

2.  # Problem Statement

3.  # Solution Architecture

4.  # Tech Stack

5.  # Project Structure

6.  # How It Works

7.  # Installation & Setup

8.  # Environment Variables

9.  # Build & Deployment

10. # Future Improvements

11. # Author Notes

------------------------------------------------------------------------

## Tono

Profesional, técnico, claro y académico. Sin marketing exagerado.
Orientado a evaluación de máster.
