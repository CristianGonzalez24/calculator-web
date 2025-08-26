import { defineConfig } from 'vitest/config'        // <reference types="vitest" />

export default defineConfig({
    test: {
        environment: 'jsdom',                       // Simular DOM
        globals: true,                              // Para usar "describe", "it", "expect" sin importar
        setupFiles: ['./test/setup.js'],            // Archivo de configuración de Vitest
        coverage: {
            provider: 'v8',                         // Usar el proveedor de cobertura de V8
            reporter: ['text', 'json', 'html'],     // Generar reportes
            exclude: [                              // Excluir archivos de la cobertura
                'node_modules/',
                'test/',
                '**/*.config.js',
                'site.webmanifest'
            ],
            thresholds: {                           // Porcentaje mínimo de cobertura
                global: {
                    branches: 90,
                    functions: 90,
                    lines: 90,
                    statements: 90
                }
            }
        }
    }
})