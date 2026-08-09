<?php
/**
 * Plugin Name: Tornomatica — Piezas
 * Description: Registra el CPT "Pieza" y sus campos ACF, expuestos al REST API para el frontend en Astro.
 * Version: 1.0.0
 * Author: Raul
 *
 * INSTALACIÓN
 * Copia este archivo en:  wp-content/mu-plugins/tornomatica-piezas.php
 * (crea la carpeta mu-plugins si no existe — los mu-plugins se activan solos)
 *
 * Requiere el plugin ACF (la versión gratuita basta, 5.11 o superior).
 */

if (!defined('ABSPATH')) {
    exit;
}

/* ------------------------------------------------------------------
 * 0. Rescatar la cabecera Authorization
 *
 * Apache y algunas configuraciones de nginx descartan la cabecera
 * Authorization antes de que llegue a PHP, y eso rompe las contraseñas
 * de aplicación con un 401. Aquí la reconstruimos.
 * ------------------------------------------------------------------ */

if (empty($_SERVER['HTTP_AUTHORIZATION'])) {
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('getallheaders')) {
        foreach (getallheaders() as $nombre => $valor) {
            if (strtolower($nombre) === 'authorization') {
                $_SERVER['HTTP_AUTHORIZATION'] = $valor;
                break;
            }
        }
    }
}

/* ------------------------------------------------------------------
 * 1. Custom Post Type: pieza
 * ------------------------------------------------------------------ */

add_action('init', function () {
    register_post_type('pieza', [
        'labels' => [
            'name'               => 'Piezas',
            'singular_name'      => 'Pieza',
            'add_new_item'       => 'Añadir nueva pieza',
            'edit_item'          => 'Editar pieza',
            'all_items'          => 'Todas las piezas',
            'search_items'       => 'Buscar piezas',
            'not_found'          => 'No hay piezas todavía',
            'menu_name'          => 'Piezas',
        ],
        'public'        => true,
        'has_archive'   => false,
        'menu_icon'     => 'dashicons-admin-generic',
        'menu_position' => 20,
        'supports'      => ['title', 'editor', 'thumbnail', 'page-attributes'],
        'rewrite'       => ['slug' => 'piezas'],

        // Imprescindible para que Astro pueda leerlas
        'show_in_rest'  => true,
        'rest_base'     => 'piezas',
    ]);
});

/* ------------------------------------------------------------------
 * 2. Campos ACF (definidos en código: no hay que crearlos a mano)
 * ------------------------------------------------------------------ */

add_action('acf/init', function () {
    if (!function_exists('acf_add_local_field_group')) {
        return;
    }

    acf_add_local_field_group([
        'key'    => 'group_pieza_ficha',
        'title'  => 'Ficha técnica',
        'fields' => [
            [
                'key'         => 'field_pieza_codigo',
                'label'       => 'Código / N° de plano',
                'name'        => 'codigo',
                'type'        => 'text',
                'instructions' => 'Ej: TE01, PRU07-PA, 10050500002',
                'wrapper'     => ['width' => '50'],
            ],
            [
                'key'         => 'field_pieza_material',
                'label'       => 'Material',
                'name'        => 'material',
                'type'        => 'text',
                'instructions' => 'Ej: Acero 12L14, Latón, Acero resulfurado',
                'wrapper'     => ['width' => '50'],
            ],
            [
                'key'         => 'field_pieza_medida',
                'label'       => 'Medida',
                'name'        => 'medida',
                'type'        => 'text',
                'instructions' => 'Ej: Redondo 19 mm, Hex. 19,05',
                'wrapper'     => ['width' => '50'],
            ],
            [
                'key'          => 'field_pieza_acabado',
                'label'        => 'Acabado',
                'name'         => 'acabado',
                'type'         => 'select',
                'choices'      => [
                    ''          => '—',
                    'natural'   => 'Natural',
                    'cromado'   => 'Cromado',
                    'pavonado'  => 'Pavonado',
                    'zincado'   => 'Zincado',
                ],
                'wrapper'      => ['width' => '50'],
            ],
            [
                'key'           => 'field_pieza_plano',
                'label'         => 'Plano (PDF)',
                'name'          => 'plano_pdf',
                'type'          => 'file',
                'return_format' => 'url',
                'mime_types'    => 'pdf',
            ],
            [
                'key'   => 'field_pieza_destacada',
                'label' => 'Destacar en la home',
                'name'  => 'destacada',
                'type'  => 'true_false',
                'ui'    => 1,
            ],
        ],
        'location' => [
            [
                [
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'pieza',
                ],
            ],
        ],
        'menu_order'   => 0,
        'position'     => 'normal',
        'style'        => 'default',

        // Imprescindible: sin esto los campos NO salen en /wp-json
        'show_in_rest' => true,
    ]);
});

/* ------------------------------------------------------------------
 * 3. CORS para el dev server de Astro
 * ------------------------------------------------------------------ */

add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');

    add_filter('rest_pre_serve_request', function ($value) {
        $permitidos = [
            'http://localhost:4321',
            'http://localhost:4322',
        ];
        $origen = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array($origen, $permitidos, true)) {
            header('Access-Control-Allow-Origin: ' . $origen);
            header('Access-Control-Allow-Methods: GET');
        }
        return $value;
    });
}, 15);

/* ------------------------------------------------------------------
 * 4. Columnas útiles en el listado del admin
 * ------------------------------------------------------------------ */

add_filter('manage_pieza_posts_columns', function ($cols) {
    $nuevas = [];
    foreach ($cols as $k => $v) {
        $nuevas[$k] = $v;
        if ($k === 'title') {
            $nuevas['codigo']   = 'Código';
            $nuevas['material'] = 'Material';
        }
    }
    return $nuevas;
});

add_action('manage_pieza_posts_custom_column', function ($col, $post_id) {
    if (in_array($col, ['codigo', 'material'], true)) {
        echo esc_html(get_field($col, $post_id) ?: '—');
    }
}, 10, 2);
